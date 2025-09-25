'use client';

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Upload, FileText, AlertCircle, AlertTriangle, CheckCircle, X, Download, RefreshCw, Trash2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useDashboard } from '@/contexts/DashboardContext';
import {
  parseCSVWithIssues,
  validateCSVData,
  downloadValidationReport,
  type ValidationResult,
  type IssueDetail
} from '@/utils/dataImport';
import type { CarInsuranceRecord, ImportSourceMeta } from '@/types';
import { summariseRecordsSources } from '@/utils/dataStore';

interface DataImportProps {
  onClose: () => void;
}

interface ProcessedFile {
  id: string;
  fileName: string;
  size: number;
  records: CarInsuranceRecord[];
  validation: ValidationResult;
  issues: IssueDetail[];
  meta: ImportSourceMeta;
}

/**
 * 数据导入组件
 * 支持CSV文件拖拽上传、数据验证和导入功能
 */
export default function DataImport({ onClose }: DataImportProps) {
  const { loadDataFromRecords, updateComparison } = useDashboard();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 组件状态
  const [dragActive, setDragActive] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [stage, setStage] = useState<'idle' | 'processing' | 'ready' | 'importing' | 'success'>('idle');
  const [globalWarnings, setGlobalWarnings] = useState<string[]>([]);

  const allRecords = useMemo(
    () => processedFiles.flatMap(file => file.records),
    [processedFiles]
  );

  const uniquePeriods = useMemo(() => {
    const keys = new Map<string, { year: number; week: number; source: string }>();
    processedFiles.forEach(file => {
      file.records.forEach(record => {
        if (!record.policy_start_year || !record.week_number) return;
        const key = `${record.policy_start_year}-${record.week_number}`;
        if (!keys.has(key)) {
          keys.set(key, { year: record.policy_start_year, week: record.week_number, source: file.fileName });
        } else {
          const existed = keys.get(key);
          if (existed && existed.source !== file.fileName) {
            keys.set(key, { ...existed, source: `${existed.source} / ${file.fileName}` });
          }
        }
      });
    });
    return Array.from(keys.values()).sort((a, b) =>
      a.year === b.year ? a.week - b.week : a.year - b.year
    );
  }, [processedFiles]);

  const duplicateWeeks = useMemo(() => {
    const seen = new Map<string, string>();
    const duplicates = new Map<string, Set<string>>();
    processedFiles.forEach(file => {
      file.records.forEach(record => {
        if (!record.policy_start_year || !record.week_number) return;
        const key = `${record.policy_start_year}-${record.week_number}`;
        if (!seen.has(key)) {
          seen.set(key, file.fileName);
        } else {
          if (!duplicates.has(key)) {
            duplicates.set(key, new Set([seen.get(key)!]));
          }
          duplicates.get(key)!.add(file.fileName);
        }
      });
    });
    return Array.from(duplicates.entries()).map(([key, sources]) => `${key}（${Array.from(sources).join('、')}）`);
  }, [processedFiles]);

  useEffect(() => {
    if (processedFiles.length === 0) {
      setGlobalWarnings([]);
      if (stage !== 'importing' && stage !== 'success' && stage !== 'idle') {
        setStage('idle');
      }
      return;
    }

    const warnings: string[] = [];
    processedFiles.forEach(file => {
      if (file.validation.warnings.length > 0) {
        file.validation.warnings.forEach(w => warnings.push(`${file.fileName}: ${w}`));
      }
      if (file.validation.errors.length > 0) {
        file.validation.errors.forEach(e => warnings.push(`${file.fileName}: ${e}`));
      }
      file.issues
        .filter(issue => issue.level === 'warning')
        .forEach(issue => warnings.push(`${file.fileName}: ${issue.message}`));
      file.issues
        .filter(issue => issue.level === 'error')
        .forEach(issue => warnings.push(`${file.fileName}: ${issue.message}`));
    });
    if (duplicateWeeks.length > 0) {
      warnings.push(`重复周次：${duplicateWeeks.join('；')}`);
    }
    setGlobalWarnings(Array.from(new Set(warnings)));
    if (stage !== 'importing' && stage !== 'success' && stage !== 'ready') {
      setStage('ready');
    }
  }, [processedFiles, stage, duplicateWeeks]);

  /**
   * 处理文件拖拽进入
   */
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  /**
   * 处理文件拖拽离开
   */
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  /**
   * 处理文件拖拽悬停
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const processFiles = useCallback(async (files: File[]) => {
    const csvFiles = files.filter(f => f.name.toLowerCase().endsWith('.csv'));
    const oversize = csvFiles.filter(f => f.size > 50 * 1024 * 1024);
    if (oversize.length > 0) {
      alert(`以下文件超过50MB，已跳过：\n${oversize.map(f => f.name).join('\n')}`);
    }
    const payload = csvFiles.filter(f => f.size <= 50 * 1024 * 1024);
    if (payload.length === 0) return;

    setStage('processing');

    const results: ProcessedFile[] = [];

    for (const file of payload) {
      try {
        const text = await file.text();
        const { records, parseIssues, skippedRows } = parseCSVWithIssues(text);
        const validation = validateCSVData(records);
        const issues = [...validation.issues];
        parseIssues.forEach(issue => issues.push({ ...issue }));
        const hasParseErrors = parseIssues.some(issue => issue.level === 'error');
        const mergedValidation: ValidationResult = {
          ...validation,
          isValid: validation.isValid && !hasParseErrors,
          issues,
          skippedRows: (validation.skippedRows || 0) + skippedRows,
          recordCount: records.length
        };
        const meta = summariseRecordsSources(records, file.name);
        results.push({
          id: `${file.name}-${file.lastModified}`,
          fileName: file.name,
          size: file.size,
          records,
          validation: mergedValidation,
          issues,
          meta
        });
      } catch (error) {
        console.error('文件处理失败:', error);
        alert(`${file.name} 解析失败，请确认格式。`);
      }
    }

    setProcessedFiles(prev => {
      const map = new Map(prev.map(item => [item.id, item]));
      results.forEach(item => map.set(item.id, item));
      return Array.from(map.values());
    });
  }, []);

  /**
   * 处理文件拖拽放下
   */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  /**
   * 处理文件输入变化
   */
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(Array.from(files));
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFiles]);

  useEffect(() => {
    if (duplicateWeeks.length > 0) {
      setGlobalWarnings(prev => Array.from(new Set([...prev, `存在重复周次: ${duplicateWeeks.join('；')}`])));
    }
  }, [duplicateWeeks]);

  /**
   * 导入数据
   */
  const importData = useCallback(async () => {
    const allValid = processedFiles.length > 0 && processedFiles.every(file => file.validation.isValid);
    if (!allValid || allRecords.length === 0) return;

    setStage('importing');
    try {
      const sources = processedFiles.map(file => file.meta);
      await loadDataFromRecords(allRecords, {
        mode: 'replace',
        sources,
        warnings: globalWarnings
      });

      if (uniquePeriods.length >= 2) {
        const current = uniquePeriods[uniquePeriods.length - 1];
        const compare = uniquePeriods[uniquePeriods.length - 2];
        updateComparison({
          type: 'custom',
          currentPeriod: { year: current.year, weekStart: current.week, weekEnd: current.week },
          comparePeriod: { year: compare.year, weekStart: compare.week, weekEnd: compare.week },
          enabled: true
        });
      }

      setStage('success');
      
      // 3秒后自动关闭
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error('数据导入失败:', error);
      alert(error instanceof Error ? error.message : '数据导入失败');
      setStage('ready');
    }
  }, [allRecords, processedFiles, globalWarnings, loadDataFromRecords, onClose, uniquePeriods, updateComparison]);

  /**
   * 下载验证报告
   */
  const downloadReport = useCallback(() => {
    if (processedFiles.length === 0) return;
    const aggregated: ValidationResult = {
      isValid: processedFiles.every(file => file.validation.isValid),
      errors: processedFiles.flatMap(file => file.validation.errors.map(err => `${file.fileName}: ${err}`)),
      warnings: processedFiles.flatMap(file => file.validation.warnings.map(warn => `${file.fileName}: ${warn}`)),
      recordCount: allRecords.length,
      issues: processedFiles.flatMap(file =>
        file.issues.map(issue => ({
          ...issue,
          message: `[${file.fileName}] ${issue.message}`
        }))
      ),
      skippedRows: processedFiles.reduce((sum, file) => sum + (file.validation.skippedRows || 0), 0)
    };
    downloadValidationReport(aggregated, `数据验证报告_${new Date().toISOString().slice(0, 10)}.txt`);
  }, [processedFiles, allRecords.length]);

  /**
   * 重置状态
   */
  const resetState = useCallback(() => {
    setProcessedFiles([]);
    setStage('idle');
    setGlobalWarnings([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const removeFile = useCallback((id: string) => {
    setProcessedFiles(prev => prev.filter(file => file.id !== id));
  }, []);

  const totalRecords = allRecords.length;

  const totalYears = useMemo(() => {
    const set = new Set<number>();
    allRecords.forEach(record => record.policy_start_year && set.add(record.policy_start_year));
    return Array.from(set).sort((a, b) => a - b);
  }, [allRecords]);

  const canImport = processedFiles.length > 0 && processedFiles.every(file => file.validation.isValid) && stage !== 'importing';

  const topIssues = useMemo(() => {
    const entries: Array<{ message: string; level: IssueDetail['level'] }> = [];
    processedFiles.forEach(file => {
      file.issues.slice(0, 3).forEach(issue => {
        entries.push({ message: `[${file.fileName}] 第${issue.row}行: ${issue.message}`, level: issue.level });
      });
    });
    return entries.slice(0, 5);
  }, [processedFiles]);

  return (
    <div className="space-y-6">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">数据导入</h2>
          <p className="text-muted-foreground text-sm mt-1">
            支持CSV格式的车险数据文件导入
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* 成功提示 */}
      {stage === 'success' && (
        <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium text-green-800">数据导入成功！</p>
            <p className="text-sm text-green-600">页面将在3秒后自动关闭</p>
          </div>
        </div>
      )}

      {/* 文件上传区域 */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          processedFiles.length > 0 ? "bg-muted/30" : "hover:bg-muted/50"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="space-y-4">
          <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <p className="text-lg font-medium">拖拽一个或多个CSV文件到此处</p>
            <p className="text-muted-foreground">或者</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              选择文件
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            单个文件大小不超过50MB，支持批量上传不同周次数据
          </p>
        </div>
      </div>

      {/* 文件列表与验证情况 */}
      {processedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">待导入文件</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={downloadReport}
                className="flex items-center space-x-2 px-3 py-1 text-sm border border-muted-foreground/25 rounded-lg hover:bg-muted transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>下载验证报告</span>
              </button>
              <button
                onClick={resetState}
                className="flex items-center space-x-2 px-3 py-1 text-sm border border-muted-foreground/25 rounded-lg hover:bg-muted transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>清空全部</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {processedFiles.map(file => (
              <div key={file.id} className="border rounded-lg p-4 space-y-3 bg-card">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="font-medium text-sm">{file.fileName}</span>
                      <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                    <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
                      <span>记录数 {file.validation.recordCount.toLocaleString('zh-CN')}</span>
                      <span>年度 {file.meta.years.join(', ') || '—'}</span>
                      <span>周次 {file.meta.weeks.join(', ') || '—'}</span>
                      {typeof file.validation.skippedRows === 'number' && file.validation.skippedRows > 0 && (
                        <span className="text-amber-600">跳过行 {file.validation.skippedRows}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {file.validation.isValid ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                        <CheckCircle className="h-3 w-3" /> 通过
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
                        <AlertCircle className="h-3 w-3" /> 待修复
                      </span>
                    )}
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="移除文件"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {(file.validation.warnings.length > 0 || file.validation.errors.length > 0 || file.issues.length > 0) && (
                  <div className="space-y-2 text-xs">
                    {file.validation.errors.length > 0 && (
                      <div className="flex items-start gap-2 text-red-600">
                        <AlertCircle className="h-3.5 w-3.5 mt-0.5" />
                        <div className="space-y-1">
                          {file.validation.errors.slice(0, 3).map((error, index) => (
                            <div key={index}>错误：{error}</div>
                          ))}
                          {file.validation.errors.length > 3 && <div>… 还有 {file.validation.errors.length - 3} 条错误</div>}
                        </div>
                      </div>
                    )}
                    {file.validation.warnings.length > 0 && (
                      <div className="flex items-start gap-2 text-amber-600">
                        <AlertTriangle className="h-3.5 w-3.5 mt-0.5" />
                        <div className="space-y-1">
                          {file.validation.warnings.slice(0, 3).map((warning, index) => (
                            <div key={index}>警告：{warning}</div>
                          ))}
                          {file.validation.warnings.length > 3 && <div>… 还有 {file.validation.warnings.length - 3} 条警告</div>}
                        </div>
                      </div>
                    )}
                    {file.issues.length > 0 && (
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <AlertTriangle className="h-3.5 w-3.5 mt-0.5" />
                        <div className="space-y-1">
                          {file.issues.slice(0, 3).map((issue, index) => (
                            <div key={index}>
                              {issue.level === 'error' ? '错误' : '提示'}：第{issue.row}行 {issue.message}
                            </div>
                          ))}
                          {file.issues.length > 3 && <div>… 还有 {file.issues.length - 3} 条问题明细</div>}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 汇总摘要 */}
      {processedFiles.length > 0 && (
        <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">导入摘要</p>
              <p className="text-xs text-muted-foreground">共 {processedFiles.length} 个文件，累计 {totalRecords.toLocaleString('zh-CN')} 条记录</p>
            </div>
            {stage === 'processing' && (
              <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" /> 正在解析...
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-muted-foreground">
            <div className="p-3 rounded bg-background border">
              <p className="text-muted-foreground/80">覆盖年度</p>
              <p className="text-sm font-medium text-foreground mt-1">{totalYears.length > 0 ? totalYears.join('、') : '—'}</p>
            </div>
            <div className="p-3 rounded bg-background border">
              <p className="text-muted-foreground/80">周次数量</p>
              <p className="text-sm font-medium text-foreground mt-1">{uniquePeriods.length}</p>
            </div>
            <div className="p-3 rounded bg-background border">
              <p className="text-muted-foreground/80">最近周次</p>
              <p className="text-sm font-medium text-foreground mt-1">
                {uniquePeriods.length > 0
                  ? `${uniquePeriods[uniquePeriods.length - 1].year}年第${uniquePeriods[uniquePeriods.length - 1].week}周`
                  : '—'}
              </p>
            </div>
          </div>

          {duplicateWeeks.length > 0 && (
            <div className="flex items-start gap-2 text-xs text-amber-600">
              <AlertTriangle className="h-4 w-4 mt-0.5" />
              <div>
                检测到重复周次：{duplicateWeeks.join('；')}。导入后将合并数据，请确认是否需要清理重复行。
              </div>
            </div>
          )}

          {topIssues.length > 0 && (
            <div className="space-y-2 text-xs">
              <p className="font-medium text-muted-foreground/80">关键提醒</p>
              <ul className="space-y-1">
                {topIssues.map((issue, index) => (
                  <li key={index} className={cn('flex items-start gap-2', issue.level === 'error' ? 'text-red-600' : 'text-amber-600')}>
                    <span>•</span>
                    <span>{issue.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm border border-muted-foreground/25 rounded-lg hover:bg-muted transition-colors"
        >
          取消
        </button>
        
        <button
          onClick={importData}
          disabled={!canImport}
          className={cn(
            'flex items-center space-x-2 px-4 py-2 text-sm rounded-lg transition-colors',
            canImport ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border border-dashed text-muted-foreground cursor-not-allowed'
          )}
        >
          {stage === 'importing' && <RefreshCw className="h-4 w-4 animate-spin" />}
          <span>
            {stage === 'importing' ? '导入中...' : '保存并导入'}
          </span>
        </button>
      </div>
    </div>
  );
}
