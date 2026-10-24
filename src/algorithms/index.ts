import { MethodType } from '../types/numerical';
import { solveBisection } from './bisection';
import { solveNewtonRaphson } from './newtonRaphson';
import { solveSecant } from './secant';
import { solveFalsePosition } from './falsePosition';

export { solveBisection } from './bisection';
export { solveNewtonRaphson } from './newtonRaphson';
export { solveSecant } from './secant';
export { solveFalsePosition } from './falsePosition';

export interface MethodInfo {
  id: MethodType;
  nameFa: string;
  nameEn: string;
  orderOfConvergence: string;
  formula: string;
  isBracketing: boolean;
  requiresDerivative: boolean;
  requiredInputDescription: string;
  pros: string[];
  cons: string[];
  summary: string;
}

export const NUMERICAL_METHODS: Record<MethodType, MethodInfo> = {
  bisection: {
    id: 'bisection',
    nameFa: 'روش تنصیف (دو بخشی)',
    nameEn: 'Bisection Method',
    orderOfConvergence: 'خطی (مرتبه ۱ - ضریب ۰.۵)',
    formula: 'c = (a + b) / 2',
    isBracketing: true,
    requiresDerivative: false,
    requiredInputDescription: 'نیازمند بازه محصورکننده [a, b] که در آن f(a)·f(b) < 0 باشد.',
    pros: [
      'همگرایی همواره تضمین‌شده برای توابع پیوسته با تغییر علامت',
      'سادگی بالا در پیاده‌سازی و درک ریاضی',
      'تعداد تکرارهای مورد نیاز از پیش دقیقاً قابل محاسبه است: n ≥ log₂((b-a)/ε)',
    ],
    cons: [
      'سرعت همگرایی کند در مقایسه با روش‌های مرتبه بالاتر',
      'ناتوانی در یافتن ریشه‌های مضاعف که در آن‌ها تابع تغییر علامت نمی‌دهد',
    ],
    summary: 'روش محصورکننده کلاسیک که در هر گام بازه را به دو نیمه مساوی تقسیم می‌کند.',
  },
  newton: {
    id: 'newton',
    nameFa: 'روش نیوتون–رافسون',
    nameEn: 'Newton–Raphson Method',
    orderOfConvergence: 'درجه دو (مرتبه ۲ - همگرایی مربعی)',
    formula: 'xₖ₊₁ = xₖ - f(xₖ) / f\'(xₖ)',
    isBracketing: false,
    requiresDerivative: true,
    requiredInputDescription: 'نیازمند یک حدس اولیه (x₀) نزدیک به ریشه و مشتق تابع f\'(x).',
    pros: [
      'همگرایی فوق‌العاده سریع در مجاورت ریشه (تعداد ارقام صحیح در هر گام دو برابر می‌شود)',
      'فقط به یک نقطه شروع نیاز دارد',
    ],
    cons: [
      'نیاز به محاسبه مشتق اول f\'(x)',
      'حساس به نقطه شروع؛ در صورت وجود اکسترمم محلی یا مشتق صفر، متوقف یا واگرا می‌شود',
      'خطر نوسان یا افتادن در چرخه تکراری در برخی توابع',
    ],
    summary: 'روش باز مبتنی بر خط مماس بر منحنی تابع که با خطی‌سازی مرتبه یک تقریب می‌زند.',
  },
  secant: {
    id: 'secant',
    nameFa: 'روش وتری (سکنت)',
    nameEn: 'Secant Method',
    orderOfConvergence: 'فوق‌خطی (مرتبه ۱.۶۱۸ - نسبت طلایی)',
    formula: 'xₖ₊₁ = xₖ - f(xₖ)·(xₖ - xₖ₋₁) / (f(xₖ) - f(xₖ₋₁))',
    isBracketing: false,
    requiresDerivative: false,
    requiredInputDescription: 'نیازمند دو حدس اولیه (x₀ و x₁) بدون شرط محصور کردن ریشه.',
    pros: [
      'عدم نیاز به محاسبه تحلیلی مشتق تابع',
      'سرعت همگرایی بالا (نزدیک به همگرایی مربعی نیوتون)',
      'ساده‌تر و ارزان‌تر از نیوتون به ازای هر تکرار',
    ],
    cons: [
      'روش باز است و همگرایی تضمین صددرصدی ندارد',
      'احتمال تقسیم بر صفر در صورتی که f(xₖ) ≈ f(xₖ₋₁)',
    ],
    summary: 'روش باز که مشتق را با شیب خط وتریِ دو نقطه قبلی جایگزین می‌کند.',
  },
  falsePosition: {
    id: 'falsePosition',
    nameFa: 'روش نابجایی (وتری محصورکننده)',
    nameEn: 'False Position (Regula Falsi)',
    orderOfConvergence: 'خطی تا فوق‌خطی',
    formula: 'c = (a·f(b) - b·f(a)) / (f(b) - f(a))',
    isBracketing: true,
    requiresDerivative: false,
    requiredInputDescription: 'نیازمند بازه محصورکننده [a, b] که در آن f(a)·f(b) < 0 باشد.',
    pros: [
      'همگرایی تضمین‌شده (همانند تنصیف بازه را همیشه محصور نگه می‌دارد)',
      'معمولاً در مراحل اولیه سریع‌تر از تنصیف به ریشه نزدیک می‌شود',
      'نیازی به مشتق ندارد',
    ],
    cons: [
      'در توابع دارای تقعر یا تحدب شدید، ممکن است یکی از مرزها قفل شود و همگرایی بسیار کند گردد',
      'طول بازه لزوماً به صفر میل نمی‌کند، بلکه مقدار ریشه همگرا می‌شود',
    ],
    summary: 'ترکیب هوشمندانه تضمین همگرایی روش تنصیف با درون‌یابی خطی وتری.',
  },
};
