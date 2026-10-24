import React, { useState, useEffect } from 'react';
import { runAutomatedTests, TestSuiteSummary } from '../tests/numericalTests';
import { CheckCircle2, XCircle, Play, RefreshCw, Clock, ShieldCheck, Check } from 'lucide-react';

export const ValidationTestsModal: React.FC = () => {
  const [summary, setSummary] = useState<TestSuiteSummary | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [filter, setFilter] = useState<'all' | 'bisection' | 'newton' | 'secant' | 'falsePosition' | 'edge_cases'>('all');

  const executeTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runAutomatedTests();
      setSummary(res);
      setIsRunning(false);
    }, 120);
  };

  useEffect(() => {
    executeTests();
  }, []);

  const filteredResults = summary?.results.filter((r) => {
    if (filter === 'all') return true;
    return r.category === filter;
  });

  return (
    <div className="space-y-4">
      {/* Overview Card */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">
                مجموعه آزمون‌های خودکار و اعتبارسنجی علمی
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              ارزیابی الگوریتم‌های عددی با نمونه‌های استاندارد دانشگاهی، خطاهای مرزی و شرایط توقف
            </p>
          </div>

          <button
            type="button"
            onClick={executeTests}
            disabled={isRunning}
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 active:scale-95 disabled:opacity-50 transition-all rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>در حال اجرای آزمون‌ها...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>اجرای مجدد کلیه آزمون‌ها</span>
              </>
            )}
          </button>
        </div>

        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] text-slate-500 block mb-0.5">کل آزمون‌ها</span>
              <span className="font-mono text-xl font-bold text-slate-800">{summary.total}</span>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <span className="text-[11px] text-emerald-700 block mb-0.5">موفق (Passed)</span>
              <span className="font-mono text-xl font-bold text-emerald-700">{summary.passed}</span>
            </div>
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
              <span className="text-[11px] text-rose-700 block mb-0.5">ناموفق (Failed)</span>
              <span className="font-mono text-xl font-bold text-rose-700">{summary.failed}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[11px] text-slate-500 block mb-0.5">مدت زمان اجرا</span>
              <span className="font-mono text-xl font-bold text-slate-800 flex items-center gap-1">
                <Clock className="w-4 h-4 text-slate-400" />
                {summary.durationMs.toFixed(2)} ms
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-lg text-xs">
        {[
          { id: 'all', label: 'همه آزمون‌ها' },
          { id: 'bisection', label: 'تنصیف (Bisection)' },
          { id: 'newton', label: 'نیوتون–رافسون' },
          { id: 'secant', label: 'وتری (Secant)' },
          { id: 'falsePosition', label: 'نابجایی (False Position)' },
          { id: 'edge_cases', label: 'شرایط مرزی و شکست' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setFilter(t.id as any)}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              filter === t.id
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Test List */}
      <div className="space-y-2">
        {filteredResults?.map((t, idx) => (
          <div
            key={t.id}
            className={`p-3.5 rounded-xl border transition-all ${
              t.passed ? 'bg-white border-slate-200 hover:border-slate-300' : 'bg-rose-50 border-rose-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5">
                  {t.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 mb-1">{t.name}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-600 font-mono">
                    <div>
                      <span className="text-slate-400 font-sans">مورد انتظار: </span>
                      <span dir="ltr">{t.expected}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-sans">خروجی واقعی: </span>
                      <span dir="ltr" className={t.passed ? 'text-emerald-700' : 'text-rose-700'}>
                        {t.actual}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-left font-mono text-[11px] text-slate-400 shrink-0" dir="ltr">
                {t.durationMs.toFixed(2)} ms
                {t.iterations > 0 && ` · ${t.iterations} it`}
              </div>
            </div>

            {t.details && (
              <div className="mt-2 text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 leading-relaxed font-sans">
                {t.details}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
