import React from 'react';
import { MethodType } from '../types/numerical';
import { NUMERICAL_METHODS } from '../algorithms';
import { Info, HelpCircle } from 'lucide-react';

interface MethodSelectorProps {
  selectedMethod: MethodType;
  setSelectedMethod: (method: MethodType) => void;
}

export const MethodSelector: React.FC<MethodSelectorProps> = ({
  selectedMethod,
  setSelectedMethod,
}) => {
  const [showSecantExplanation, setShowSecantExplanation] = React.useState(false);
  const currentInfo = NUMERICAL_METHODS[selectedMethod];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-800">
          انتخاب روش حل عددی
        </label>
        <button
          type="button"
          onClick={() => setShowSecantExplanation(!showSecantExplanation)}
          className="text-xs text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer font-medium"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>تفاوت روش «وتری (Secant)» با «نابجایی (False Position)»</span>
        </button>
      </div>

      {/* Distinction Callout between Secant and Regula Falsi */}
      {showSecantExplanation && (
        <div className="p-3.5 bg-sky-50/80 border border-sky-200 rounded-lg text-xs text-slate-700 leading-relaxed space-y-2">
          <div className="font-semibold text-sky-950 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-sky-600 shrink-0" />
            <span>شفاف‌سازی علمی تفاوت دو الگوریتم وتری در محاسبات عددی:</span>
          </div>
          <p>
            در مراجع محاسبات عددی، اصطلاح «وتری» به دو الگوریتم کاملاً متفاوت اطلاق می‌شود که هر دو در این سامانه پیاده‌سازی شده‌اند:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
            <div className="bg-white p-2.5 rounded border border-sky-200">
              <span className="font-bold text-sky-900 block mb-1">۱. روش وتری (Secant Method) — روش باز:</span>
              <span>
                به دو حدس اولیه بدون شرط تغییر علامت نیاز دارد. در هر گام مشتق با خط وتر دو نقطه قبلی تقریب زده می‌شود. نرخ همگرایی فوق‌خطی (<span className="font-mono">p ≈ ۱.۶۱۸</span>) و بسیار سریع است، اما تضمین همگرایی ندارد و ممکن است واگرا شود.
              </span>
            </div>
            <div className="bg-white p-2.5 rounded border border-sky-200">
              <span className="font-bold text-emerald-900 block mb-1">۲. روش نابجایی (False Position / Regula Falsi) — روش محصورکننده:</span>
              <span>
                همانند روش تنصیف، نیازمند بازه <span className="font-mono">[a, b]</span> با شرط <span className="font-mono">f(a)·f(b) &lt; 0</span> است. ریشه جدید با تقاطع خط وتر با محور x به دست می‌آید و شرط تغییر علامت همیشه حفظ می‌شود، بنابراین همگرایی آن قطعی و تضمین‌شده است.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4 Methods Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {(Object.keys(NUMERICAL_METHODS) as MethodType[]).map((key) => {
          const m = NUMERICAL_METHODS[key];
          const isSelected = selectedMethod === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedMethod(key)}
              className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-sky-600 bg-sky-50/60 ring-2 ring-sky-500/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${isSelected ? 'text-sky-900' : 'text-slate-800'}`}>
                    {m.nameFa}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono" dir="ltr">
                  {m.nameEn}
                </div>
              </div>
              <div className="mt-2 text-[11px] text-slate-500 pt-1.5 border-t border-slate-100 flex items-center justify-between">
                <span>مرتبه:</span>
                <span className="font-mono text-slate-700 font-medium">
                  {key === 'newton' ? '۲ (مربعی)' : key === 'secant' ? '۱.۶۱۸' : '۱ (خطی)'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Method Brief Meta */}
      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs flex flex-wrap items-center justify-between gap-2 text-slate-600">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800">فرمول تکرار:</span>
          <span className="font-mono font-medium text-sky-800" dir="ltr">
            {currentInfo.formula}
          </span>
        </div>
        <div className="text-[11px] text-slate-500">
          {currentInfo.requiredInputDescription}
        </div>
      </div>
    </div>
  );
};
