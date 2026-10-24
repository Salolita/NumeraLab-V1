import React from 'react';
import { BookOpen, Check, AlertTriangle, Layers, Compass } from 'lucide-react';

export const EducationalGuide: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-sky-600" />
          <h2 className="text-base font-bold text-slate-900">
            راهنمای علمی و تئوری محاسبات عددی
          </h2>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          مرجع آموزشی و علمی مبانی حل معادلات غیرخطی تک‌متغیره f(x) = 0، تحلیل مرتبه همگرایی، معیارهای توقف و شرایط شکست الگوریتم‌ها بر اساس استانداردهای دانشگاهی.
        </p>
      </div>

      {/* Comparison Table of Convergence Orders */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-600" />
          <h3 className="text-sm font-bold text-slate-900">
            مقایسه تحلیلی روش‌های عددی حل معادله f(x) = 0
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="py-2.5 px-3">روش عددی</th>
                <th className="py-2.5 px-3">دسته‌بندی</th>
                <th className="py-2.5 px-3">مرتبه همگرایی (p)</th>
                <th className="py-2.5 px-3">نیاز به مشتق</th>
                <th className="py-2.5 px-3">تضمین همگرایی</th>
                <th className="py-2.5 px-3">فرمول به‌روزرسانی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-bold text-slate-900">تنصیف (Bisection)</td>
                <td className="py-2.5 px-3">محصورکننده (Bracketing)</td>
                <td className="py-2.5 px-3 font-mono">۱ (خطی، ضریب ۰.۵)</td>
                <td className="py-2.5 px-3 text-emerald-700">خیر</td>
                <td className="py-2.5 px-3 text-emerald-700">بله (قطعی)</td>
                <td className="py-2.5 px-3 font-mono" dir="ltr">c = (a + b) / 2</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-bold text-slate-900">نابجایی (False Position)</td>
                <td className="py-2.5 px-3">محصورکننده (Bracketing)</td>
                <td className="py-2.5 px-3 font-mono">۱ تا فوق‌خطی</td>
                <td className="py-2.5 px-3 text-emerald-700">خیر</td>
                <td className="py-2.5 px-3 text-emerald-700">بله (قطعی)</td>
                <td className="py-2.5 px-3 font-mono" dir="ltr">c = (a·fb - b·fa)/(fb - fa)</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-bold text-slate-900">وتری (Secant)</td>
                <td className="py-2.5 px-3">روش باز (Open)</td>
                <td className="py-2.5 px-3 font-mono">۱.۶۱۸ (نسبت طلایی)</td>
                <td className="py-2.5 px-3 text-emerald-700">خیر</td>
                <td className="py-2.5 px-3 text-amber-700">خیر (مشروط به نزدیکی)</td>
                <td className="py-2.5 px-3 font-mono" dir="ltr">xₖ₊₁ = xₖ - fₖ(xₖ-xₖ₋₁)/(fₖ-fₖ₋₁)</td>
              </tr>
              <tr className="hover:bg-slate-50 bg-sky-50/30">
                <td className="py-2.5 px-3 font-bold text-sky-900">نیوتون–رافسون</td>
                <td className="py-2.5 px-3">روش باز (Open)</td>
                <td className="py-2.5 px-3 font-mono font-bold text-sky-800">۲ (مربعی - دو برابر شدن ارقام)</td>
                <td className="py-2.5 px-3 text-rose-700 font-semibold">بله (f'(x))</td>
                <td className="py-2.5 px-3 text-amber-700">خیر (محلی در همسایگی ریشه)</td>
                <td className="py-2.5 px-3 font-mono" dir="ltr">xₖ₊₁ = xₖ - f(xₖ)/f'(xₖ)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Stopping Criteria & Residual vs Error */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-sky-600" />
          <h3 className="text-sm font-bold text-slate-900">
            تفکیک علمی معیارهای توقف و تفاوت باقیمانده با خطا
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-bold text-xs text-slate-900 block mb-1">
              ۱. خطای مطلق (|xₖ - xₖ₋₁| &lt; ε)
            </span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              تغییرات متوالی ریشه را می‌سنجد. مناسب مسائلی است که بزرگی ریشه نزدیک به ۱ باشد. در روش تنصیف، طول شعاع بازه (b - a)/2 کران بالای قطعی خطاست.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-bold text-xs text-slate-900 block mb-1">
              ۲. خطای نسبی (|Δx| / |xₖ| &lt; ε)
            </span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              مناسب ریشه‌های بسیار بزرگ (مثلاً ۱۰⁶) یا بسیار کوچک (مثلاً ۱۰⁻⁶) که مقایسه مطلق در آن‌ها گمراه‌کننده است و مقیاس عدد را در نظر می‌گیرد.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-bold text-xs text-slate-900 block mb-1">
              ۳. باقیمانده تابع (|f(xₖ)| &lt; ε)
            </span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              میزان نزدیک بودن مقدار خروجی تابع به صفر است. در توابعی با شیب بسیار تند، ریشه ممکن است دقیق باشد ولی باقیمانده بزرگ بماند؛ بالعکس در توابع تخت، باقیمانده سریع صفر می‌شود.
            </p>
          </div>
        </div>

        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">هشدار علمی در مورد تله توقف تنها با باقیمانده:</span>
            برای تابع بسیار تخت مانند f(x) = x¹⁰، در نقطه x = 0.5 مقدار تابع ۰.۰۰۰۹۷ است که کمتر از ۱۰⁻³ می‌باشد، در حالی که ریشه واقعی ۰ است و خطای نقطه تخمین‌زده شده ۰.۵ می‌باشد! به همین دلیل، این سامانه امکان ترکیب هر دو معیار (خطای ریشه و باقیمانده) را فراهم کرده است.
          </div>
        </div>
      </div>

      {/* Failure Modes & Troubleshooting */}
      <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900">
          شرایط شکست و خطاهای الگوریتم‌ها و نحوه رفع آن‌ها
        </h3>

        <div className="space-y-2 text-xs text-slate-600">
          <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/60">
            <strong className="text-slate-900 block mb-1">• خطای شرط بولزانو (f(a)·f(b) &gt; 0) در روش تنصیف و نابجایی:</strong>
            اگر مقادیر تابع در دو سر بازه هم‌علامت باشند، وجود ریشه تضمین نیست. بازه را تغییر دهید یا با رسم نمودار بازه‌ای بیابید که منحنی محور افقی را قطع کند.
          </div>

          <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/60">
            <strong className="text-slate-900 block mb-1">• مشتق صفر یا بسیار کوچک (f'(x) ≈ 0) در نیوتون–رافسون:</strong>
            خط مماس بر منحنی افقی می‌شود و با محور x موازی می‌گردد (تقسیم بر صفر). حدس اولیه متفاوتی دورتر از نقاط اکسترمم محلی انتخاب کنید.
          </div>

          <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/60">
            <strong className="text-slate-900 block mb-1">• برابری مقادیر f(xₖ) = f(xₖ₋₁) در روش وتری:</strong>
            شیب خط وتر افقی شده و مخرج کسر صفر می‌شود. دو نقطه شروع متمایز با مقادیر تابع متفاوت برگزینید.
          </div>

          <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/60">
            <strong className="text-slate-900 block mb-1">• واگرایی به بی‌نهایت:</strong>
            در روش‌های باز (نیوتون و وتری)، اگر حدس اولیه دور از ریشه باشد یا تابع دارای مجانب یا نقاط عطف شدید باشد، الگوریتم واگرا می‌شود.
          </div>
        </div>
      </div>
    </div>
  );
};
