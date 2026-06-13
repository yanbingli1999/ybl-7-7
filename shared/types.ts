export type VariableType = 'cost' | 'duration' | 'revenue' | 'custom';

export interface Variable {
  id: string;
  projectId: string;
  name: string;
  type: VariableType;
  min: number;
  max: number;
  mostLikely: number;
  weight: number;
  unit: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectWithVariables extends Project {
  variables: Variable[];
}

export interface Percentiles {
  p5: number;
  p25: number;
  p50: number;
  p75: number;
  p95: number;
}

export interface HistogramBin {
  start: number;
  end: number;
  count: number;
}

export interface Histogram {
  bins: HistogramBin[];
}

export interface SensitivityItem {
  variableId: string;
  variableName: string;
  correlation: number;
  contribution: number;
}

export type DecisionMark = 'acceptable' | 'cost_reduce' | 'pause';

export const DECISION_LABELS: Record<DecisionMark, { label: string; color: string; bg: string; border: string }> = {
  acceptable: { label: '可接受', color: 'text-emerald-300', bg: 'bg-emerald-500/15', border: 'border-emerald-500/40' },
  cost_reduce: { label: '需降本', color: 'text-amber-300', bg: 'bg-amber-500/15', border: 'border-amber-500/40' },
  pause: { label: '暂停推进', color: 'text-red-300', bg: 'bg-red-500/15', border: 'border-red-500/40' },
};

export interface SimulationResult {
  id: string;
  projectId: string;
  runName: string;
  iterations: number;
  timestamp: string;
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  percentiles: Percentiles;
  lossProbability: number;
  var95: number;
  threshold: number;
  histogram: Histogram;
  sensitivity: SensitivityItem[];
  samples?: number[];
  variableSamples?: Record<string, number[]>;
  starred?: boolean;
  decision?: DecisionMark | null;
  keyVersion?: boolean;
}

export interface CompareRecord {
  id: string;
  projectId: string;
  name: string;
  simulationIds: string[];
  createdAt: string;
}

export interface CreateProjectDto {
  name: string;
  description: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
}

export interface CreateVariableDto {
  name: string;
  type: VariableType;
  min: number;
  max: number;
  mostLikely: number;
  weight: number;
  unit: string;
}

export interface UpdateVariableDto {
  name?: string;
  type?: VariableType;
  min?: number;
  max?: number;
  mostLikely?: number;
  weight?: number;
  unit?: string;
}

export interface RunSimulationDto {
  iterations: number;
  threshold: number;
  runName?: string;
}

export interface CreateCompareDto {
  name: string;
  simulationIds: string[];
}

export interface UpdateSimulationDto {
  starred?: boolean;
  decision?: DecisionMark | null;
  keyVersion?: boolean;
}
