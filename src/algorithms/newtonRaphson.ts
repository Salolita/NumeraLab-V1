import { NewtonIteration, SolverOptions, SolverResult } from '../types/numerical';
import { numericalDerivative } from '../utils/mathParser';

export interface NewtonRaphsonParams {
  fn: (x: number) => number;
  dfn?: ((x: number) => number) | null;
  x0: number;
  options: SolverOptions;
}

export function solveNewtonRaphson({ fn, dfn, x0, options }: NewtonRaphsonParams): SolverResult {
  const startTime = performance.now();
  const iterations: NewtonIteration[] = [];
  const { tolerance, maxIterations, stoppingCriterion } = options;

  let xCurr = x0;
  const getDerivative = dfn || ((x: number) => numericalDerivative(fn, x));

  for (let k = 1; k <= maxIterations; k++) {
    let fx: number;
    let dfx: number;

    try {
      fx = fn(xCurr);
    } catch (err: any) {
      return {
        method: 'newton',
        status: 'nan_encountered',
        statusMessage: `خطا در تکرار ${k}: تابع در نقطه x = ${xCurr} با خطا مواجه شد. (${err.message})`,
        root: xCurr,
        residual: null,
        iterationsCount: k - 1,
        executionTimeMs: performance.now() - startTime,
        iterations,
        stoppingCriterionUsed: stoppingCriterion,
        toleranceUsed: tolerance,
      };
    }

    // Check if initial or current point is already the exact root
    if (Math.abs(fx) < 1e-15) {
      return {
        method: 'newton',
        status: 'converged',
        statusMessage: `نقطه x = ${xCurr} ریشه دقیق معادله است.`,
        root: xCurr,
        residual: Math.abs(fx),
        iterationsCount: iterations.length,
        executionTimeMs: performance.now() - startTime,
        iterations,
        stoppingCriterionUsed: stoppingCriterion,
        toleranceUsed: tolerance,
      };
    }

    try {
      dfx = getDerivative(xCurr);
    } catch (err: any) {
      return {
        method: 'newton',
        status: 'invalid_input',
        statusMessage: `خطا در محاسبه مشتق در x = ${xCurr}: ${err.message}`,
        root: xCurr,
        residual: Math.abs(fx),
        iterationsCount: k - 1,
        executionTimeMs: performance.now() - startTime,
        iterations,
        stoppingCriterionUsed: stoppingCriterion,
        toleranceUsed: tolerance,
      };
    }

    // Zero derivative check (horizontal tangent)
    if (Math.abs(dfx) < 1e-14 || !Number.isFinite(dfx)) {
      return {
        method: 'newton',
        status: 'zero_derivative',
        statusMessage: `مشتق در تکرار ${k} (x = ${xCurr.toFixed(6)}) برابر صفر یا بسیار نزدیک به صفر شد (f'(x) = ${dfx.toExponential(4)}). خط مماس افقی است و روش نیوتون متوقف شد. لطفاً حدس اولیه دیگری انتخاب کنید.`,
        root: xCurr,
        residual: Math.abs(fx),
        iterationsCount: k,
        executionTimeMs: performance.now() - startTime,
        iterations,
        stoppingCriterionUsed: stoppingCriterion,
        toleranceUsed: tolerance,
      };
    }

    const xNext = xCurr - fx / dfx;

    // Divergence / NaN check
    if (!Number.isFinite(xNext) || Number.isNaN(xNext) || Math.abs(xNext) > 1e16) {
      return {
        method: 'newton',
        status: 'diverged',
        statusMessage: `روش نیوتون–رافسون واگرا شد (مقدار x به ${xNext} میل کرد). لطفاً حدس اولیه نزدیک‌تری به ریشه انتخاب کنید.`,
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
      xn: xCurr,
      fxn: fx,
      dfxn: dfx,
      xnNext: xNext,
      absError,
      relError,
    });

    let nextFx = 0;
    try {
      nextFx = fn(xNext);
    } catch {
      nextFx = fx; // fallback
    }

    // Check stopping criteria
    let isConverged = false;
    if (Math.abs(nextFx) < 1e-15) {
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
          isConverged = Math.abs(nextFx) < tolerance;
          break;
        case 'combined':
          isConverged = absError < tolerance && Math.abs(nextFx) < tolerance;
          break;
      }
    }

    if (isConverged) {
      return {
        method: 'newton',
        status: 'converged',
        statusMessage: `الگوریتم نیوتون–رافسون پس از ${k} تکرار با موفقیت همگرا شد.`,
        root: xNext,
        residual: Math.abs(nextFx),
        iterationsCount: k,
        executionTimeMs: performance.now() - startTime,
        iterations,
        stoppingCriterionUsed: stoppingCriterion,
        toleranceUsed: tolerance,
      };
    }

    xCurr = xNext;
  }

  // Max iterations reached
  let finalResidual: number | null = null;
  try {
    finalResidual = Math.abs(fn(xCurr));
  } catch {}

  return {
    method: 'newton',
    status: 'max_iterations_reached',
    statusMessage: `روش به حداکثر تعداد تکرار مجاز (${maxIterations}) رسید اما با دقت مورد نظر همگرا نشد. آخرین مقدار: ${xCurr.toFixed(8)}`,
    root: xCurr,
    residual: finalResidual,
    iterationsCount: maxIterations,
    executionTimeMs: performance.now() - startTime,
    iterations,
    stoppingCriterionUsed: stoppingCriterion,
    toleranceUsed: tolerance,
  };
}
