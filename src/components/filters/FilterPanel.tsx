"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, X, RotateCcw } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useDashboard } from '@/contexts/DashboardContext';
import { getFilterOptions, createDefaultFilters, filterData } from '@/utils/dataLoader';
import type { FilterState } from '@/types';
import { encodeFiltersToQuery, decodeFiltersFromQuery, FILTERS_QUERY_KEY } from '@/utils/filterSerialization';

export default function FilterPanel() {
  const { state, updateFilters } = useDashboard();
  const router = useRouter();
  const searchParams = useSearchParams();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFilters, setExpandedFilters] = useState<string[]>(['policy_start_year', 'week_number', 'third_level_organization', 'insurance_type', 'coverage_type']);
  const [filterOptions, setFilterOptions] = useState<any>({});
  const [draftFilters, setDraftFilters] = useState<FilterState>(state.filters);
  const [applyErrors, setApplyErrors] = useState<string[]>([]);
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  // 当数据加载完成后，计算可用的筛选选项
  useEffect(() => {
    if (state.data.length > 0) {
      const options = getFilterOptions(state.data);
      setFilterOptions(options);
    }
  }, [state.data]);

  // 同步全局筛选到草稿（例如导入数据后）
  useEffect(() => {
    setDraftFilters(state.filters);
  }, [state.filters]);

  useEffect(() => {
    if (panelCollapsed) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setPanelCollapsed(true);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [panelCollapsed]);

  // 从URL或本地存储恢复筛选
  useEffect(() => {
    const urlFilters = decodeFiltersFromQuery(searchParams.toString());
    if (urlFilters) {
      setDraftFilters(urlFilters);
      // 延后应用以确保数据已加载
      setTimeout(() => updateFilters(urlFilters), 0);
      return;
    }
    try {
      const raw = localStorage.getItem('filters:last');
      if (raw) {
        const saved = JSON.parse(raw) as FilterState;
        setDraftFilters(saved);
        setTimeout(() => updateFilters(saved), 0);
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 筛选器基础配置
  const baseFilterConfigs = useMemo(() => ([
    {
      id: 'policy_start_year',
      name: '保单起期年度',
      type: 'multiSelect' as const,
      required: true
    },
    {
      id: 'week_number',
      name: '周次',
      type: 'multiSelect' as const,
      required: true
    },
    {
      id: 'third_level_organization',
      name: '三级机构',
      type: 'multiSelect' as const
    },
    {
      id: 'insurance_type',
      name: '保险类型',
      type: 'multiSelect' as const
    },
    {
      id: 'coverage_type',
      name: '险种',
      type: 'multiSelect' as const
    },
    {
      id: 'business_type_category',
      name: '业务类型',
      type: 'multiSelect' as const
    },
    {
      id: 'customer_category_3',
      name: '客户分类',
      type: 'multiSelect' as const
    },
    {
      id: 'renewal_status',
      name: '续期状态',
      type: 'multiSelect' as const
    },
    {
      id: 'terminal_source',
      name: '终端来源',
      type: 'multiSelect' as const
    },
    {
      id: 'is_new_energy_vehicle',
      name: '新能源车',
      type: 'select' as const,
      options: [
        { label: '全部', value: null },
        { label: '是', value: true },
        { label: '否', value: false }
      ]
    },
    {
      id: 'is_transferred_vehicle',
      name: '过户车',
      type: 'select' as const,
      options: [
        { label: '全部', value: null },
        { label: '是', value: true },
        { label: '否', value: false }
      ]
    },
    {
      id: 'vehicle_insurance_grade',
      name: '车险等级',
      type: 'multiSelect' as const
    },
    {
      id: 'highway_risk_grade',
      name: '公路风险等级',
      type: 'multiSelect' as const
    },
    {
      id: 'large_truck_score',
      name: '大货车评分',
      type: 'multiSelect' as const
    },
    {
      id: 'small_truck_score',
      name: '小货车评分',
      type: 'multiSelect' as const
    }
  ]), []);

  /**
   * 计算货车评分筛选器的可见性与联动提示
   */
  const truckFilterVisibility = useMemo(() => {
    const selections = draftFilters.business_type_category;
    const hasSelection = selections.length > 0;
    const hasTruck = selections.some(value => value.includes('货车'));
    const includesLargeTruck = selections.includes('9吨以上货车');
    const includesOtherTruck = selections.some(value => value.includes('货车') && value !== '9吨以上货车');

    const showLarge = !hasSelection || hasTruck;
    const showSmall = !hasSelection || (hasTruck && (!includesLargeTruck || includesOtherTruck));

    return {
      showLarge,
      showSmall,
      highlightPassenger: selections.includes('非营业个人客车')
    };
  }, [draftFilters.business_type_category]);

  const filterConfigs = useMemo(() => {
    return baseFilterConfigs.filter(config => {
      if (config.id === 'large_truck_score') {
        return truckFilterVisibility.showLarge;
      }
      if (config.id === 'small_truck_score') {
        return truckFilterVisibility.showSmall;
      }
      return true;
    });
  }, [baseFilterConfigs, truckFilterVisibility.showLarge, truckFilterVisibility.showSmall]);

  // 当业务类型不支持货车评分时自动清空相关筛选
  useEffect(() => {
    if (!truckFilterVisibility.showLarge && draftFilters.large_truck_score.length > 0) {
      setDraftFilters(prev => ({
        ...prev,
        large_truck_score: []
      }));
    }
    if (!truckFilterVisibility.showSmall && draftFilters.small_truck_score.length > 0) {
      setDraftFilters(prev => ({
        ...prev,
        small_truck_score: []
      }));
    }
  }, [truckFilterVisibility.showLarge, truckFilterVisibility.showSmall, draftFilters.large_truck_score.length, draftFilters.small_truck_score.length]);

  // 选择非营业个人客车时自动展开车险等级筛选
  useEffect(() => {
    if (truckFilterVisibility.highlightPassenger) {
      setExpandedFilters(prev => (
        prev.includes('vehicle_insurance_grade')
          ? prev
          : [...prev, 'vehicle_insurance_grade']
      ));
    }
  }, [truckFilterVisibility.highlightPassenger]);

  const toggleFilter = (filterId: string) => {
    setExpandedFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const handleFilterChange = (filterId: string, value: any) => {
    setDraftFilters(prev => ({
      ...prev,
      [filterId]: value
    }));
  };

  const handleMultiSelectChange = (filterId: string, option: any) => {
    const currentValues = draftFilters[filterId as keyof FilterState] as any[];
    const newValues = currentValues.includes(option)
      ? currentValues.filter(v => v !== option)
      : [...currentValues, option];

    handleFilterChange(filterId, newValues);
  };

  // 多选批量操作
  const selectAll = (filterId: string, options: any[]) => {
    handleFilterChange(filterId, [...options]);
  };

  const clearAll = (filterId: string) => {
    handleFilterChange(filterId, []);
  };

  const invertSelect = (filterId: string, options: any[]) => {
    const currentValues = draftFilters[filterId as keyof FilterState] as any[];
    const set = new Set(currentValues);
    const inverted = options.filter(o => !set.has(o));
    handleFilterChange(filterId, inverted);
  };

  // 周次范围快速选择
  const [weekStartInput, setWeekStartInput] = useState<number | ''>('');
  const [weekEndInput, setWeekEndInput] = useState<number | ''>('');
  const applyWeekRange = (opts: number[]) => {
    if (weekStartInput === '' || weekEndInput === '') return;
    const start = Math.min(Number(weekStartInput), Number(weekEndInput));
    const end = Math.max(Number(weekStartInput), Number(weekEndInput));
    const inRange = opts.filter((w) => w >= start && w <= end);
    handleFilterChange('week_number', inRange);
  };

  const commitFilters = useCallback((next: FilterState, collapseAfter = true) => {
    setDraftFilters(next);
    setApplyErrors([]);
    updateFilters(next);
    try {
      localStorage.setItem('filters:last', JSON.stringify(next));
    } catch {}
    if (typeof window !== 'undefined') {
      const query = encodeFiltersToQuery(next);
      const url = `${window.location.pathname}?${query}`;
      router.replace(url);
    }
    if (collapseAfter) {
      setPanelCollapsed(true);
    }
  }, [router, updateFilters]);

  const getFilteredOptions = (options: any[], searchTerm: string) => {
    if (!searchTerm) return options;
    return options.filter(option =>
      option.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getActiveFilterCount = (filters: FilterState) => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) count++;
      if (value !== null && !Array.isArray(value) && value !== '') count++;
    });
    return count;
  };

  const hasActiveFilters = getActiveFilterCount(draftFilters) > 0;

  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(draftFilters) !== JSON.stringify(state.filters);
  }, [draftFilters, state.filters]);

  const previewCount = useMemo(() => {
    if (state.data.length === 0) return 0;
    return filterData(state.data, draftFilters).length;
  }, [draftFilters, state.data]);

  const quickActions = useMemo(() => {
    const years = Array.isArray(filterOptions.policy_start_year) ? [...filterOptions.policy_start_year].sort((a: number, b: number) => b - a) : [];
    const weeks = Array.isArray(filterOptions.week_number) ? [...filterOptions.week_number].sort((a: number, b: number) => b - a) : [];
    const latestYear = years[0];
    const latestWeek = weeks[0];
    return [
      {
        key: 'latest-week',
        label: latestWeek ? `最新周(${latestWeek})` : '最新周',
        disabled: !latestWeek,
        apply: () => commitFilters({
          ...draftFilters,
          week_number: latestWeek ? [latestWeek] : []
        })
      },
      {
        key: 'recent-four',
        label: '最近4周',
        disabled: weeks.length === 0,
        apply: () => commitFilters({
          ...draftFilters,
          week_number: weeks.slice(0, 4).sort((a, b) => a - b)
        })
      },
      {
        key: 'current-year',
        label: latestYear ? `${latestYear}年度` : '本年度',
        disabled: !latestYear,
        apply: () => commitFilters({
          ...draftFilters,
          policy_start_year: latestYear ? [latestYear] : []
        })
      },
      {
        key: 'commercial-only',
        label: '仅商业险',
        disabled: !(Array.isArray(filterOptions.insurance_type) && filterOptions.insurance_type.includes('商业保险')),
        apply: () => commitFilters({
          ...draftFilters,
          insurance_type: ['商业保险']
        })
      }
    ];
  }, [filterOptions, draftFilters, commitFilters]);

  const validateRequired = (filters: FilterState) => {
    const errors: string[] = [];
    if (!filters.policy_start_year || filters.policy_start_year.length === 0) {
      errors.push('请选择保单起期年度');
    }
    if (!filters.week_number || filters.week_number.length === 0) {
      errors.push('请选择周次');
    }
    return errors;
  };

  const isDraftValid = useMemo(() => validateRequired(draftFilters).length === 0, [draftFilters]);

  const applyDraft = () => {
    const errs = validateRequired(draftFilters);
    setApplyErrors(errs);
    if (errs.length > 0) return;
    commitFilters({ ...draftFilters });
  };

  const cancelDraft = () => {
    setDraftFilters(state.filters);
    setApplyErrors([]);
  };

  const resetDraft = () => {
    setDraftFilters(createDefaultFilters());
    setApplyErrors([]);
  };

  // 方案保存/加载
  const [presetName, setPresetName] = useState('');
  const [presets, setPresets] = useState<Array<{ name: string; filters: FilterState; createdAt: string }>>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('filters:presets');
      if (raw) setPresets(JSON.parse(raw));
    } catch {}
  }, []);

  const savePresets = (next: typeof presets) => {
    setPresets(next);
    try { localStorage.setItem('filters:presets', JSON.stringify(next)); } catch {}
  };

  const addPreset = () => {
    if (!presetName.trim()) return;
    const exists = presets.some(p => p.name === presetName.trim());
    const next = exists
      ? presets.map(p => p.name === presetName.trim() ? ({ ...p, filters: draftFilters, createdAt: new Date().toISOString() }) : p)
      : [...presets, { name: presetName.trim(), filters: draftFilters, createdAt: new Date().toISOString() }];
    savePresets(next);
    setPresetName('');
  };

  const applyPreset = (name: string) => {
    const p = presets.find(p => p.name === name);
    if (!p) return;
    commitFilters({ ...p.filters });
  };

  const deletePreset = (name: string) => {
    const next = presets.filter(p => p.name !== name);
    savePresets(next);
  };

  const copyShareLink = async () => {
    const query = encodeFiltersToQuery(draftFilters);
    const link = `${window.location.origin}${window.location.pathname}?${query}`;
    try {
      await navigator.clipboard.writeText(link);
      // no-op toast here; could integrate notification system if present
    } catch {}
  };

  // 收起态摘要
  const summaryChips = useMemo(() => {
    const chips: Array<{ label: string; values: string[] }> = [];
    const showKeys = ['policy_start_year', 'week_number', 'third_level_organization', 'insurance_type', 'coverage_type'] as const;
    showKeys.forEach((key) => {
      const cfg = baseFilterConfigs.find(c => c.id === key);
      const v = draftFilters[key as keyof FilterState] as any;
      if (!cfg) return;
      if (Array.isArray(v) && v.length > 0) chips.push({ label: cfg.name, values: v.slice(0, 3).map(String) });
    });
    return chips;
  }, [draftFilters, baseFilterConfigs]);

  if (panelCollapsed) {
    const total = state.data.length > 0 ? filterData(state.data, draftFilters).length : 0;
    return (
      <div ref={panelRef} className="glass rounded-lg border p-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-primary" />
        <div className="text-sm">
          已应用 {getActiveFilterCount(draftFilters)} 项筛选（{total.toLocaleString('zh-CN')} 条记录）
        </div>
        <div className="hidden md:flex items-center gap-2">
          {summaryChips.map((c) => (
            <span key={c.label} className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
              {c.label}: {c.values.join('、')}{c.values.length === 3 ? '…' : ''}
            </span>
          ))}
        </div>
      </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden lg:flex items-center gap-2 mr-2">
            {quickActions.map(action => (
              <button
                key={action.key}
                disabled={action.disabled}
                onClick={action.apply}
                className={cn(
                  'px-2 py-1 text-xs rounded-full border transition-colors',
                  action.disabled ? 'text-muted-foreground/60 border-muted-foreground/20 cursor-not-allowed' : 'text-primary border-primary/40 hover:bg-primary/10'
                )}
              >
                {action.label}
              </button>
            ))}
          </div>
          <button onClick={() => setPanelCollapsed(false)} className="px-3 py-1.5 text-sm rounded-md border">调整筛选</button>
          <button onClick={() => commitFilters(createDefaultFilters())} className="px-3 py-1.5 text-sm rounded-md border">清空</button>
        </div>
      </div>
    );
  }

  return (
    <div ref={panelRef} className="space-y-4">
      {/* 筛选器标题和控制 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">数据筛选</h3>
          {hasActiveFilters && (
            <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
              {getActiveFilterCount(draftFilters)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <span className="text-xs text-warning">有未应用的更改</span>
          )}
          <button
            onClick={() => setPanelCollapsed(true)}
            className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <span>收起</span>
          </button>
          <button
            onClick={resetDraft}
            className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" />
            <span>清空</span>
          </button>
        </div>
      </div>

      {/* 搜索框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="搜索筛选选项..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 快捷筛选 */}
      <div className="flex flex-wrap items-center gap-2">
        {quickActions.map(action => (
          <button
            key={action.key}
            disabled={action.disabled}
            onClick={() => {
              action.apply();
              setPanelCollapsed(true);
            }}
            className={cn(
              'px-2.5 py-1 text-xs rounded-full border transition-colors',
              action.disabled
                ? 'text-muted-foreground/60 border-muted-foreground/20 cursor-not-allowed'
                : 'text-primary border-primary/40 hover:bg-primary/10'
            )}
          >
            {action.label}
          </button>
        ))}
        <button
          onClick={() => commitFilters(createDefaultFilters())}
          className="px-2.5 py-1 text-xs rounded-full border border-muted-foreground/30 text-muted-foreground hover:bg-muted/50"
        >
          清空筛选
        </button>
      </div>

      {/* 筛选器列表 */}
      <div className="space-y-2">
        {filterConfigs.map((config) => {
          const isExpanded = expandedFilters.includes(config.id);
          const currentValue = draftFilters[config.id as keyof FilterState];
          const hasValue = Array.isArray(currentValue) ? currentValue.length > 0 : currentValue !== null;
          const options = filterOptions[config.id] || config.options || [];
          const filteredOptions = getFilteredOptions(options, searchTerm);
          const showRequiredError = config.required && !hasValue;

          return (
            <div key={config.id} className={cn("border rounded-lg", showRequiredError ? 'border-destructive' : 'border-border')}>
              {/* 筛选器标题 */}
              <button
                onClick={() => toggleFilter(config.id)}
                className={cn(
                  'w-full flex items-center justify-between p-3 text-left hover:bg-muted/50 transition-colors',
                  isExpanded && 'border-b border-border'
                )}
              >
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">
                    {config.name}
                  </span>
                  {config.required && (
                    <span className="text-xs text-destructive">*</span>
                  )}
                  {hasValue && (
                    <span className="px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded">
                      {Array.isArray(currentValue) ? currentValue.length : '已选择'}
                    </span>
                  )}
                </div>
                <div className={cn(
                  'transition-transform',
                  isExpanded ? 'rotate-180' : 'rotate-0'
                )}>
                  ↓
                </div>
              </button>

              {/* 筛选器选项 */}
              {isExpanded && (
                <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                  {showRequiredError && (
                    <div className="text-xs text-destructive">此为必选项</div>
                  )}
                  {config.type === 'select' ? (
                    <div className="space-y-1">
                      {(config.options || []).map((option: any) => (
                        <button
                          key={String(option.value)}
                          onClick={() => handleFilterChange(config.id, option.value)}
                          className={cn(
                            'w-full text-left px-3 py-2 text-sm rounded hover:bg-muted/50 transition-colors',
                            currentValue === option.value ? 'bg-primary text-primary-foreground' : ''
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* 多选工具条 */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <button className="px-2 py-1 rounded border" onClick={() => selectAll(config.id, filteredOptions)}>全选</button>
                        <button className="px-2 py-1 rounded border" onClick={() => clearAll(config.id)}>清空</button>
                        <button className="px-2 py-1 rounded border" onClick={() => invertSelect(config.id, filteredOptions)}>反选</button>
                        {config.id === 'week_number' && (
                          <div className="flex items-center gap-1">
                            <span>范围</span>
                            <input
                              type="number"
                              className="w-16 px-1 py-0.5 border rounded"
                              value={weekStartInput === '' ? (Array.isArray(filterOptions.week_number) && filterOptions.week_number.length > 0 ? Math.min(...filterOptions.week_number) : '') : weekStartInput}
                              onChange={(e) => setWeekStartInput(e.target.value === '' ? '' : Number(e.target.value))}
                              min={Array.isArray(filterOptions.week_number) && filterOptions.week_number.length > 0 ? Math.min(...filterOptions.week_number) : 1}
                              max={Array.isArray(filterOptions.week_number) && filterOptions.week_number.length > 0 ? Math.max(...filterOptions.week_number) : 53}
                            />
                            <span>-</span>
                            <input
                              type="number"
                              className="w-16 px-1 py-0.5 border rounded"
                              value={weekEndInput === '' ? (Array.isArray(filterOptions.week_number) && filterOptions.week_number.length > 0 ? Math.max(...filterOptions.week_number) : '') : weekEndInput}
                              onChange={(e) => setWeekEndInput(e.target.value === '' ? '' : Number(e.target.value))}
                              min={Array.isArray(filterOptions.week_number) && filterOptions.week_number.length > 0 ? Math.min(...filterOptions.week_number) : 1}
                              max={Array.isArray(filterOptions.week_number) && filterOptions.week_number.length > 0 ? Math.max(...filterOptions.week_number) : 53}
                            />
                            <button className="px-2 py-1 rounded border" onClick={() => applyWeekRange(filterOptions.week_number || [])}>应用范围</button>
                            <button
                              className="px-2 py-1 rounded border"
                              onClick={() => {
                                const weeks: number[] = filterOptions.week_number || [];
                                const top = [...weeks].sort((a,b)=>b-a).slice(0, 4);
                                handleFilterChange('week_number', top.sort((a,b)=>a-b));
                              }}
                            >最近4周</button>
                          </div>
                        )}
                      </div>
                      {/* 多选列表 */}
                      {filteredOptions.length > 0 ? (
                        filteredOptions.map((option: any) => (
                          <label
                            key={String(option)}
                            className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={(currentValue as any[])?.includes(option) || false}
                              onChange={() => handleMultiSelectChange(config.id, option)}
                              className="rounded border-border"
                            />
                            <span className="text-sm">{String(option)}</span>
                          </label>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground text-center py-4">
                          {searchTerm ? '未找到匹配项' : '暂无选项'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 筛选概要与操作 */}
      {(hasActiveFilters || hasUnsavedChanges) && (
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">待应用的筛选条件</div>
            <div className="text-xs text-muted-foreground">将筛选出 {previewCount.toLocaleString('zh-CN')} 条记录</div>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            {Object.entries(draftFilters).map(([key, value]) => {
              const config = baseFilterConfigs.find(c => c.id === key);
              if (!config || !value || (Array.isArray(value) && value.length === 0)) return null;

              return (
                <div key={key}>
                  <span className="font-medium">{config.name}:</span>{' '}
                  {Array.isArray(value) ? (
                    <span className="inline-flex flex-wrap gap-1 align-middle">
                      {value.slice(0, 10).map((v) => (
                        <span key={String(v)} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-accent rounded text-foreground">
                          <span className="max-w-[10rem] truncate" title={String(v)}>{String(v)}</span>
                          <button
                            aria-label="移除"
                            onClick={() => handleMultiSelectChange(key, v)}
                            className="text-xs opacity-70 hover:opacity-100"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      {value.length > 10 && (
                        <span className="text-muted-foreground">+{value.length - 10} 更多</span>
                      )}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-accent rounded text-foreground">
                      <span>{String(value)}</span>
                      <button
                        aria-label="清除"
                        onClick={() => handleFilterChange(key, null)}
                        className="text-xs opacity-70 hover:opacity-100"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          {applyErrors.length > 0 && (
            <div className="mt-2 text-xs text-danger">
              {applyErrors.join('，')}
            </div>
          )}
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={applyDraft}
              disabled={!hasUnsavedChanges || !isDraftValid}
              className={cn('px-3 py-2 text-sm rounded-md bg-primary text-primary-foreground disabled:opacity-50')}
            >
              应用筛选
            </button>
            <button
              onClick={() => setPanelCollapsed(true)}
              className="px-3 py-2 text-sm rounded-md border"
            >
              稍后再说
            </button>
            <button
              onClick={cancelDraft}
              disabled={!hasUnsavedChanges}
              className="px-3 py-2 text-sm rounded-md border disabled:opacity-50"
            >
              取消更改
            </button>
          </div>
        </div>
      )}

      {/* 方案与分享 */}
      <div className="p-3 border rounded-lg space-y-2">
        <div className="text-sm font-medium">筛选方案</div>
        <div className="flex items-center gap-2">
          <input
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="方案名称"
            className="flex-1 px-2 py-1 text-sm border rounded"
          />
          <button onClick={addPreset} className="px-3 py-1.5 text-sm rounded-md border">保存方案</button>
          <button onClick={copyShareLink} className="px-3 py-1.5 text-sm rounded-md border">复制分享链接</button>
        </div>
        {presets.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {presets.map(p => (
              <span key={p.name} className="inline-flex items-center gap-2 px-2 py-1 rounded border text-sm">
                <button className="hover:underline" onClick={() => applyPreset(p.name)}>{p.name}</button>
                <button className="text-muted-foreground" onClick={() => deletePreset(p.name)}>删除</button>
              </span>
            ))}
          </div>
        )}
        <div className="text-xs text-muted-foreground">链接参数键：{FILTERS_QUERY_KEY}</div>
      </div>
    </div>
  );
}
