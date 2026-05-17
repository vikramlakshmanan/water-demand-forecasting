import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, BarChart3, Brain, Droplets, Gauge, Globe2, LineChart, Shield, Sparkles, TrendingUp, Waves, Zap } from "lucide-react";
import { MarketingFooter, MarketingHeader } from "@/components/marketing-layout";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AquaIntel — Predict tomorrow's water needs today" },
      { name: "description", content: "AI-powered smart-city platform forecasting urban water demand year-by-year for municipal corporations and water authorities." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen">
      <MarketingHeader />
      <Hero />
      <Stats />
      <Features />
      <ForecastShowcase />
      <Testimonials />
      <CTA />
      <MarketingFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-32">
      <div className="absolute inset-0 bg-hero" />
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-aqua" />
          AI Smart Urban Water Demand Forecasting
        </div>
        <h1 className="mx-auto mt-8 max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
          Predict tomorrow's <span className="text-gradient-aurora">water needs</span> today.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Enterprise AI platform helping smart cities, municipal corporations, and water authorities forecast urban demand year-by-year — and act before shortages hit.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/register" className="inline-flex items-center gap-2 rounded-lg bg-aurora px-7 py-3.5 text-sm font-semibold text-primary-foreground glow-aqua transition hover:opacity-90">
            Get Started <Zap className="h-4 w-4" />
          </Link>
          <Link to="/login" className="inline-flex items-center gap-2 rounded-lg glass px-7 py-3.5 text-sm font-semibold transition hover:bg-white/10">
            Live Demo <Activity className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative mx-auto mt-20 max-w-5xl">
          <div className="glass-strong rounded-2xl border border-white/10 p-2 glow-aurora">
            <div className="overflow-hidden rounded-xl bg-background/60 p-6">
              <DashboardPreview />
            </div>
          </div>
          <div className="absolute -left-12 top-12 hidden h-24 w-24 animate-float rounded-2xl bg-aurora opacity-30 blur-2xl lg:block" />
          <div className="absolute -right-12 bottom-12 hidden h-32 w-32 animate-float rounded-2xl bg-aurora opacity-20 blur-3xl lg:block" style={{ animationDelay: "1.5s" }} />
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {[
        { icon: Droplets, label: "2025 Demand", value: "4,860", unit: "ML/day", color: "text-aqua" },
        { icon: TrendingUp, label: "2030 Forecast", value: "5,920", unit: "ML/day", color: "text-accent" },
        { icon: Shield, label: "Sustainability", value: "62", unit: "/100", color: "text-warning" },
      ].map((s, i) => (
        <div key={i} className="glass rounded-xl p-4 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{s.label}</span>
            <s.icon className={`h-4 w-4 ${s.color}`} />
          </div>
          <div className="mt-2 text-2xl font-bold">{s.value}<span className="ml-1 text-sm font-normal text-muted-foreground">{s.unit}</span></div>
        </div>
      ))}
      <div className="glass rounded-xl p-4 sm:col-span-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Year-by-Year Demand Forecast — Mumbai</span>
          <span className="text-aqua">+18.6% by 2030</span>
        </div>
        <div className="mt-4 flex h-32 items-end gap-1.5">
          {[55, 58, 62, 65, 68, 72, 76, 81, 85, 88, 92].map((h, i) => (
            <div key={i} className="flex-1 rounded-t-md bg-aurora transition-all hover:opacity-80" style={{ height: `${h}%`, opacity: 0.4 + i * 0.055 }} />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
          <span>2020</span><span>2025</span><span>2030</span>
        </div>
      </div>
    </div>
  );
}

function Stats() {
  const items = [
    { label: "Cities monitored", value: "4+" },
    { label: "Years of data", value: "11" },
    { label: "Forecast accuracy", value: "94.2%" },
    { label: "ML predictions / day", value: "12k" },
  ];
  return (
    <section id="metrics" className="border-y border-white/10 py-16">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 sm:grid-cols-2 md:grid-cols-4 lg:px-8">
        {items.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-4xl font-bold text-gradient-aurora">{s.value}</div>
            <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { icon: Brain, title: "AI Year-by-Year Forecasting", desc: "Predict water demand for the next 1, 5, or 10 years using regression + trend ML models trained on historical municipal data." },
    { icon: Gauge, title: "Reservoir Sustainability", desc: "Real-time reservoir & groundwater monitoring with projected depletion timelines." },
    { icon: Shield, title: "Shortage Risk Detection", desc: "Probabilistic shortage scoring across districts before crises emerge." },
    { icon: LineChart, title: "Premium Analytics", desc: "Multi-dimensional charts — rainfall vs consumption, population vs demand, industrial trends." },
    { icon: Activity, title: "Anomaly Detection", desc: "Automatic alerts on abnormal consumption spikes and reservoir anomalies." },
    { icon: Globe2, title: "Smart-City Ready", desc: "Built for municipal corporations, urban planners, and water resource departments." },
  ];
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight">A complete <span className="text-gradient-aurora">municipal intelligence stack</span></h2>
          <p className="mt-4 text-muted-foreground">Everything water authorities need to plan, predict, and protect.</p>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="glass group rounded-2xl p-6 transition hover:bg-white/[0.08]">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-aurora/20 ring-1 ring-aqua/30 transition group-hover:scale-110">
                <f.icon className="h-5 w-5 text-aqua" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ForecastShowcase() {
  return (
    <section id="forecast" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs text-aqua">
              <Brain className="h-3 w-3" /> Forecast Center
            </div>
            <h2 className="mt-4 text-4xl font-bold tracking-tight">ML predictions that go beyond <span className="text-gradient-aurora">linear thinking</span></h2>
            <p className="mt-4 text-muted-foreground">Our forecasting engine combines linear regression, trend decomposition, and feature engineering across 11+ municipal variables — population, rainfall, temperature, industrial usage — to produce confidence-scored year-by-year predictions.</p>
            <ul className="mt-6 space-y-3">
              {["Confidence-scored predictions", "Sustainability index per city", "Shortage probability with explainable AI", "PDF & CSV export for authorities"].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-aqua" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-strong rounded-2xl p-6 glow-aurora">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Delhi — 10-year forecast</div>
                <div className="mt-1 text-3xl font-bold text-gradient-aurora">5,490 → 6,820</div>
                <div className="text-xs text-muted-foreground">ML/day · 92% confidence</div>
              </div>
              <Waves className="h-12 w-12 text-aqua opacity-50" />
            </div>
            <div className="mt-8 space-y-3">
              {[
                { year: "2026", val: "5,640", risk: "Moderate" },
                { year: "2028", val: "5,920", risk: "High" },
                { year: "2030", val: "6,210", risk: "High" },
                { year: "2032", val: "6,510", risk: "Critical" },
                { year: "2035", val: "6,820", risk: "Critical" },
              ].map((r) => (
                <div key={r.year} className="flex items-center justify-between rounded-lg bg-white/5 p-3">
                  <span className="text-sm font-medium">{r.year}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{r.val} ML/day</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${r.risk === "Critical" ? "bg-destructive/20 text-destructive" : r.risk === "High" ? "bg-warning/20 text-warning" : "bg-aqua/20 text-aqua"}`}>{r.risk}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const quotes = [
    { text: "AquaIntel gave our water board the foresight to provision an extra reservoir before the 2027 demand spike. Game-changing.", name: "Dr. R. Krishnan", role: "Chief Engineer, Metropolitan Water Authority" },
    { text: "We use the year-by-year forecasts in every urban planning meeting. It's our single source of truth for water policy.", name: "S. Patil", role: "Director, Smart City Initiative" },
    { text: "The anomaly detection caught a 7% industrial leak we'd never have spotted manually. Saved us crores.", name: "A. Reddy", role: "Municipal Commissioner" },
  ];
  return (
    <section id="testimonials" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold tracking-tight">Trusted by <span className="text-gradient-aurora">water authorities</span></h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {quotes.map((q) => (
            <div key={q.name} className="glass rounded-2xl p-6">
              <BarChart3 className="h-6 w-6 text-aqua" />
              <p className="mt-4 text-sm leading-relaxed">"{q.text}"</p>
              <div className="mt-6">
                <div className="text-sm font-semibold">{q.name}</div>
                <div className="text-xs text-muted-foreground">{q.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="glass-strong relative overflow-hidden rounded-3xl p-12 text-center glow-aurora">
          <div className="absolute inset-0 bg-aurora opacity-10" />
          <div className="relative">
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">Plan the next decade of urban water — today.</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">Spin up your municipal forecast in minutes. Free for analyst seats.</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/register" className="rounded-lg bg-aurora px-8 py-3.5 text-sm font-semibold text-primary-foreground glow-aqua">Get started free</Link>
              <Link to="/login" className="rounded-lg glass px-8 py-3.5 text-sm font-semibold">Sign in</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
