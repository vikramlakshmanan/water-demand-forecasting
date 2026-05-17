
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'analyst', 'viewer');
CREATE TYPE public.demand_level AS ENUM ('low', 'normal', 'high', 'critical');
CREATE TYPE public.alert_severity AS ENUM ('info', 'warning', 'critical');
CREATE TYPE public.alert_status AS ENUM ('active', 'acknowledged', 'resolved');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles (separate table to prevent privilege escalation)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role helper
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Water data
CREATE TABLE public.water_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  city TEXT NOT NULL,
  area TEXT,
  population BIGINT NOT NULL,
  rainfall NUMERIC NOT NULL,
  temperature NUMERIC NOT NULL,
  humidity NUMERIC NOT NULL,
  water_consumption NUMERIC NOT NULL,
  industrial_usage NUMERIC NOT NULL,
  domestic_usage NUMERIC NOT NULL,
  reservoir_level NUMERIC NOT NULL,
  groundwater_level NUMERIC NOT NULL,
  demand_level demand_level NOT NULL DEFAULT 'normal',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.water_data ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_water_data_city_year ON public.water_data(city, year);

-- Forecasts
CREATE TABLE public.forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  forecast_year INTEGER NOT NULL,
  predicted_demand NUMERIC NOT NULL,
  confidence_score NUMERIC NOT NULL,
  sustainability_score NUMERIC NOT NULL,
  shortage_probability NUMERIC NOT NULL,
  recommendation TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.forecasts ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_forecasts_city_year ON public.forecasts(city, forecast_year);

-- Alerts
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  severity alert_severity NOT NULL DEFAULT 'warning',
  city TEXT NOT NULL,
  message TEXT NOT NULL,
  status alert_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies: profiles
CREATE POLICY "Profiles viewable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- RLS policies: user_roles
CREATE POLICY "Roles viewable by authenticated" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies: water_data (read for all authed, write for admin/analyst)
CREATE POLICY "Water data readable by authenticated" ON public.water_data FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/analyst insert water data" ON public.water_data FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'analyst'));
CREATE POLICY "Admin/analyst update water data" ON public.water_data FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'analyst'));
CREATE POLICY "Admin delete water data" ON public.water_data FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies: forecasts
CREATE POLICY "Forecasts readable by authenticated" ON public.forecasts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/analyst manage forecasts" ON public.forecasts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'analyst'));

-- RLS policies: alerts
CREATE POLICY "Alerts readable by authenticated" ON public.alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/analyst manage alerts" ON public.alerts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'analyst'));

-- Auto-create profile + viewer role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'viewer');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed historical data for 4 Indian cities, 2015-2025
INSERT INTO public.water_data (year, city, area, population, rainfall, temperature, humidity, water_consumption, industrial_usage, domestic_usage, reservoir_level, groundwater_level, demand_level) VALUES
-- Mumbai
(2015, 'Mumbai', 'Greater Mumbai', 12400000, 2422, 27.2, 75, 3750, 950, 2800, 78, 65, 'normal'),
(2016, 'Mumbai', 'Greater Mumbai', 12550000, 2105, 27.5, 74, 3820, 970, 2850, 72, 63, 'normal'),
(2017, 'Mumbai', 'Greater Mumbai', 12700000, 3200, 27.3, 78, 3910, 990, 2920, 85, 68, 'normal'),
(2018, 'Mumbai', 'Greater Mumbai', 12850000, 1980, 27.8, 73, 4020, 1015, 3005, 68, 60, 'high'),
(2019, 'Mumbai', 'Greater Mumbai', 13000000, 2890, 27.6, 76, 4150, 1040, 3110, 80, 64, 'normal'),
(2020, 'Mumbai', 'Greater Mumbai', 13150000, 3050, 27.4, 77, 4220, 1060, 3160, 82, 66, 'normal'),
(2021, 'Mumbai', 'Greater Mumbai', 13300000, 2780, 27.7, 76, 4340, 1085, 3255, 78, 65, 'high'),
(2022, 'Mumbai', 'Greater Mumbai', 13450000, 2510, 28.0, 75, 4470, 1115, 3355, 74, 62, 'high'),
(2023, 'Mumbai', 'Greater Mumbai', 13600000, 2640, 28.2, 74, 4590, 1145, 3445, 76, 61, 'high'),
(2024, 'Mumbai', 'Greater Mumbai', 13750000, 2380, 28.5, 73, 4720, 1175, 3545, 70, 58, 'critical'),
(2025, 'Mumbai', 'Greater Mumbai', 13900000, 2450, 28.7, 73, 4860, 1210, 3650, 71, 56, 'critical'),
-- Delhi
(2015, 'Delhi', 'NCT Delhi', 18600000, 612, 25.2, 60, 4200, 1100, 3100, 65, 50, 'high'),
(2016, 'Delhi', 'NCT Delhi', 18900000, 580, 25.5, 58, 4310, 1130, 3180, 62, 48, 'high'),
(2017, 'Delhi', 'NCT Delhi', 19200000, 720, 25.4, 62, 4420, 1160, 3260, 68, 50, 'high'),
(2018, 'Delhi', 'NCT Delhi', 19500000, 510, 25.8, 56, 4540, 1190, 3350, 58, 45, 'critical'),
(2019, 'Delhi', 'NCT Delhi', 19800000, 660, 25.7, 60, 4670, 1225, 3445, 64, 47, 'high'),
(2020, 'Delhi', 'NCT Delhi', 20100000, 780, 25.5, 63, 4790, 1255, 3535, 70, 50, 'high'),
(2021, 'Delhi', 'NCT Delhi', 20400000, 590, 25.9, 58, 4920, 1290, 3630, 60, 46, 'critical'),
(2022, 'Delhi', 'NCT Delhi', 20700000, 540, 26.2, 56, 5060, 1325, 3735, 56, 43, 'critical'),
(2023, 'Delhi', 'NCT Delhi', 21000000, 620, 26.4, 58, 5200, 1365, 3835, 58, 41, 'critical'),
(2024, 'Delhi', 'NCT Delhi', 21300000, 500, 26.7, 55, 5340, 1400, 3940, 52, 38, 'critical'),
(2025, 'Delhi', 'NCT Delhi', 21600000, 560, 26.9, 56, 5490, 1440, 4050, 54, 36, 'critical'),
-- Bengaluru
(2015, 'Bengaluru', 'BBMP', 9800000, 970, 23.5, 65, 1450, 380, 1070, 72, 55, 'normal'),
(2016, 'Bengaluru', 'BBMP', 10100000, 880, 23.8, 63, 1510, 395, 1115, 68, 52, 'normal'),
(2017, 'Bengaluru', 'BBMP', 10400000, 1050, 23.6, 67, 1570, 410, 1160, 76, 55, 'normal'),
(2018, 'Bengaluru', 'BBMP', 10700000, 820, 24.0, 61, 1640, 425, 1215, 64, 50, 'high'),
(2019, 'Bengaluru', 'BBMP', 11000000, 940, 23.9, 64, 1710, 445, 1265, 70, 52, 'normal'),
(2020, 'Bengaluru', 'BBMP', 11300000, 1020, 23.7, 66, 1780, 460, 1320, 74, 54, 'normal'),
(2021, 'Bengaluru', 'BBMP', 11600000, 890, 24.0, 63, 1860, 480, 1380, 66, 50, 'high'),
(2022, 'Bengaluru', 'BBMP', 11900000, 800, 24.2, 61, 1940, 500, 1440, 60, 47, 'high'),
(2023, 'Bengaluru', 'BBMP', 12200000, 750, 24.5, 60, 2030, 525, 1505, 56, 44, 'high'),
(2024, 'Bengaluru', 'BBMP', 12500000, 680, 24.7, 58, 2120, 545, 1575, 50, 40, 'critical'),
(2025, 'Bengaluru', 'BBMP', 12800000, 720, 24.9, 59, 2220, 570, 1650, 52, 38, 'critical'),
-- Chennai (Tamil Nadu)
(2015, 'Chennai', 'Greater Chennai', 8700000, 1400, 28.1, 72, 1300, 340, 960, 70, 52, 'normal'),
(2016, 'Chennai', 'Greater Chennai', 8850000, 990, 28.3, 68, 1340, 350, 990, 60, 48, 'high'),
(2017, 'Chennai', 'Greater Chennai', 9000000, 1620, 28.0, 74, 1390, 365, 1025, 78, 55, 'normal'),
(2018, 'Chennai', 'Greater Chennai', 9150000, 870, 28.5, 66, 1450, 380, 1070, 52, 44, 'critical'),
(2019, 'Chennai', 'Greater Chennai', 9300000, 1150, 28.4, 70, 1510, 395, 1115, 65, 48, 'high'),
(2020, 'Chennai', 'Greater Chennai', 9450000, 1380, 28.2, 73, 1570, 410, 1160, 72, 52, 'normal'),
(2021, 'Chennai', 'Greater Chennai', 9600000, 1480, 28.0, 74, 1630, 425, 1205, 76, 54, 'normal'),
(2022, 'Chennai', 'Greater Chennai', 9750000, 1120, 28.5, 70, 1700, 445, 1255, 64, 49, 'high'),
(2023, 'Chennai', 'Greater Chennai', 9900000, 950, 28.7, 67, 1770, 465, 1305, 56, 45, 'high'),
(2024, 'Chennai', 'Greater Chennai', 10050000, 880, 29.0, 65, 1840, 480, 1360, 50, 41, 'critical'),
(2025, 'Chennai', 'Greater Chennai', 10200000, 920, 29.2, 66, 1920, 500, 1420, 52, 39, 'critical');

-- Seed alerts
INSERT INTO public.alerts (alert_type, severity, city, message) VALUES
('reservoir_low', 'critical', 'Delhi', 'Reservoir level at 52% — critical. Immediate water rationing recommended.'),
('groundwater_depletion', 'critical', 'Bengaluru', 'Groundwater dropped to 38% — fastest decline in the past decade.'),
('shortage_risk', 'warning', 'Mumbai', 'Projected 14% shortage by 2028 if monsoon trends continue.'),
('rainfall_decline', 'warning', 'Chennai', 'Rainfall down 34% vs 2017 peak — reservoirs trending dry.'),
('consumption_spike', 'info', 'Mumbai', 'Industrial usage up 4.2% MoM in Greater Mumbai zone.');
