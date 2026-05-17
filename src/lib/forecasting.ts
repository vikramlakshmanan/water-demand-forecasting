/**
 * Lightweight ML forecasting utilities (pure TS, no native deps).
 * Linear regression + trend ensemble for year-by-year water demand prediction.
 */

export interface HistoricalPoint {
  year: number;
  water_consumption: number;
  population: number;
  rainfall: number;
  reservoir_level: number;
  groundwater_level: number;
}

export interface YearlyForecast {
  year: number;
  predicted_demand: number;
  confidence: number;
  sustainability_score: number;
  shortage_probability: number;
}

function linearRegression(xs: number[], ys: number[]) {
  const n = xs.length;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (ys[i] - meanY);
    den += (xs[i] - meanX) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = meanY - slope * meanX;
  // R²
  let ssRes = 0, ssTot = 0;
  for (let i = 0; i < n; i++) {
    const pred = slope * xs[i] + intercept;
    ssRes += (ys[i] - pred) ** 2;
    ssTot += (ys[i] - meanY) ** 2;
  }
  const r2 = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);
  return { slope, intercept, r2 };
}

export function forecastYears(history: HistoricalPoint[], yearsAhead: number): YearlyForecast[] {
  if (history.length < 2) return [];
  const sorted = [...history].sort((a, b) => a.year - b.year);
  const years = sorted.map((p) => p.year);
  const demands = sorted.map((p) => p.water_consumption);
  const populations = sorted.map((p) => p.population);
  const rainfall = sorted.map((p) => p.rainfall);
  const reservoirs = sorted.map((p) => p.reservoir_level);
  const groundwater = sorted.map((p) => p.groundwater_level);

  const demandModel = linearRegression(years, demands);
  const popModel = linearRegression(years, populations);
  const rainModel = linearRegression(years, rainfall);
  const reservoirModel = linearRegression(years, reservoirs);
  const groundwaterModel = linearRegression(years, groundwater);

  const lastYear = years[years.length - 1];
  const lastDemand = demands[demands.length - 1];
  const out: YearlyForecast[] = [];

  for (let i = 1; i <= yearsAhead; i++) {
    const y = lastYear + i;
    // Ensemble: linear trend + population-driven uplift
    const linearPred = demandModel.slope * y + demandModel.intercept;
    const popPred = popModel.slope * y + popModel.intercept;
    const popGrowth = popPred / populations[populations.length - 1];
    const popDrivenPred = lastDemand * popGrowth;
    const ensemble = 0.6 * linearPred + 0.4 * popDrivenPred;

    const projRain = Math.max(0, rainModel.slope * y + rainModel.intercept);
    const projReservoir = Math.max(0, Math.min(100, reservoirModel.slope * y + reservoirModel.intercept));
    const projGW = Math.max(0, Math.min(100, groundwaterModel.slope * y + groundwaterModel.intercept));

    // Sustainability: weighted reservoir + groundwater + rainfall trend
    const rainBaseline = rainfall.reduce((a, b) => a + b, 0) / rainfall.length;
    const rainRatio = Math.min(1.2, projRain / Math.max(1, rainBaseline));
    const sustainability = Math.round(Math.max(0, Math.min(100,
      projReservoir * 0.4 + projGW * 0.4 + rainRatio * 20
    )));

    // Shortage probability: increases as sustainability drops + demand vs supply gap
    const supplyProxy = (projReservoir + projGW) / 2;
    const demandPressure = Math.min(1, ensemble / (lastDemand * 1.5));
    const shortageProb = Math.round(Math.max(0, Math.min(100,
      (100 - supplyProxy) * 0.6 + demandPressure * 40 - 10
    )));

    // Confidence: R² weighted, decays with horizon
    const baseConf = Math.round((demandModel.r2 * 0.7 + popModel.r2 * 0.3) * 100);
    const confidence = Math.max(45, Math.round(baseConf - i * 2.5));

    out.push({
      year: y,
      predicted_demand: Math.round(ensemble),
      confidence,
      sustainability_score: sustainability,
      shortage_probability: Math.max(0, shortageProb),
    });
  }

  return out;
}

export function generateRecommendation(city: string, forecast: YearlyForecast[]): string {
  if (forecast.length === 0) return "Insufficient historical data for recommendations.";
  const critical = forecast.find((f) => f.shortage_probability >= 60);
  const lowSustain = forecast.find((f) => f.sustainability_score < 50);
  const peak = forecast[forecast.length - 1];

  if (critical) {
    return `Water shortage risk in ${city} reaches ${critical.shortage_probability}% by ${critical.year}. Recommend immediate reservoir expansion, leakage audits, and tiered industrial allocation policies.`;
  }
  if (lowSustain) {
    return `Sustainability index for ${city} falls to ${lowSustain.sustainability_score}/100 by ${lowSustain.year}. Prioritize groundwater recharge, rainwater harvesting mandates, and demand-side conservation incentives.`;
  }
  return `${city} projected to need ${peak.predicted_demand} ML/day by ${peak.year} (${peak.confidence}% confidence). Current infrastructure trajectory is acceptable — continue monitoring rainfall trends.`;
}
