import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { MethodType, StoppingCriterion, SolverResult, BenchmarkProblem } from './types/numerical';
import { compileExpression } from './utils/mathParser';
import { solveBisection, solveNewtonRaphson, solveSecant, solveFalsePosition } from './algorithms';
import { Header } from './components/Header';
import { MathInput } from './components/MathInput';
import { MethodSelector } from './components/MethodSelector';
import { MethodParameters } from './components/MethodParameters';
import { PresetSelector } from './components/PresetSelector';
import { SolverResultCard } from './components/SolverResultCard';
import { IterationTable } from './components/IterationTable';
import { FunctionPlot } from './components/FunctionPlot';
import { ValidationTestsModal } from './components/ValidationTestsModal';
import { EducationalGuide } from './components/EducationalGuide';
import { Calculator, Play, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'solver' | 'benchmarks' | 'tests' | 'guide'>('solver');
  
  // Mathematical expression state
  const [expression, setExpression] = useState<string>('x^3 - x - 2');
  const [customDerivative, setCustomDerivative] = useState<string>('3 * x^2 - 1');
  const [useCustomDerivative, setUseCustomDerivative] = useState<boolean>(false);

  // Method state
  const [selectedMethod, setSelectedMethod] = useState<MethodType>('bisection');

  // Input parameters
  const [a, setA] = useState<number>(1);
  const [b, setB] = useState<number>(2);
  const [x0, setX0] = useState<number>(1.5);
  const [x1, setX1] = useState<number>(2);

  // Solver options
  const [tolerance, setTolerance] = useState<number>(1e-6);
  const [maxIterations, setMaxIterations] = useState<number>(50);
  const [stoppingCriterion, setStoppingCriterion] = useState<StoppingCriterion>('absolute_error');
  const [decimalPlaces, setDecimalPlaces] = useState<number>(6);

  // Execution result
  const [result, setResult] = useState<SolverResult | null>(null);

  // Compile expression for live evaluation
  const { fn: compiledFn, error: syntaxError } = useMemo(() => {
    return compileExpression(expression);
  }, [expression]);

  const { fn: compiledCustomDfn } = useMemo(() => {
    if (!useCustomDerivative || !customDerivative.trim()) return { fn: null };
    return compileExpression(customDerivative);
  }, [useCustomDerivative, customDerivative]);

  // Live evaluation of f(a) and f(b) for bracketing checks
  const evaluatedFa = useMemo(() => {
    if (!compiledFn) return null;
    try {
      return compiledFn(a);
    } catch {
      return null;
    }
  }, [compiledFn, a]);

  const evaluatedFb = useMemo(() => {
    if (!compiledFn) return null;
    try {
      return compiledFn(b);
    } catch {
      return null;
    }
  }, [compiledFn, b]);

  // Core solver runner
  const handleSolve = useCallback(() => {
    if (!compiledFn) {
      return;
    }

    const options = {
      tolerance,
      maxIterations,
      stoppingCriterion,
    };

    let res: SolverResult;

    switch (selectedMethod) {
      case 'bisection':
        res = solveBisection({
          fn: compiledFn,
          a,
          b,
          options,
        });
        break;

      case 'newton':
        res = solveNewtonRaphson({
          fn: compiledFn,
          dfn: useCustomDerivative ? compiledCustomDfn : undefined,
          x0,
          options,
        });
        break;

      case 'secant':
        res = solveSecant({
          fn: compiledFn,
          x0,
          x1,
          options,
        });
        break;

      case 'falsePosition':
        res = solveFalsePosition({
          fn: compiledFn,
          a,
          b,
          options,
        });
        break;
    }

    setResult(res);
  }, [compiledFn, compiledCustomDfn, selectedMethod, a, b, x0, x1, tolerance, maxIterations, stoppingCriterion, useCustomDerivative]);

  // Execute solve on initial mount or when method changes
  useEffect(() => {
    handleSolve();
  }, [selectedMethod]);

  // Preset selector handler
  const handleSelectPreset = (problem: BenchmarkProblem) => {
    setExpression(problem.expression);
    if (problem.derivativeExpr) {
      setCustomDerivative(problem.derivativeExpr);
    }
    setA(problem.defaultInterval[0]);
    setB(problem.defaultInterval[1]);
    setX0(problem.defaultInitialGuesses[0]);
    setX1(problem.defaultInitialGuesses[1]);
    setActiveTab('solver');

    // Run solve immediately after state update
    setTimeout(() => {
      const { fn } = compileExpression(problem.expression);
      if (fn) {
        let res: SolverResult;
        const opts = { tolerance, maxIterations, stoppingCriterion };
        if (selectedMethod === 'bisection') {
          res = solveBisection({ fn, a: problem.defaultInterval[0], b: problem.defaultInterval[1], options: opts });
        } else if (selectedMethod === 'newton') {
          res = solveNewtonRaphson({ fn, x0: problem.defaultInitialGuesses[0], options: opts });
        } else if (selectedMethod === 'secant') {
          res = solveSecant({ fn, x0: problem.defaultInitialGuesses[0], x1: problem.defaultInitialGuesses[1], options: opts });
        } else {
          res = solveFalsePosition({ fn, a: problem.defaultInterval[0], b: problem.defaultInterval[1], options: opts });
        }
        setResult(res);
      }
    }, 50);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onQuickSolve={handleSolve}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab 1: Interactive Solver */}
        {activeTab === 'solver' && (
          <div className="space-y-6">
            {/* Split layout: Controls on right (in RTL), Visualizer & Table on left */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Parameter Deck & Input (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Calculator className="w-4 h-4 text-sky-600" />
                      تنظیمات ورودی و الگوریتم
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelectPreset({
                        id: 'cubic',
                        title: '',
                        expression: 'x^3 - x - 2',
                        derivativeExpr: '3 * x^2 - 1',
                        defaultInterval: [1, 2],
                        defaultInitialGuesses: [1, 2],
                        knownRoot: 1.5213797,
                        description: '',
                      })}
                      className="text-xs text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      مثال پیش‌فرض
                    </button>
                  </div>

                  {/* 1. Method Selector */}
                  <MethodSelector
                    selectedMethod={selectedMethod}
                    setSelectedMethod={setSelectedMethod}
                  />

                  {/* 2. Math Expression Input */}
                  <MathInput
                    expression={expression}
                    setExpression={setExpression}
                    syntaxError={syntaxError}
                    customDerivative={customDerivative}
                    setCustomDerivative={setCustomDerivative}
                    useCustomDerivative={useCustomDerivative}
                    setUseCustomDerivative={setUseCustomDerivative}
                    showDerivativeSection={selectedMethod === 'newton'}
                  />

                  {/* 3. Method Parameters */}
                  <MethodParameters
                    method={selectedMethod}
                    a={a}
                    setA={setA}
                    b={b}
                    setB={setB}
                    x0={x0}
                    setX0={setX0}
                    x1={x1}
                    setX1={setX1}
                    tolerance={tolerance}
                    setTolerance={setTolerance}
                    maxIterations={maxIterations}
                    setMaxIterations={setMaxIterations}
                    stoppingCriterion={stoppingCriterion}
                    setStoppingCriterion={setStoppingCriterion}
                    evaluatedFa={evaluatedFa}
                    evaluatedFb={evaluatedFb}
                  />

                  {/* Solve CTA Button */}
                  <button
                    type="button"
                    onClick={handleSolve}
                    disabled={Boolean(syntaxError)}
                    className="w-full py-3 bg-sky-600 hover:bg-sky-700 active:scale-[0.99] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4" />
                    <span>محاسبه و یافتن ریشه معادله</span>
                  </button>
                </div>
              </div>

              {/* Visualization, Summary & Table (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                {/* Result Card */}
                <SolverResultCard
                  result={result}
                  decimalPlaces={decimalPlaces}
                  setDecimalPlaces={setDecimalPlaces}
                />

                {/* Function Graph Visualizer */}
                <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
                  <FunctionPlot
                    fn={compiledFn}
                    expression={expression}
                    result={result}
                    method={selectedMethod}
                    defaultA={a}
                    defaultB={b}
                  />
                </div>

                {/* Iterations Table */}
                <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
                  <IterationTable
                    result={result}
                    decimalPlaces={decimalPlaces}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Reference Problems */}
        {activeTab === 'benchmarks' && (
          <div className="space-y-4">
            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
              <h2 className="text-base font-bold text-slate-900 mb-1">
                کتابخانه مسائل مرجع و امتحانی محاسبات عددی
              </h2>
              <p className="text-xs text-slate-500">
                مجموعه معادلات متداول دانشگاهی همراه با ریشه معلوم برای بررسی سرعت همگرایی و رفتار الگوریتم‌ها
              </p>
            </div>
            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
              <PresetSelector
                activeExpression={expression}
                onSelectPreset={handleSelectPreset}
              />
            </div>
          </div>
        )}

        {/* Tab 3: Automated Validation Test Suite */}
        {activeTab === 'tests' && (
          <ValidationTestsModal />
        )}

        {/* Tab 4: Theoretical & Educational Guide */}
        {activeTab === 'guide' && (
          <EducationalGuide />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>سامانه محاسبات عددی دانشجویی · حل معادلات غیرخطی f(x) = 0</span>
          <span>محاسبات سمت کاربر با دقت بالا بدون استفاده از مدل‌های زبانی</span>
        </div>
      </footer>
    </div>
  );
}
