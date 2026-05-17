import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { forecastYears, generateRecommendation, type HistoricalPoint } from "./forecasting";

export const runForecast = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({
    city: z.string().min(1).max(100),
    yearsAhead: z.number().int().min(1).max(15),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("water_data")
      .select("year,water_consumption,population,rainfall,reservoir_level,groundwater_level")
      .eq("city", data.city)
      .order("year", { ascending: true });

    if (error) return { error: error.message, forecast: [], recommendation: "" };
    if (!rows || rows.length < 2) {
      return { error: "Not enough historical data for this city.", forecast: [], recommendation: "" };
    }

    const history: HistoricalPoint[] = rows.map((r) => ({
      year: r.year,
      water_consumption: Number(r.water_consumption),
      population: Number(r.population),
      rainfall: Number(r.rainfall),
      reservoir_level: Number(r.reservoir_level),
      groundwater_level: Number(r.groundwater_level),
    }));

    const forecast = forecastYears(history, data.yearsAhead);
    const recommendation = generateRecommendation(data.city, forecast);
    return { error: null, forecast, recommendation };
  });
