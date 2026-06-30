import { Link } from "@tanstack/react-router";
import { Droplets, Github } from "lucide-react";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-aurora glow-aqua">
            <Droplets className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Aqua<span className="text-gradient-aurora">Intel</span>
          </span>
        </Link>
        <nav className="hidden gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition hover:text-foreground">Features</a>
          <a href="#forecast" className="transition hover:text-foreground">Forecasting</a>
          <a href="#metrics" className="transition hover:text-foreground">Impact</a>
          <a href="#testimonials" className="transition hover:text-foreground">Customers</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="rounded-md bg-aurora px-4 py-2 text-sm font-medium text-primary-foreground glow-aqua transition hover:opacity-90">
            Launch Platform
          </Link>
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/10 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-aurora">
                <Droplets className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">AquaIntel</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              AI-powered municipal water intelligence for smart cities.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Platform</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Forecast Center</li>
              <li>Analytics</li>
              <li>Smart Alerts</li>
              <li>Reports</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Solutions</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Smart Cities</li>
              <li>Municipal Corporations</li>
              <li>Water Boards</li>
              <li>Urban Planning</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>About</li>
              <li>Contact</li>
              <li>Privacy</li>
              <li>Terms</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} AquaIntel. All rights reserved.</p>
          <a href="#" className="flex items-center gap-1.5 transition hover:text-foreground">
            <Github className="h-3.5 w-3.5" /> GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
