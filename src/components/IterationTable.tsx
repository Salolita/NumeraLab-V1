import React from 'react';
import { MethodType, SolverResult, BisectionIteration, NewtonIteration, SecantIteration, FalsePositionIteration } from '../types/numerical';
import { Download, Copy, Check, Table } from 'lucide-react';

interface IterationTableProps {
  result: SolverResult | null;
  decimalPlaces: number;
}

export const IterationTable: React.FC<IterationTableProps> = ({ result, decimalPlaces }) => {
  const [copied, setCopied] = React.useState(false);

  if (!result || result.iterations.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-xs">
        <Table className="w-8 h-8 mx-auto text-slate-300 mb-2" />
        <p>پس از محاسبه معادله، جدول گام‌به‌گام تکرارهای الگوریتم در اینجا نمایش داده می‌شود.</p>
      </div>
    );
  }

  const { method, iterations } = result;

  const formatNumber = (num: number | undefined | null): string => {
    if (num === undefined || num === null) return '-';
    if (Math.abs(num) < 1e-15) return '0.0';
    if (Math.abs(num) < 1e-4 || Math.abs(num) > 1e6) {
      return num.toExponential(4);
    }
    return num.toFixed(decimalPlaces);
  };

  const exportCsv = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (method === 'bisection') {
      headers = ['گام (n)', 'کران پایین a', 'کران بالا b', 'نقطه میانی c', 'f(a)', 'f(b)', 'f(c)', 'خطای مطلق (b-a)/2', 'خطای نسبی'];
      rows = (iterations as BisectionIteration[]).map((it) => [
        it.step,
        it.a,
        it.b,
        it.c,
        it.fa,
        it.fb,
        it.fc,
        it.error,
        it.relativeError || '',
      ]);
    } else if (method === 'newton') {
      headers = ['گام (n)', 'x_n', 'f(x_n)', "f'(x_n)", 'x_(n+1)', 'خطای مطلق |x_(n+1) - x_n|', 'خطای نسبی'];
      rows = (iterations as NewtonIteration[]).map((it) => [
        it.step,
        it.xn,
        it.fxn,
        it.dfxn,
        it.xnNext,
        it.absError,
        it.relError,
      ]);
    } else if (method === 'secant') {
      headers = ['گام (n)', 'x_(n-1)', 'x_n', 'f(x_(n-1))', 'f(x_n)', 'x_(n+1)', 'خطای مطلق', 'خطای نسبی'];
      rows = (iterations as SecantIteration[]).map((it) => [
        it.step,
        it.xPrev,
        it.xCurr,
        it.fxPrev,
        it.fxCurr,
        it.xNext,
        it.absError,
        it.relError,
      ]);
    } else {
      headers = ['گام (n)', 'کران پایین a', 'کران بالا b', 'ریشه وتری c', 'f(a)', 'f(b)', 'f(c)', 'تغییر ریشه (خطای مطلق)', 'خطای نسبی'];
      rows = (iterations as FalsePositionIteration[]).map((it) => [
        it.step,
        it.a,
        it.b,
        it.c,
        it.fa,
        it.fb,
        it.fc,
        it.error,
        it.relativeError || '',
      ]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `numerical_iterations_${method}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyAsText = () => {
    let text = `جدول تکرارهای روش ${result.method}\n`;
    iterations.forEach((it: any) => {
      text += `گام ${it.step}: x = ${it.c ?? it.xnNext ?? it.xNext}\n`;
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800">جدول مراحل تکرار (Iteration Table)</span>
          <span className="text-[11px] text-slate-500">
            {iterations.length} سطر محاسبه‌شده
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={copyAsText}
            className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'کپی شد' : 'کپی خلاصه'}</span>
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="px-2.5 py-1 text-xs text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            <span>خروجی اکسل (CSV)</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs max-h-[460px]">
        <table className="w-full text-xs text-right whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold sticky top-0 z-10">
            {method === 'bisection' && (
              <tr>
                <th className="py-2.5 px-3">گام (n)</th>
                <th className="py-2.5 px-3">کران a</th>
                <th className="py-2.5 px-3">کران b</th>
                <th className="py-2.5 px-3 text-sky-700 bg-sky-50/50">نقطه میانی c</th>
                <th className="py-2.5 px-3">f(a)</th>
                <th className="py-2.5 px-3">f(b)</th>
                <th className="py-2.5 px-3">f(c)</th>
                <th className="py-2.5 px-3">خطای بازه (b-a)/2</th>
                <th className="py-2.5 px-3">خطای نسبی</th>
              </tr>
            )}

            {method === 'newton' && (
              <tr>
                <th className="py-2.5 px-3">گام (n)</th>
                <th className="py-2.5 px-3">xₙ</th>
                <th className="py-2.5 px-3">f(xₙ)</th>
                <th className="py-2.5 px-3">f'(xₙ)</th>
                <th className="py-2.5 px-3 text-sky-700 bg-sky-50/50">xₙ₊₁ (تقریب بعدی)</th>
                <th className="py-2.5 px-3">خطای مطلق |Δx|</th>
                <th className="py-2.5 px-3">خطای نسبی</th>
              </tr>
            )}

            {method === 'secant' && (
              <tr>
                <th className="py-2.5 px-3">گام (n)</th>
                <th className="py-2.5 px-3">xₙ₋₁</th>
                <th className="py-2.5 px-3">xₙ</th>
                <th className="py-2.5 px-3">f(xₙ₋₁)</th>
                <th className="py-2.5 px-3">f(xₙ)</th>
                <th className="py-2.5 px-3 text-sky-700 bg-sky-50/50">xₙ₊₁ (تقریب وتری)</th>
                <th className="py-2.5 px-3">خطای مطلق |Δx|</th>
                <th className="py-2.5 px-3">خطای نسبی</th>
              </tr>
            )}

            {method === 'falsePosition' && (
              <tr>
                <th className="py-2.5 px-3">گام (n)</th>
                <th className="py-2.5 px-3">کران a</th>
                <th className="py-2.5 px-3">کران b</th>
                <th className="py-2.5 px-3 text-sky-700 bg-sky-50/50">ریشه وتری c</th>
                <th className="py-2.5 px-3">f(a)</th>
                <th className="py-2.5 px-3">f(b)</th>
                <th className="py-2.5 px-3">f(c)</th>
                <th className="py-2.5 px-3">تغییر ریشه |Δc|</th>
                <th className="py-2.5 px-3">خطای نسبی</th>
              </tr>
            )}
          </thead>

          <tbody className="divide-y divide-slate-100 font-mono tabular-nums text-slate-700">
            {method === 'bisection' &&
              (iterations as BisectionIteration[]).map((row, idx) => {
                const isLast = idx === iterations.length - 1 && result.status === 'converged';
                return (
                  <tr key={row.step} className={isLast ? 'bg-emerald-50/50 font-semibold text-emerald-950' : 'hover:bg-slate-50/80'}>
                    <td className="py-2 px-3 text-slate-500 font-sans">{row.step}</td>
                    <td className="py-2 px-3">{formatNumber(row.a)}</td>
                    <td className="py-2 px-3">{formatNumber(row.b)}</td>
                    <td className="py-2 px-3 text-sky-800 font-bold bg-sky-50/30">{formatNumber(row.c)}</td>
                    <td className="py-2 px-3">{formatNumber(row.fa)}</td>
                    <td className="py-2 px-3">{formatNumber(row.fb)}</td>
                    <td className="py-2 px-3">{formatNumber(row.fc)}</td>
                    <td className="py-2 px-3 text-slate-500">{formatNumber(row.error)}</td>
                    <td className="py-2 px-3 text-slate-500">{formatNumber(row.relativeError)}</td>
                  </tr>
                );
              })}

            {method === 'newton' &&
              (iterations as NewtonIteration[]).map((row, idx) => {
                const isLast = idx === iterations.length - 1 && result.status === 'converged';
                return (
                  <tr key={row.step} className={isLast ? 'bg-emerald-50/50 font-semibold text-emerald-950' : 'hover:bg-slate-50/80'}>
                    <td className="py-2 px-3 text-slate-500 font-sans">{row.step}</td>
                    <td className="py-2 px-3">{formatNumber(row.xn)}</td>
                    <td className="py-2 px-3">{formatNumber(row.fxn)}</td>
                    <td className="py-2 px-3 text-slate-600">{formatNumber(row.dfxn)}</td>
                    <td className="py-2 px-3 text-sky-800 font-bold bg-sky-50/30">{formatNumber(row.xnNext)}</td>
                    <td className="py-2 px-3 text-slate-500">{formatNumber(row.absError)}</td>
                    <td className="py-2 px-3 text-slate-500">{formatNumber(row.relError)}</td>
                  </tr>
                );
              })}

            {method === 'secant' &&
              (iterations as SecantIteration[]).map((row, idx) => {
                const isLast = idx === iterations.length - 1 && result.status === 'converged';
                return (
                  <tr key={row.step} className={isLast ? 'bg-emerald-50/50 font-semibold text-emerald-950' : 'hover:bg-slate-50/80'}>
                    <td className="py-2 px-3 text-slate-500 font-sans">{row.step}</td>
                    <td className="py-2 px-3">{formatNumber(row.xPrev)}</td>
                    <td className="py-2 px-3">{formatNumber(row.xCurr)}</td>
                    <td className="py-2 px-3">{formatNumber(row.fxPrev)}</td>
                    <td className="py-2 px-3">{formatNumber(row.fxCurr)}</td>
                    <td className="py-2 px-3 text-sky-800 font-bold bg-sky-50/30">{formatNumber(row.xNext)}</td>
                    <td className="py-2 px-3 text-slate-500">{formatNumber(row.absError)}</td>
                    <td className="py-2 px-3 text-slate-500">{formatNumber(row.relError)}</td>
                  </tr>
                );
              })}

            {method === 'falsePosition' &&
              (iterations as FalsePositionIteration[]).map((row, idx) => {
                const isLast = idx === iterations.length - 1 && result.status === 'converged';
                return (
                  <tr key={row.step} className={isLast ? 'bg-emerald-50/50 font-semibold text-emerald-950' : 'hover:bg-slate-50/80'}>
                    <td className="py-2 px-3 text-slate-500 font-sans">{row.step}</td>
                    <td className="py-2 px-3">{formatNumber(row.a)}</td>
                    <td className="py-2 px-3">{formatNumber(row.b)}</td>
                    <td className="py-2 px-3 text-sky-800 font-bold bg-sky-50/30">{formatNumber(row.c)}</td>
                    <td className="py-2 px-3">{formatNumber(row.fa)}</td>
                    <td className="py-2 px-3">{formatNumber(row.fb)}</td>
                    <td className="py-2 px-3">{formatNumber(row.fc)}</td>
                    <td className="py-2 px-3 text-slate-500">{formatNumber(row.error)}</td>
                    <td className="py-2 px-3 text-slate-500">{formatNumber(row.relativeError)}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
