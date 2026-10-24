import { SecantIteration, SolverOptions, SolverResult } from '../types/numerical';

export interface SecantParams {
  fn: (x: number) => number;
  x0: number; // initial guess 1
  x1: number; // initial guess 2
  options: SolverOptions;
}

export function solveSecant({ fn, x0, x1, options }: SecantParams): SolverResult {
  const startTime = performance.now();
  const iterations: SecantIteration[] = [];
  const { tolerance, maxIterations, stoppingCriterion } = options;

  let xPrev = x0;
  let xCurr = x1;

  if (Math.abs(xCurr - xPrev) < 1e-15) {
    return {
      method: 'secant',
      status: 'invalid_input',
      statusMessage: 'دو نقطه شروع اولیه x₀ و x₁ نباید یکسان باشند.',
      root: null,
      residual: null,
      iterationsCount: 0,
      executionTimeMs: performance.now() - startTime,
      iterations: [],
      stoppingCriterionUsed: stoppingCriterion,
      toleranceUsed: tolerance,
    };
  }

  let fxPrev: number;
  let fxCurr: number;

  try {
    fxPrev = fn(xPrev);
    fxCurr = fn(xCurr);
  } catch (err: any) {
    return {
      method: 'secant',
      status: 'invalid_input',
      statusMessage: `خطا در ارزیابی تابع در نقاط شروع اولیه: ${err.message}`,
      root: null,
      residual: null,
      iterationsCount: 0,
      executionTimeMs: performance.now() - startTime,
      iterations: [],
      stoppingCriterionUsed: stoppingCriterion,
      toleranceUsed: tolerance,
    };
  }

  // Exact root at initial points
  if (Math.abs(fxPrev) < 1e-15) {
    return {
      method: 'secant',
      status: 'converged',
      statusMessage: `نقطه شروع x₀ = ${xPrev} ریشه دقیق معادله است.`,
      root: xPrev,
      residual: Math.abs(fxPrev),
      iterationsCount: 0,
      executionTimeMs: performance.now() - startTime,
      iterations: [],
      stoppingCriterionUsed: stoppingCriterion,
      toleranceUsed: tolerance,
    };
  }

  if (Math.abs(fxCurr) < 1e-15) {
    return {
      method: 'secant',
      status: 'converged',
      statusMessage: `نقطه شروع x₁ = ${xCurr} ریشه دقیق معادله است.`,
      root: xCurr,
      residual: Math.abs(fxCurr),
      iterationsCount: 0,
      executionTimeMs: performance.now() - startTime,
      iterations: [],
      stoppingCriterionUsed: stoppingCriterion,
      toleranceUsed: tolerance,
    };
  }

  for (let k = 1; k <= maxIterations; k++) {
    const fDiff = fxCurr - fxPrev;

    // Check zero difference in denominator (division by zero)
    if (Math.abs(fDiff) < 1e-15) {
      return {
        method: 'secant',
        status: 'division_by_zero',
        statusMessage: `در تکرار ${k} مقادیر تابع f(xₖ) = ${fxCurr.toFixed(6)} و f(xₖ₋₁) = ${fxPrev.toFixed(6)} برابر شدند (مخرج کسر صفر شد). شیب خط وتر صفر است و الگوریتم متوقف شد.`,
        root: xCurr,
        residual: Math.abs(fxCurr),
        iterationsCount: k,
        executionTimeMs: performance.now() - startTime,
        iterations,
        stoppingCriterionUsed: stoppingCriterion,
        toleranceUsed: tolerance,
      };
    }

    // Secant formula: xNext = xCurr - fxCurr * (xCurr - xPrev) / (fxCurr - fxPrev)
    const xNext = xCurr - (fxCurr * (xCurr - xPrev)) / fDiff;

    if (!Number.isFinite(xNext) || Number.isNaN(xNext) || Math.abs(xNext) > 1e16) {
      return {
        method: 'secant',
        status: 'diverged',
        statusMessage: `روش وتری واگرا شد (مقدار xNext خارج از محدوده مجاز شد: ${xNext}). لطفاً نقاط شروع نزدیک‌تری انتخاب کنید.`,
        root: null,
        residual: null,
        iterationsCount: k,
        executionTimeMs: performance.now() - startTime,
        iterations,
        stoppingCriterionUsed: stoppingCriterion,
        toleranceUsed: tolerance,
      };
    }

    const absError = Math.abs(xNext - xCurr);
    const relError = Math.abs(xNext) > 1e-14 ? absError / Math.abs(xNext) : absError;

    iterations.push({
      step: k,
      xPrev,
      xCurr,
      fxPrev,
      fxCurr,
      xNext,
      absError,
      relError,
    });

    let fxNext = 0;
    try {
      fxNext = fn(xNext);
    } catch (err: any) {
      return {
        method: 'secant',
        status: 'nan_encountered',
        statusMessage: `خطا در ارزیابی تابع در نقطه بعدی xNext = ${xNext}: ${err.message}`,
        root: xNext,
        residual: null,
        iterationsCount: k,
        executionTimeMs: performance.now() - startTime,
        iterations,
        stoppingCriterionUsed: stoppingCriterion,
        toleranceUsed: tolerance,
      };
    }

    // Check stopping criteria
    let isConverged = false;
    if (Math.abs(fxNext) < 1e-15) {
      isConverged = true;
    } else {
      switch (stoppingCriterion) {
        case 'absolute_error':
          isConverged = absError < tolerance;
          break;
        case 'relative_error':
          isConverged = relError < tolerance;
          break;
        case 'residual':
          isConverged = Math.abs(fxNext) < tolerance;
          break;
        case 'combined':
          isConverged = absError < tolerance && Math.abs(fxNext) < tolerance;
          break;
      }
    }

    if (isConverged) {
      return {
        method: 'secant',
        status: 'converged',
        statusMessage: `الگوریتم وتری (Secant) پس از ${k} تکرار با موفقیت به ریشه همگرا شد.`,
        root: xNext,
        residual: Math.abs(fxNext),
        iterationsCount: k,
        executionTimeMs: performance.now() - startTime,
        iterations,
        stoppingCriterionUsed: stoppingCriterion,
        toleranceUsed: tolerance,
      };
    }

    // Update variables for next step
    xPrev = xCurr;
    fxPrev = fxCurr;
    xCurr = xNext;
    fxCurr = fxNext;
  }

  return {
    method: 'secant',
    status: 'max_iterations_reached',
    statusMessage: `روش وتری به حداکثر تعداد تکرار مجاز (${maxIterations}) رسید اما با دقت مشخص‌شده همگرا نشد. آخرین تقریب: ${xCurr.toFixed(8)}`,
    root: xCurr,
    residual: Math.abs(fxCurr),
    iterationsCount: maxIterations,
    executionTimeMs: performance.now() - startTime,
    iterations,
    stoppingCriterionUsed: stoppingCriterion,
    toleranceUsed: tolerance,
  };
}
