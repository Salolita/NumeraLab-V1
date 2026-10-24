import { FalsePositionIteration, SolverOptions, SolverResult } from '../types/numerical';

export interface FalsePositionParams {
  fn: (x: number) => number;
  a: number;
  b: number;
  options: SolverOptions;
}

export function solveFalsePosition({ fn, a: initA, b: initB, options }: FalsePositionParams): SolverResult {
  const startTime = performance.now();
  const iterations: FalsePositionIteration[] = [];
  const { tolerance, maxIterations, stoppingCriterion } = options;

  let a = initA;
  let b = initB;

  if (a > b) {
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
      method: 'falsePosition',
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

  // Exact roots at bounds
  if (Math.abs(fa) < 1e-15) {
    return {
      method: 'falsePosition',
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
      method: 'falsePosition',
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

  // Check Bolzano's sign change condition
  if (fa * fb > 0) {
    return {
      method: 'falsePosition',
      status: 'bracket_invalid',
      statusMessage: `شرط تغییر علامت قضیه بولزانو برقرار نیست: f(${a}) = ${fa.toFixed(4)} و f(${b}) = ${fb.toFixed(4)} هم‌علامت هستند (f(a)·f(b) > 0). روش نابجایی نیازمند بازه محصورکننده ریشه است.`,
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
  let c = a;
  let fc = 0;

  for (let k = 1; k <= maxIterations; k++) {
    const denom = fb - fa;
    if (Math.abs(denom) < 1e-15) {
      return {
        method: 'falsePosition',
        status: 'division_by_zero',
        statusMessage: `در تکرار ${k} مخرج کسر (f(b) - f(a)) برابر صفر شد.`,
        root: c,
        residual: Math.abs(fc),
        iterationsCount: k,
        executionTimeMs: performance.now() - startTime,
        iterations,
        stoppingCriterionUsed: stoppingCriterion,
        toleranceUsed: tolerance,
      };
    }

    // False position root formula
    c = (a * fb - b * fa) / denom;

    if (!Number.isFinite(c) || Number.isNaN(c)) {
      return {
        method: 'falsePosition',
        status: 'nan_encountered',
        statusMessage: `مقدار نامعتبر NaN یا بی‌نهایت در تکرار ${k} تولید شد.`,
        root: null,
        residual: null,
        iterationsCount: k,
        executionTimeMs: performance.now() - startTime,
        iterations,
        stoppingCriterionUsed: stoppingCriterion,
        toleranceUsed: tolerance,
      };
    }

    try {
      fc = fn(c);
    } catch (err: any) {
      return {
        method: 'falsePosition',
        status: 'nan_encountered',
        statusMessage: `خطا در محاسبه مقدار تابع در c = ${c}: ${err.message}`,
        root: c,
        residual: null,
        iterationsCount: k,
        executionTimeMs: performance.now() - startTime,
        iterations,
        stoppingCriterionUsed: stoppingCriterion,
        toleranceUsed: tolerance,
      };
    }

    const stepDiff = prevC !== null ? Math.abs(c - prevC) : Math.abs(b - a);
    const relError = prevC !== null && Math.abs(c) > 1e-14 ? stepDiff / Math.abs(c) : stepDiff;

    iterations.push({
      step: k,
      a,
      b,
      c,
      fa,
      fb,
      fc,
      error: stepDiff,
      relativeError: relError,
    });

    // Convergence check
    let isConverged = false;
    if (Math.abs(fc) < 1e-15) {
      isConverged = true;
    } else {
      switch (stoppingCriterion) {
        case 'absolute_error':
          isConverged = stepDiff < tolerance;
          break;
        case 'relative_error':
          isConverged = relError < tolerance;
          break;
        case 'residual':
          isConverged = Math.abs(fc) < tolerance;
          break;
        case 'combined':
          isConverged = stepDiff < tolerance && Math.abs(fc) < tolerance;
          break;
      }
    }

    if (isConverged) {
      return {
        method: 'falsePosition',
        status: 'converged',
        statusMessage: `الگوریتم نابجایی (False Position) پس از ${k} تکرار با موفقیت همگرا شد.`,
        root: c,
        residual: Math.abs(fc),
        iterationsCount: k,
        executionTimeMs: performance.now() - startTime,
        iterations,
        stoppingCriterionUsed: stoppingCriterion,
        toleranceUsed: tolerance,
      };
    }

    // Interval bracket update
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
    method: 'falsePosition',
    status: 'max_iterations_reached',
    statusMessage: `روش نابجایی به سقف تکرار (${maxIterations}) رسید. توجه کنید که در صورت تقعر یکنواخت تابع، یکی از مرزها ممکن است ثابت بماند و سرعت همگرایی کند شود. آخرین تقریب: ${c.toFixed(8)}`,
    root: c,
    residual: Math.abs(fc),
    iterationsCount: maxIterations,
    executionTimeMs: performance.now() - startTime,
    iterations,
    stoppingCriterionUsed: stoppingCriterion,
    toleranceUsed: tolerance,
  };
}
