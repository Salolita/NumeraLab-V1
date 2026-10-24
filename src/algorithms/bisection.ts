import { BisectionIteration, SolverOptions, SolverResult } from '../types/numerical';

export interface BisectionParams {
  fn: (x: number) => number;
  a: number;
  b: number;
  options: SolverOptions;
}

export function solveBisection({ fn, a: initA, b: initB, options }: BisectionParams): SolverResult {
  const startTime = performance.now();
  const iterations: BisectionIteration[] = [];
  const { tolerance, maxIterations, stoppingCriterion } = options;

  let a = initA;
  let b = initB;

  if (a > b) {
    // Ensure a < b
    const temp = a;
    a = b;
    b = temp;
  }

  let fa: number;
  let fb: number;

  try {
    fa = fn(a);
    fb = fn(b);
  } catch (err: any) {
    return {
      method: 'bisection',
      status: 'invalid_input',
      statusMessage: `خطا در محاسبه مقدار تابع در نقاط انتهایی بازه: ${err.message}`,
      root: null,
      residual: null,
      iterationsCount: 0,
      executionTimeMs: performance.now() - startTime,
      iterations: [],
      stoppingCriterionUsed: stoppingCriterion,
      toleranceUsed: tolerance,
    };
  }

  // Exact root at boundaries
  if (Math.abs(fa) < 1e-15) {
    return {
      method: 'bisection',
      status: 'converged',
      statusMessage: `نقطه شروع a = ${a} دقیقاً ریشه معادله است.`,
      root: a,
      residual: Math.abs(fa),
      iterationsCount: 0,
      executionTimeMs: performance.now() - startTime,
      iterations: [{ step: 0, a, b, c: a, fa, fb, fc: fa, error: 0, relativeError: 0 }],
      stoppingCriterionUsed: stoppingCriterion,
      toleranceUsed: tolerance,
    };
  }

  if (Math.abs(fb) < 1e-15) {
    return {
      method: 'bisection',
      status: 'converged',
      statusMessage: `نقطه شروع b = ${b} دقیقاً ریشه معادله است.`,
      root: b,
      residual: Math.abs(fb),
      iterationsCount: 0,
      executionTimeMs: performance.now() - startTime,
      iterations: [{ step: 0, a, b, c: b, fa, fb, fc: fb, error: 0, relativeError: 0 }],
      stoppingCriterionUsed: stoppingCriterion,
      toleranceUsed: tolerance,
    };
  }

  // Bolzano's theorem validation: f(a) * f(b) must be < 0
  if (fa * fb > 0) {
    return {
      method: 'bisection',
      status: 'bracket_invalid',
      statusMessage: `شرط تغییر علامت قضیه بولزانو برقرار نیست: f(${a}) = ${fa.toFixed(4)} و f(${b}) = ${fb.toFixed(4)} هم‌علامت هستند (f(a)·f(b) > 0). لطفاً بازه‌ای با علامت‌های متضاد انتخاب کنید.`,
      root: null,
      residual: null,
      iterationsCount: 0,
      executionTimeMs: performance.now() - startTime,
      iterations: [],
      stoppingCriterionUsed: stoppingCriterion,
      toleranceUsed: tolerance,
    };
  }

  let prevC: number | null = null;
  let c = (a + b) / 2;
  let fc = 0;

  for (let k = 1; k <= maxIterations; k++) {
    c = a + (b - a) / 2; // numerically stable midpoint

    try {
      fc = fn(c);
    } catch (err: any) {
      return {
        method: 'bisection',
        status: 'nan_encountered',
        statusMessage: `خطا در تکرار ${k}: تابع در نقطه c = ${c} مقدار نامعتبر یا خطا تولید کرد. (${err.message})`,
        root: c,
        residual: null,
        iterationsCount: k,
        executionTimeMs: performance.now() - startTime,
        iterations,
        stoppingCriterionUsed: stoppingCriterion,
        toleranceUsed: tolerance,
      };
    }

    const bracketError = (b - a) / 2;
    const stepDiff = prevC !== null ? Math.abs(c - prevC) : bracketError;
    const relError = prevC !== null && Math.abs(c) > 1e-14 ? stepDiff / Math.abs(c) : stepDiff;

    iterations.push({
      step: k,
      a,
      b,
      c,
      fa,
      fb,
      fc,
      error: bracketError,
      relativeError: relError,
    });

    // Convergence check
    let isConverged = false;
    if (Math.abs(fc) < 1e-15) {
      isConverged = true;
    } else {
      switch (stoppingCriterion) {
        case 'absolute_error':
          isConverged = bracketError < tolerance;
          break;
        case 'relative_error':
          isConverged = relError < tolerance;
          break;
        case 'residual':
          isConverged = Math.abs(fc) < tolerance;
          break;
        case 'combined':
          isConverged = bracketError < tolerance && Math.abs(fc) < tolerance;
          break;
      }
    }

    if (isConverged) {
      return {
        method: 'bisection',
        status: 'converged',
        statusMessage: `الگوریتم تنصیف پس از ${k} تکرار با دقت مورد نظر همگرا شد.`,
        root: c,
        residual: Math.abs(fc),
        iterationsCount: k,
        executionTimeMs: performance.now() - startTime,
        iterations,
        stoppingCriterionUsed: stoppingCriterion,
        toleranceUsed: tolerance,
      };
    }

    // Interval update
    if (fa * fc < 0) {
      b = c;
      fb = fc;
    } else {
      a = c;
      fa = fc;
    }

    prevC = c;
  }

  return {
    method: 'bisection',
    status: 'max_iterations_reached',
    statusMessage: `الگوریتم به حداکثر تعداد تکرار مجاز (${maxIterations}) رسید اما به دقت مشخص‌شده نرسید. آخرین تقریب: ${c.toFixed(8)}`,
    root: c,
    residual: Math.abs(fc),
    iterationsCount: maxIterations,
    executionTimeMs: performance.now() - startTime,
    iterations,
    stoppingCriterionUsed: stoppingCriterion,
    toleranceUsed: tolerance,
  };
}
