"use client";
import React, { useEffect, useRef, useState } from "react";
import { useApp } from "@/context/AppContext";
import { parseCSV } from "@/services/csvParser";
import { mapRows } from "@/services/dataProcessor";
import { saveDataset, loadDataset, listDatasets, getLatestId, DatasetMeta } from "@/services/storage";
import { buildQualityReport, QualityReport } from "@/services/qualityChecker";

/**
 * 数据加载组件（CSV导入）
 * 功能：选择CSV文件，指定“起保年度/周序号”，解析并加载到全局状态
 */
export default function DataLoader() {
  const { state, dispatch } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [year, setYear] = useState<string>("");
  const [week, setWeek] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [datasets, setDatasets] = useState<DatasetMeta[]>([]);
  const [name, setName] = useState<string>("");
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<QualityReport | null>(null);

  useEffect(() => {
    // 首次加载列举本地数据集，若存在 latest 可提示加载
    listDatasets().then(setDatasets).catch(() => {});
  }, []);

  const handleFile = async (file: File) => {
    setError(null);
    setLoading(true);
    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      const records = mapRows(parsed.rows);
      dispatch({ type: "SET_DATA", payload: { records } });
      // 数据质量报告
      setQuality(buildQualityReport(records));

      // 设置当前周与上一周（若未填写，自动从数据中推断最大周）
      let wk = parseInt(week || "", 10);
      if (!isFinite(wk)) {
        const weeks = Array.from(new Set(records.map((r) => r.week_number))).sort((a, b) => a - b);
        wk = weeks[weeks.length - 1] ?? 1;
      }
      const prev = Math.max(1, wk - 1);
      dispatch({ type: "SET_WEEKS", payload: { currentWeek: wk, previousWeek: prev } });
      // 自动建议名称
      const suggest = `数据集_${new Date().toLocaleDateString()}_${wk}周`;
      setName(suggest);
    } catch (e: any) {
      setError(e?.message || "文件解析失败");
    } finally {
      setLoading(false);
    }
  };

  const saveFromContext = async () => {
    setSaving(true);
    try {
      const records = state.records;
      if (!records.length) {
        setError("暂无可保存的数据，请先导入CSV");
        return;
      }
      const wk = state.currentWeek ?? 0;
      const id = `y${year || "_"}_w${week || wk}_${Date.now()}`;
      const meta = await saveDataset({ id, name: name || id, records });
      setDatasets(await listDatasets());
    } catch (e: any) {
      setError(e?.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const loadLatest = async () => {
    setLoadingLocal(true);
    try {
      const id = getLatestId();
      if (!id) {
        setError("未找到本地数据集，请先保存");
        return;
      }
      const data = await loadDataset(id);
      if (!data) {
        setError("加载失败，数据集可能已被清理");
        return;
      }
      dispatch({ type: "SET_DATA", payload: { records: data.records } });
      const weeks = Array.from(new Set(data.records.map((r) => r.week_number))).sort((a, b) => a - b);
      const wk = weeks[weeks.length - 1] ?? 1;
      dispatch({ type: "SET_WEEKS", payload: { currentWeek: wk, previousWeek: Math.max(1, wk - 1) } });
    } catch (e: any) {
      setError(e?.message || "加载失败");
    } finally {
      setLoadingLocal(false);
    }
  };

  return (
    <div className="card">
      <div className="card-body flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                setLastFile(f);
                handleFile(f);
              }
              if (inputRef.current) inputRef.current.value = "";
            }}
          />
          <button
            className="rounded bg-brand px-3 py-1.5 text-white hover:opacity-90"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
          >
            {loading ? "解析中..." : "导入数据"}
          </button>
          <input
            placeholder="起保年度(可选)"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="h-9 w-36 rounded border border-slate-300 px-2 text-sm"
          />
          <input
            placeholder="周序号(可选)"
            value={week}
            onChange={(e) => setWeek(e.target.value)}
            className="h-9 w-28 rounded border border-slate-300 px-2 text-sm"
          />
          <input
            placeholder="数据集名称(可选)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9 w-56 rounded border border-slate-300 px-2 text-sm"
          />
          <button
            className="rounded border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
            onClick={saveFromContext}
            disabled={saving}
          >
            {saving ? "保存中..." : "保存到本地"}
          </button>
          <button
            className="rounded border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
            onClick={loadLatest}
            disabled={loadingLocal}
          >
            {loadingLocal ? "加载中..." : "加载上次"}
          </button>
          <button
            className="rounded border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
            onClick={async () => {
              setError(null);
              try {
                if (!lastFile) {
                  setError("请先选择CSV文件");
                  return;
                }
                if (!year || !week) {
                  setError("需填写年份与周序号再上传");
                  return;
                }
                const fd = new FormData();
                fd.append("year", year);
                fd.append("week", week);
                fd.append("file", lastFile);
                const res = await fetch("/api/upload", { method: "POST", body: fd });
                if (!res.ok) throw new Error(await res.text());
                const json = await res.json();
                console.log("uploaded:", json);
              } catch (e: any) {
                setError(e?.message || "上传失败");
              }
            }}
          >
            上传到服务器
          </button>
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>

        {quality && (
          <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm">
            <div className="mb-1 font-medium text-amber-800">数据质量校验报告</div>
            <div className="mb-2 text-amber-700">记录数：{quality.summary.total}，周数：{quality.summary.weeks}</div>
            <ul className="list-disc space-y-1 pl-5 text-amber-700">
              {quality.items.length === 0 && <li>未发现明显问题</li>}
              {quality.items.map((it, idx) => (
                <li key={idx}>
                  [{it.type === "denominator" ? "分母" : it.type === "abnormal" ? "异常" : "信息"}] {it.metric} — {it.detail}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
