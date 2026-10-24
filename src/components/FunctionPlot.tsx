import React, { useRef, useEffect, useState, useMemo } from 'react';
import { SolverResult, MethodType } from '../types/numerical';
import { ZoomIn, ZoomOut, RotateCcw, Play, Pause, ChevronRight, ChevronLeft } from 'lucide-react';

interface FunctionPlotProps {
  fn: ((x: number) => number) | null;
  expression: string;
  result: SolverResult | null;
  method: MethodType;
  defaultA?: number;
  defaultB?: number;
}

export const FunctionPlot: React.FC<FunctionPlotProps> = ({
  fn,
  expression,
  result,
  method,
  defaultA = 0,
  defaultB = 2,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 680, height: 380 });
  const [viewRange, setViewRange] = useState<{ xMin: number; xMax: number; yMin: number; yMax: number }>({
    xMin: -1,
    xMax: 3,
    yMin: -4,
    yMax: 6,
  });

  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number; px: number; py: number } | null>(null);

  // Resize listener
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        setDimensions({
          width: Math.max(320, w),
          height: Math.min(420, Math.max(300, Math.floor(w * 0.55))),
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Automatically adapt viewRange when result or defaults change
  useEffect(() => {
    if (result && result.root !== null) {
      const root = result.root;
      let minX = root - 1.5;
      let maxX = root + 1.5;

      if (result.iterations.length > 0) {
        const xVals: number[] = [];
        result.iterations.forEach((it: any) => {
          if (it.a !== undefined) xVals.push(it.a, it.b, it.c);
          if (it.xn !== undefined) xVals.push(it.xn, it.xnNext);
          if (it.xCurr !== undefined) xVals.push(it.xPrev, it.xCurr, it.xNext);
        });
        if (xVals.length > 0) {
          const actualMin = Math.min(...xVals.filter(Number.isFinite));
          const actualMax = Math.max(...xVals.filter(Number.isFinite));
          const padding = Math.max(0.5, (actualMax - actualMin) * 0.3);
          minX = actualMin - padding;
          maxX = actualMax + padding;
        }
      }

      // Sample y values to scale yMin/yMax
      if (fn) {
        const samples: number[] = [];
        const step = (maxX - minX) / 30;
        for (let x = minX; x <= maxX; x += step) {
          try {
            const y = fn(x);
            if (Number.isFinite(y) && Math.abs(y) < 100) samples.push(y);
          } catch {}
        }
        if (samples.length > 0) {
          const minY = Math.min(...samples);
          const maxY = Math.max(...samples);
          const yPadding = Math.max(1, (maxY - minY) * 0.25);
          setViewRange({
            xMin: minX,
            xMax: maxX,
            yMin: Math.max(-100, minY - yPadding),
            yMax: Math.min(100, maxY + yPadding),
          });
        } else {
          setViewRange({ xMin: minX, xMax: maxX, yMin: -5, yMax: 5 });
        }
      }
      setActiveStepIndex(result.iterations.length - 1);
    } else {
      // Default range
      const minX = Math.min(defaultA, defaultB) - 1;
      const maxX = Math.max(defaultA, defaultB) + 1;
      setViewRange({ xMin: minX, xMax: maxX, yMin: -5, yMax: 5 });
      setActiveStepIndex(-1);
    }
  }, [result, defaultA, defaultB, fn]);

  // Animation player
  useEffect(() => {
    let timer: any;
    if (isPlaying && result && result.iterations.length > 0) {
      timer = setInterval(() => {
        setActiveStepIndex((prev) => {
          if (prev >= result.iterations.length - 1) {
            setIsPlaying(false);
            return result.iterations.length - 1;
          }
          return prev + 1;
        });
      }, 900);
    }
    return () => clearInterval(timer);
  }, [isPlaying, result]);

  // Coordinate mapping
  const toSvgX = (x: number) => {
    return ((x - viewRange.xMin) / (viewRange.xMax - viewRange.xMin)) * dimensions.width;
  };

  const toSvgY = (y: number) => {
    return dimensions.height - ((y - viewRange.yMin) / (viewRange.yMax - viewRange.yMin)) * dimensions.height;
  };

  const toMathX = (svgX: number) => {
    return viewRange.xMin + (svgX / dimensions.width) * (viewRange.xMax - viewRange.xMin);
  };

  // Zoom handlers
  const handleZoom = (factor: number) => {
    const xMid = (viewRange.xMin + viewRange.xMax) / 2;
    const yMid = (viewRange.yMin + viewRange.yMax) / 2;
    const xHalf = ((viewRange.xMax - viewRange.xMin) * factor) / 2;
    const yHalf = ((viewRange.yMax - viewRange.yMin) * factor) / 2;
    setViewRange({
      xMin: xMid - xHalf,
      xMax: xMid + xHalf,
      yMin: yMid - yHalf,
      yMax: yMid + yHalf,
    });
  };

  const resetView = () => {
    if (result && result.root !== null) {
      setViewRange({
        xMin: result.root - 2,
        xMax: result.root + 2,
        yMin: -5,
        yMax: 5,
      });
    } else {
      setViewRange({ xMin: -2, xMax: 4, yMin: -5, yMax: 6 });
    }
  };

  // Generate SVG path for f(x)
  const curvePath = useMemo(() => {
    if (!fn) return '';
    const numPoints = 200;
    const dx = (viewRange.xMax - viewRange.xMin) / numPoints;
    let path = '';
    let isDrawing = false;

    for (let i = 0; i <= numPoints; i++) {
      const x = viewRange.xMin + i * dx;
      try {
        const y = fn(x);
        if (Number.isFinite(y) && !Number.isNaN(y)) {
          const sx = toSvgX(x);
          const sy = toSvgY(y);

          // Clip excessively huge values
          if (sy >= -200 && sy <= dimensions.height + 200) {
            if (!isDrawing) {
              path += `M ${sx.toFixed(1)} ${sy.toFixed(1)} `;
              isDrawing = true;
            } else {
              path += `L ${sx.toFixed(1)} ${sy.toFixed(1)} `;
            }
          } else {
            isDrawing = false;
          }
        } else {
          isDrawing = false;
        }
      } catch {
        isDrawing = false;
      }
    }
    return path;
  }, [fn, viewRange, dimensions]);

  // Compute ticks
  const xTicks = useMemo(() => {
    const ticks: number[] = [];
    const span = viewRange.xMax - viewRange.xMin;
    const step = Math.pow(10, Math.floor(Math.log10(span))) / (span / Math.pow(10, Math.floor(Math.log10(span))) < 3 ? 2 : 1);
    const start = Math.ceil(viewRange.xMin / step) * step;
    for (let x = start; x <= viewRange.xMax; x += step) {
      ticks.push(x);
    }
    return ticks;
  }, [viewRange]);

  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    const span = viewRange.yMax - viewRange.yMin;
    const step = Math.pow(10, Math.floor(Math.log10(span))) / (span / Math.pow(10, Math.floor(Math.log10(span))) < 3 ? 2 : 1);
    const start = Math.ceil(viewRange.yMin / step) * step;
    for (let y = start; y <= viewRange.yMax; y += step) {
      ticks.push(y);
    }
    return ticks;
  }, [viewRange]);

  // Current iteration step details
  const currentStep = result && activeStepIndex >= 0 && activeStepIndex < result.iterations.length
    ? result.iterations[activeStepIndex]
    : null;

  // Handle mouse hover over canvas
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const mx = toMathX(sx);
    if (fn) {
      try {
        const my = fn(mx);
        if (Number.isFinite(my)) {
          setHoverCoord({ x: mx, y: my, px: sx, py: toSvgY(my) });
          return;
        }
      } catch {}
    }
    setHoverCoord(null);
  };

  return (
    <div className="space-y-3">
      {/* Chart Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800">
            نمودار هندسی تابع و تجسم مراحل همگرایی
          </span>
          <span className="text-[11px] font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded" dir="ltr">
            y = {expression}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => handleZoom(0.75)}
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
            title="بزرگ‌نمایی (Zoom In)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleZoom(1.33)}
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
            title="کوچک‌نمایی (Zoom Out)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={resetView}
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
            title="بازنشانی کادر"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Plot Canvas */}
      <div
        ref={containerRef}
        className="relative bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-inner select-none"
        style={{ height: dimensions.height }}
      >
        <svg
          width={dimensions.width}
          height={dimensions.height}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverCoord(null)}
          className="w-full h-full cursor-crosshair"
        >
          {/* Grid lines */}
          <g stroke="#1e293b" strokeWidth="1" strokeDasharray="2,3">
            {xTicks.map((x) => {
              const sx = toSvgX(x);
              return <line key={`gx-${x}`} x1={sx} y1={0} x2={sx} y2={dimensions.height} />;
            })}
            {yTicks.map((y) => {
              const sy = toSvgY(y);
              return <line key={`gy-${y}`} x1={0} y1={sy} x2={dimensions.width} y2={sy} />;
            })}
          </g>

          {/* Coordinate Axes */}
          {/* X-Axis (y = 0) */}
          <line
            x1={0}
            y1={toSvgY(0)}
            x2={dimensions.width}
            y2={toSvgY(0)}
            stroke="#475569"
            strokeWidth="1.5"
          />
          {/* Y-Axis (x = 0) */}
          <line
            x1={toSvgX(0)}
            y1={0}
            x2={toSvgX(0)}
            y2={dimensions.height}
            stroke="#475569"
            strokeWidth="1.5"
          />

          {/* Axis Numerical Labels */}
          {xTicks.map((x) => {
            const sx = toSvgX(x);
            const sy = Math.min(dimensions.height - 8, Math.max(16, toSvgY(0) + 14));
            return (
              <text
                key={`tx-${x}`}
                x={sx}
                y={sy}
                fill="#94a3b8"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
                textAnchor="middle"
              >
                {Math.abs(x) < 1e-12 ? '0' : Number(x.toFixed(2))}
              </text>
            );
          })}

          {yTicks.map((y) => {
            if (Math.abs(y) < 1e-12) return null; // skip 0 to prevent overlap
            const sy = toSvgY(y);
            const sx = Math.min(dimensions.width - 20, Math.max(20, toSvgX(0) + 6));
            return (
              <text
                key={`ty-${y}`}
                x={sx}
                y={sy + 3}
                fill="#64748b"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
                textAnchor="start"
              >
                {Number(y.toFixed(2))}
              </text>
            );
          })}

          {/* Iteration Geometry Visualizations */}
          {currentStep && (
            <g>
              {/* 1. Bisection: Bracket region [a, b] & midpoint c */}
              {'a' in currentStep && 'b' in currentStep && 'c' in currentStep && method === 'bisection' && (
                <>
                  <rect
                    x={toSvgX(currentStep.a)}
                    y={0}
                    width={Math.max(1, toSvgX(currentStep.b) - toSvgX(currentStep.a))}
                    height={dimensions.height}
                    fill="rgba(14, 165, 233, 0.12)"
                    stroke="rgba(14, 165, 233, 0.4)"
                    strokeWidth="1"
                    strokeDasharray="4,3"
                  />
                  {/* Midpoint line */}
                  <line
                    x1={toSvgX(currentStep.c)}
                    y1={toSvgY(0)}
                    x2={toSvgX(currentStep.c)}
                    y2={toSvgY(currentStep.fc)}
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeDasharray="2,2"
                  />
                  <circle
                    cx={toSvgX(currentStep.c)}
                    cy={toSvgY(currentStep.fc)}
                    r="5"
                    fill="#38bdf8"
                  />
                </>
              )}

              {/* 2. Newton-Raphson: Tangent line from (xn, f(xn)) down to (xnNext, 0) */}
              {'xn' in currentStep && 'xnNext' in currentStep && method === 'newton' && (
                <>
                  {/* Tangent line */}
                  <line
                    x1={toSvgX(currentStep.xn)}
                    y1={toSvgY(currentStep.fxn)}
                    x2={toSvgX(currentStep.xnNext)}
                    y2={toSvgY(0)}
                    stroke="#f59e0b"
                    strokeWidth="2"
                  />
                  {/* Vertical drop line to xn */}
                  <line
                    x1={toSvgX(currentStep.xn)}
                    y1={toSvgY(0)}
                    x2={toSvgX(currentStep.xn)}
                    y2={toSvgY(currentStep.fxn)}
                    stroke="#f59e0b"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                  />
                  <circle
                    cx={toSvgX(currentStep.xn)}
                    cy={toSvgY(currentStep.fxn)}
                    r="5"
                    fill="#f59e0b"
                  />
                  <circle
                    cx={toSvgX(currentStep.xnNext)}
                    cy={toSvgY(0)}
                    r="4"
                    fill="#38bdf8"
                  />
                </>
              )}

              {/* 3. Secant Method: Secant line connecting (xPrev, f(xPrev)) & (xCurr, f(xCurr)) */}
              {'xPrev' in currentStep && 'xNext' in currentStep && method === 'secant' && (
                <>
                  <line
                    x1={toSvgX(currentStep.xPrev)}
                    y1={toSvgY(currentStep.fxPrev)}
                    x2={toSvgX(currentStep.xNext)}
                    y2={toSvgY(0)}
                    stroke="#a855f7"
                    strokeWidth="2"
                  />
                  <circle
                    cx={toSvgX(currentStep.xPrev)}
                    cy={toSvgY(currentStep.fxPrev)}
                    r="4"
                    fill="#c084fc"
                  />
                  <circle
                    cx={toSvgX(currentStep.xCurr)}
                    cy={toSvgY(currentStep.fxCurr)}
                    r="5"
                    fill="#a855f7"
                  />
                  <circle
                    cx={toSvgX(currentStep.xNext)}
                    cy={toSvgY(0)}
                    r="4"
                    fill="#38bdf8"
                  />
                </>
              )}

              {/* 4. False Position: Chord connecting (a, f(a)) and (b, f(b)) */}
              {'a' in currentStep && 'b' in currentStep && 'c' in currentStep && method === 'falsePosition' && (
                <>
                  <line
                    x1={toSvgX(currentStep.a)}
                    y1={toSvgY(currentStep.fa)}
                    x2={toSvgX(currentStep.b)}
                    y2={toSvgY(currentStep.fb)}
                    stroke="#10b981"
                    strokeWidth="2"
                  />
                  <circle
                    cx={toSvgX(currentStep.a)}
                    cy={toSvgY(currentStep.fa)}
                    r="4"
                    fill="#10b981"
                  />
                  <circle
                    cx={toSvgX(currentStep.b)}
                    cy={toSvgY(currentStep.fb)}
                    r="4"
                    fill="#10b981"
                  />
                  <circle
                    cx={toSvgX(currentStep.c)}
                    cy={toSvgY(0)}
                    r="5"
                    fill="#38bdf8"
                  />
                </>
              )}
            </g>
          )}

          {/* The Function Curve f(x) */}
          {curvePath && (
            <path
              d={curvePath}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Final Root Marker */}
          {result && result.root !== null && (
            <g>
              <circle
                cx={toSvgX(result.root)}
                cy={toSvgY(0)}
                r="7"
                fill="#ef4444"
                className="animate-pulse"
              />
              <circle
                cx={toSvgX(result.root)}
                cy={toSvgY(0)}
                r="3"
                fill="#ffffff"
              />
              <text
                x={toSvgX(result.root)}
                y={toSvgY(0) - 12}
                fill="#fca5a5"
                fontSize="11"
                fontWeight="bold"
                fontFamily="JetBrains Mono, monospace"
                textAnchor="middle"
              >
                x* ≈ {result.root.toFixed(4)}
              </text>
            </g>
          )}

          {/* Mouse Hover Indicator */}
          {hoverCoord && (
            <g pointerEvents="none">
              <circle cx={hoverCoord.px} cy={hoverCoord.py} r="4" fill="#fbbf24" />
              <rect
                x={Math.min(dimensions.width - 130, Math.max(10, hoverCoord.px - 60))}
                y={Math.max(10, hoverCoord.py - 35)}
                width="120"
                height="24"
                rx="4"
                fill="rgba(15, 23, 42, 0.9)"
                stroke="#475569"
              />
              <text
                x={Math.min(dimensions.width - 70, Math.max(70, hoverCoord.px))}
                y={Math.max(26, hoverCoord.py - 19)}
                fill="#f1f5f9"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
                textAnchor="middle"
              >
                ({hoverCoord.x.toFixed(3)}, {hoverCoord.y.toFixed(3)})
              </text>
            </g>
          )}
        </svg>

        {/* Legend */}
        <div className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs border border-slate-700/80 rounded-md px-2.5 py-1.5 text-[11px] text-slate-300 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-sky-400 inline-block rounded"></span>
            <span>منحنی f(x)</span>
          </div>
          {result && result.root !== null && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
              <span>ریشه تقریبی</span>
            </div>
          )}
        </div>
      </div>

      {/* Step by Step Playback Controller */}
      {result && result.iterations.length > 0 && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white rounded-md transition-all cursor-pointer flex items-center gap-1"
              title={isPlaying ? 'توقف پخش' : 'پخش خودکار مراحل'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="text-[11px]">{isPlaying ? 'توقف' : 'پخش گام‌ها'}</span>
            </button>

            <button
              type="button"
              disabled={activeStepIndex <= 0}
              onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
              className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 rounded-md cursor-pointer"
              title="گام قبلی"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <span className="font-mono text-slate-700 px-1 font-semibold">
              گام {activeStepIndex + 1} از {result.iterations.length}
            </span>

            <button
              type="button"
              disabled={activeStepIndex >= result.iterations.length - 1}
              onClick={() => setActiveStepIndex((prev) => Math.min(result.iterations.length - 1, prev + 1))}
              className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 rounded-md cursor-pointer"
              title="گام بعدی"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Slider */}
          <div className="flex-1 max-w-xs flex items-center gap-2">
            <input
              type="range"
              min="0"
              max={result.iterations.length - 1}
              value={activeStepIndex}
              onChange={(e) => setActiveStepIndex(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
          </div>

          <div className="text-[11px] text-slate-500">
            {method === 'bisection' && 'نمایش بازه و نقطه میانی'}
            {method === 'newton' && 'نمایش خط مماس و تقاطع با محور x'}
            {method === 'secant' && 'نمایش خط وتر دو نقطه قبلی'}
            {method === 'falsePosition' && 'نمایش وتر محصورکننده'}
          </div>
        </div>
      )}
    </div>
  );
};
