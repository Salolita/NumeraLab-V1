import * as math from 'mathjs';

export interface CompiledFunction {
  evaluate: (x: number) => number;
  expression: string;
}

/**
 * Normalizes user math expression to standard mathjs format
 */
export function normalizeMathExpression(expr: string): string {
  let cleaned = expr.trim();
  if (!cleaned) return '';

  // Replace unicode symbols
  cleaned = cleaned.replace(/π/g, 'pi');
  cleaned = cleaned.replace(/×/g, '*');
  cleaned = cleaned.replace(/÷/g, '/');
  cleaned = cleaned.replace(/−/g, '-');
  
  // Replace ln( with log( (in mathjs log is natural logarithm ln)
  // And replace log10( with log10(
  cleaned = cleaned.replace(/\bln\s*\(/g, 'log(');

  return cleaned;
}

/**
 * Compiles a mathematical expression into a safe executable function
 */
export function compileExpression(expr: string): { fn: ((x: number) => number) | null; error: string | null } {
  const normalized = normalizeMathExpression(expr);
  if (!normalized) {
    return { fn: null, error: 'لطفاً عبارت تابع را وارد کنید.' };
  }

  try {
    const compiled = math.compile(normalized);
    
    // Test evaluation at x = 1 and x = 2 to ensure validity and detect runtime errors early
    const testScope = { x: 1, pi: Math.PI, e: Math.E };
    const testResult = compiled.evaluate(testScope);
    
    if (typeof testResult !== 'number' && typeof testResult !== 'boolean') {
      // Could be complex or matrix or unit
      if (testResult && typeof testResult === 'object' && 'im' in testResult) {
        // Complex number returned at x=1, but might still be valid for real domain
      } else {
        return { fn: null, error: 'خروجی عبارت باید یک مقدار عددی حقیقی باشد.' };
      }
    }

    const safeFn = (x: number): number => {
      try {
        const val = compiled.evaluate({ x, pi: Math.PI, e: Math.E });
        if (typeof val === 'number') {
          if (Number.isNaN(val) || !Number.isFinite(val)) {
            throw new Error(`مقدار تابع در x = ${x} تعریف نشده یا بی‌نهایت است.`);
          }
          return val;
        } else if (val && typeof val === 'object' && 'im' in val) {
          if (Math.abs(val.im) < 1e-12) {
            return val.re;
          }
          throw new Error(`مقدار مختلط در دامنه اعداد حقیقی تولید شد (${val.toString()}).`);
        }
        return Number(val);
      } catch (err: any) {
        throw new Error(`خطا در ارزیابی تابع در x = ${x}: ${err.message}`);
      }
    };

    return { fn: safeFn, error: null };
  } catch (err: any) {
    return {
      fn: null,
      error: translateMathError(err.message || 'عبارت ریاضی نامعتبر است.')
    };
  }
}

/**
 * Derives the expression symbolically with mathjs or returns null if not possible
 */
export function getSymbolicDerivative(expr: string): { derivativeExpr: string | null; error: string | null } {
  const normalized = normalizeMathExpression(expr);
  if (!normalized) return { derivativeExpr: null, error: null };

  try {
    const parsed = math.parse(normalized);
    const derived = math.derivative(parsed, 'x');
    return { derivativeExpr: derived.toString(), error: null };
  } catch (err: any) {
    return { derivativeExpr: null, error: err.message };
  }
}

/**
 * Computes numerical derivative using central finite difference:
 * f'(x) ≈ (f(x + h) - f(x - h)) / (2h)
 */
export function numericalDerivative(fn: (x: number) => number, x: number): number {
  const h = Math.max(1e-6, Math.abs(x) * 1e-7);
  const fPlus = fn(x + h);
  const fMinus = fn(x - h);
  return (fPlus - fMinus) / (2 * h);
}

/**
 * Translates common mathjs error messages into Persian
 */
function translateMathError(msg: string): string {
  if (msg.includes('Parenthesis ) expected') || msg.includes('Unexpected end of expression')) {
    return 'پرانتزها بسته نشده‌اند یا ساختار عبارت ناقص است.';
  }
  if (msg.includes('Unexpected type of argument') || msg.includes('Undefined symbol')) {
    const match = msg.match(/Undefined symbol (\w+)/);
    if (match) {
      return `نماد ناشناخته «${match[1]}». فقط از متغیر x و توابع مجاز استفاده کنید.`;
    }
    return 'متغیر یا عملگر نامعتبر در عبارت یافت شد.';
  }
  if (msg.includes('Value expected')) {
    return 'عملگر بدون مقدار یا عدد پس از آن وارد شده است.';
  }
  return `خطای نحوی: ${msg}`;
}
