export type MethodType = 'bisection' | 'newton' | 'secant' | 'falsePosition';

export type StoppingCriterion = 'absolute_error' | 'relative_error' | 'residual' | 'combined';

export interface SolverOptions {
  tolerance: number; // e.g. 1e-6
  maxIterations: number; // e.g. 50
  stoppingCriterion: StoppingCriterion;
}

export interface BisectionIteration {
  step: number;
  a: number;
  b: number;
  c: number; // midpoint
  fa: number;
  fb: number;
  fc: number;
  error: number; // |b - a| / 2
  relativeError?: number;
}

export interface NewtonIteration {
  step: number;
  xn: number;
  fxn: number;
  dfxn: number;
  xnNext: number;
  absError: number;
  relError: number;
}

export interface SecantIteration {
  step: number;
  xPrev: number; // x_{k-1}
  xCurr: number; // x_k
  fxPrev: number;
  fxCurr: number;
  xNext: number; // x_{k+1}
  absError: number;
  relError: number;
}

export interface FalsePositionIteration {
  step: number;
  a: number;
  b: number;
  c: number; // false position root
  fa: number;
  fb: number;
  fc: number;
  error: number;
  relativeError?: number;
}

export type IterationStep =
  | BisectionIteration
  | NewtonIteration
  | SecantIteration
  | FalsePositionIteration;

export type ConvergenceStatus =
  | 'converged'
  | 'max_iterations_reached'
  | 'diverged'
  | 'zero_derivative'
  | 'bracket_invalid'
  | 'division_by_zero'
  | 'invalid_input'
  | 'nan_encountered';

export interface SolverResult {
  method: MethodType;
  status: ConvergenceStatus;
  statusMessage: string;
  root: number | null;
  residual: number | null; // |f(root)|
  iterationsCount: number;
  executionTimeMs: number;
  iterations: IterationStep[];
  stoppingCriterionUsed: StoppingCriterion;
  toleranceUsed: number;
}

export interface BenchmarkProblem {
  id: string;
  title: string;
  expression: string;
  derivativeExpr?: string;
  defaultInterval: [number, number];
  defaultInitialGuesses: [number, number];
  knownRoot: number;
  description: string;
}
