export interface MetricPoint {
  value: number | null;
  timestamp: string;
}

export interface IslandData {
  uniquePlayers?: MetricPoint[];
  plays?: MetricPoint[];
  averageMinutesPerPlayer?: MetricPoint[];
  minutesPlayed?: MetricPoint[];
  favorites?: MetricPoint[];
  recommendations?: MetricPoint[];
  peakCCU?: MetricPoint[];
  retention?: { d1: number | null; d7: number | null }[];
}