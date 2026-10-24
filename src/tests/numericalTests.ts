import { compileExpression } from '../utils/mathParser';
import { solveBisection } from '../algorithms/bisection';
import { solveNewtonRaphson } from '../algorithms/newtonRaphson';
import { solveSecant } from '../algorithms/secant';
import { solveFalsePosition } from '../algorithms/falsePosition';
import { BenchmarkProblem, SolverResult } from '../types/numerical';

export const BENCHMARK_PROBLEMS: BenchmarkProblem[] = [
  {
    id: 'poly-cubic',
    title: 'معادله چندجمله‌ای درجه سه: x³ - x - 2 = 0',
    expression: 'x^3 - x - 2',
    derivativeExpr: '3 * x^2 - 1',
    defaultInterval: [1, 2],
    defaultInitialGuesses: [1, 2],
    knownRoot: 1.5213797068,
    description: 'مسئله استاندارد کتب محاسبات عددی با ریشه حقیقی ساده بین ۱ و ۲.',
  },
  {
    id: 'transcendental-exp',
    title: 'معادله غیرجبری نمایی: e^(-x) - x = 0',
    expression: 'exp(-x) - x',
    derivativeExpr: '-exp(-x) - 1',
    defaultInterval: [0, 1],
    defaultInitialGuesses: [0, 1],
    knownRoot: 0.5671432904,
    description: 'ثابت امگا (Omega constant) که ریشه معادله نمایی و خطی است.',
  },
  {
    id: 'trigonometric-cos',
    title: 'معادله مثلثاتی: cos(x) - x = 0',
    expression: 'cos(x) - x',
    derivativeExpr: '-sin(x) - 1',
    defaultInterval: [0, 1],
    defaultInitialGuesses: [0.5, 1],
    knownRoot: 0.7390851332,
    description: 'عدد دوتی (Dottie number)؛ نقطه تقاطع نمودار کسینوس با نیمساز ربع اول.',
  },
  {
    id: 'mixed-sin-poly',
    title: 'معادله ترکیبی: x² - 4·sin(x) = 0',
    expression: 'x^2 - 4 * sin(x)',
    derivativeExpr: '2 * x - 4 * cos(x)',
    defaultInterval: [1.5, 2.5],
    defaultInitialGuesses: [1.5, 2.5],
    knownRoot: 1.9337537628,
    description: 'ریشه مثبت غیربدیهی تقاطع تابع سهمی درجه دو با تابع نوسانی سینوسی.',
  },
  {
    id: 'logarithmic-kepler',
    title: 'معادله لگاریتمی: x·ln(x) - 1 = 0',
    expression: 'x * ln(x) - 1',
    derivativeExpr: 'ln(x) + 1',
    defaultInterval: [1, 2],
    defaultInitialGuesses: [1.2, 2],
    knownRoot: 1.7632228343,
    description: 'معادله غیرخطی لگاریتمی متداول در مباحث انتقال حرارت و اخترشناسی.',
  },
];

export interface TestCaseResult {
  id: string;
  name: string;
  category: 'bisection' | 'newton' | 'secant' | 'falsePosition' | 'edge_cases';
  passed: boolean;
  expected: string;
  actual: string;
  errorMargin?: number;
  iterations: number;
  durationMs: number;
  details: string;
}

export interface TestSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
  results: TestCaseResult[];
}

/**
 * Runs automated verification test suite across all 4 algorithms and edge cases
 */
export function runAutomatedTests(): TestSuiteSummary {
  const startTime = performance.now();
  const results: TestCaseResult[] = [];

  const defaultOpts = {
    tolerance: 1e-6,
    maxIterations: 60,
    stoppingCriterion: 'absolute_error' as const,
  };

  // 1. Test Bisection on Cubic
  {
    const t0 = performance.now();
    const { fn } = compileExpression('x^3 - x - 2');
    const res = solveBisection({ fn: fn!, a: 1, b: 2, options: defaultOpts });
    const known = 1.5213797;
    const diff = res.root !== null ? Math.abs(res.root - known) : 999;
    const passed = res.status === 'converged' && diff < 1e-5;
    results.push({
      id: 'bisect-poly',
      name: 'آزمون تنصیف: معادله x³ - x - 2 = 0 در [1, 2]',
      category: 'bisection',
      passed,
      expected: `ریشه ≈ ${known} (خطا < 1e-5)`,
      actual: res.root !== null ? `x = ${res.root.toFixed(7)}, وضعیت: ${res.status}` : 'ریشه یافت نشد',
      errorMargin: diff,
      iterations: res.iterationsCount,
      durationMs: performance.now() - t0,
      details: res.statusMessage,
    });
  }

  // 2. Test Bisection on Cos(x) - x
  {
    const t0 = performance.now();
    const { fn } = compileExpression('cos(x) - x');
    const res = solveBisection({ fn: fn!, a: 0, b: 1, options: defaultOpts });
    const known = 0.7390851;
    const diff = res.root !== null ? Math.abs(res.root - known) : 999;
    const passed = res.status === 'converged' && diff < 1e-5;
    results.push({
      id: 'bisect-cos',
      name: 'آزمون تنصیف: معادله cos(x) - x = 0 در [0, 1]',
      category: 'bisection',
      passed,
      expected: `ریشه ≈ ${known}`,
      actual: res.root !== null ? `x = ${res.root.toFixed(7)}` : 'شکست',
      errorMargin: diff,
      iterations: res.iterationsCount,
      durationMs: performance.now() - t0,
      details: res.statusMessage,
    });
  }

  // 3. Test Newton-Raphson on Exp(-x) - x
  {
    const t0 = performance.now();
    const { fn } = compileExpression('exp(-x) - x');
    const res = solveNewtonRaphson({ fn: fn!, x0: 0.5, options: defaultOpts });
    const known = 0.56714329;
    const diff = res.root !== null ? Math.abs(res.root - known) : 999;
    const passed = res.status === 'converged' && diff < 1e-6 && res.iterationsCount <= 8;
    results.push({
      id: 'newton-exp',
      name: 'آزمون نیوتون–رافسون: exp(-x) - x = 0 با حدس x₀ = 0.5',
      category: 'newton',
      passed,
      expected: `ریشه ≈ ${known} در کمتر از ۸ تکرار`,
      actual: res.root !== null ? `x = ${res.root.toFixed(7)} (تکرار: ${res.iterationsCount})` : 'شکست',
      errorMargin: diff,
      iterations: res.iterationsCount,
      durationMs: performance.now() - t0,
      details: res.statusMessage,
    });
  }

  // 4. Test Newton-Raphson on Cubic with Analytical Derivative
  {
    const t0 = performance.now();
    const { fn } = compileExpression('x^3 - x - 2');
    const { fn: dfn } = compileExpression('3 * x^2 - 1');
    const res = solveNewtonRaphson({ fn: fn!, dfn: dfn!, x0: 1.5, options: defaultOpts });
    const known = 1.5213797;
    const diff = res.root !== null ? Math.abs(res.root - known) : 999;
    const passed = res.status === 'converged' && diff < 1e-6 && res.iterationsCount <= 5;
    results.push({
      id: 'newton-cubic-analytical',
      name: 'آزمون نیوتون با مشتق تحلیلی: x³ - x - 2 = 0',
      category: 'newton',
      passed,
      expected: `همگرایی مربعی سریع (≤ ۵ تکرار)، ریشه ≈ ${known}`,
      actual: `x = ${res.root?.toFixed(7)} (تکرار: ${res.iterationsCount})`,
      errorMargin: diff,
      iterations: res.iterationsCount,
      durationMs: performance.now() - t0,
      details: res.statusMessage,
    });
  }

  // 5. Test Secant on Cubic
  {
    const t0 = performance.now();
    const { fn } = compileExpression('x^3 - x - 2');
    const res = solveSecant({ fn: fn!, x0: 1, x1: 2, options: defaultOpts });
    const known = 1.5213797;
    const diff = res.root !== null ? Math.abs(res.root - known) : 999;
    const passed = res.status === 'converged' && diff < 1e-5;
    results.push({
      id: 'secant-cubic',
      name: 'آزمون وتری (Secant): x³ - x - 2 = 0 با x₀=1 و x₁=2',
      category: 'secant',
      passed,
      expected: `ریشه ≈ ${known}`,
      actual: res.root !== null ? `x = ${res.root.toFixed(7)} (تکرار: ${res.iterationsCount})` : 'شکست',
      errorMargin: diff,
      iterations: res.iterationsCount,
      durationMs: performance.now() - t0,
      details: res.statusMessage,
    });
  }

  // 6. Test Secant on Trigonometric
  {
    const t0 = performance.now();
    const { fn } = compileExpression('cos(x) - x');
    const res = solveSecant({ fn: fn!, x0: 0.5, x1: 1, options: defaultOpts });
    const known = 0.7390851;
    const diff = res.root !== null ? Math.abs(res.root - known) : 999;
    const passed = res.status === 'converged' && diff < 1e-5;
    results.push({
      id: 'secant-cos',
      name: 'آزمون وتری (Secant): cos(x) - x = 0',
      category: 'secant',
      passed,
      expected: `ریشه ≈ ${known}`,
      actual: res.root !== null ? `x = ${res.root.toFixed(7)}` : 'شکست',
      errorMargin: diff,
      iterations: res.iterationsCount,
      durationMs: performance.now() - t0,
      details: res.statusMessage,
    });
  }

  // 7. Test False Position on Cubic
  {
    const t0 = performance.now();
    const { fn } = compileExpression('x^3 - x - 2');
    const res = solveFalsePosition({ fn: fn!, a: 1, b: 2, options: defaultOpts });
    const known = 1.5213797;
    const diff = res.root !== null ? Math.abs(res.root - known) : 999;
    const passed = res.status === 'converged' && diff < 1e-5;
    results.push({
      id: 'false-position-poly',
      name: 'آزمون نابجایی (False Position): x³ - x - 2 = 0 در [1, 2]',
      category: 'falsePosition',
      passed,
      expected: `ریشه ≈ ${known}`,
      actual: res.root !== null ? `x = ${res.root.toFixed(7)}` : 'شکست',
      errorMargin: diff,
      iterations: res.iterationsCount,
      durationMs: performance.now() - t0,
      details: res.statusMessage,
    });
  }

  // 8. Test False Position on x^2 - 4*sin(x)
  {
    const t0 = performance.now();
    const { fn } = compileExpression('x^2 - 4 * sin(x)');
    const res = solveFalsePosition({ fn: fn!, a: 1.5, b: 2.5, options: defaultOpts });
    const known = 1.9337537;
    const diff = res.root !== null ? Math.abs(res.root - known) : 999;
    const passed = res.status === 'converged' && diff < 1e-5;
    results.push({
      id: 'false-position-mixed',
      name: 'آزمون نابجایی: x² - 4·sin(x) = 0 در [1.5, 2.5]',
      category: 'falsePosition',
      passed,
      expected: `ریشه ≈ ${known}`,
      actual: res.root !== null ? `x = ${res.root.toFixed(7)}` : 'شکست',
      errorMargin: diff,
      iterations: res.iterationsCount,
      durationMs: performance.now() - t0,
      details: res.statusMessage,
    });
  }

  // 9. Edge Case: Bolzano Bracket Failure on Bisection
  {
    const t0 = performance.now();
    const { fn } = compileExpression('x^2 + 1'); // strictly positive everywhere
    const res = solveBisection({ fn: fn!, a: 1, b: 2, options: defaultOpts });
    const passed = res.status === 'bracket_invalid';
    results.push({
      id: 'edge-bracket-invalid',
      name: 'شرط مرزی: رد بازه هم‌علامت f(a)·f(b) > 0 در تنصیف',
      category: 'edge_cases',
      passed,
      expected: 'رد فوری با وضعیت bracket_invalid',
      actual: `وضعیت برگشتی: ${res.status}`,
      iterations: 0,
      durationMs: performance.now() - t0,
      details: res.statusMessage,
    });
  }

  // 10. Edge Case: Zero Derivative on Newton-Raphson
  {
    const t0 = performance.now();
    const { fn } = compileExpression('x^2 - 2');
    const { fn: dfn } = compileExpression('2 * x');
    // At x0 = 0, df(0) = 0
    const res = solveNewtonRaphson({ fn: fn!, dfn: dfn!, x0: 0, options: defaultOpts });
    const passed = res.status === 'zero_derivative';
    results.push({
      id: 'edge-zero-derivative',
      name: 'شرط مرزی: برخورد با مشتق صفر f\'(x)=0 در نیوتون',
      category: 'edge_cases',
      passed,
      expected: 'توقف ایمن با وضعیت zero_derivative',
      actual: `وضعیت برگشتی: ${res.status}`,
      iterations: res.iterationsCount,
      durationMs: performance.now() - t0,
      details: res.statusMessage,
    });
  }

  // 11. Edge Case: Division by zero in Secant (symmetric points f(x0) = f(x1))
  {
    const t0 = performance.now();
    const { fn } = compileExpression('x^2 - 4');
    // f(-1) = -3, f(1) = -3 => f(x0) - f(x1) = 0
    const res = solveSecant({ fn: fn!, x0: -1, x1: 1, options: defaultOpts });
    const passed = res.status === 'division_by_zero';
    results.push({
      id: 'edge-secant-div-zero',
      name: 'شرط مرزی: تقسیم بر صفر در روش وتری به دلیل f(x₀) = f(x₁)',
      category: 'edge_cases',
      passed,
      expected: 'توقف ایمن با وضعیت division_by_zero',
      actual: `وضعیت برگشتی: ${res.status}`,
      iterations: res.iterationsCount,
      durationMs: performance.now() - t0,
      details: res.statusMessage,
    });
  }

  const durationMs = performance.now() - startTime;
  const passed = results.filter((r) => r.passed).length;

  return {
    total: results.length,
    passed,
    failed: results.length - passed,
    durationMs,
    results,
  };
}
