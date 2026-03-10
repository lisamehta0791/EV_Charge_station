
-- Create profiles table (linked to Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Create vehicles table
CREATE TABLE public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_number TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    manufacturer TEXT,
    model TEXT,
    battery_capacity_kwh NUMERIC NOT NULL,
    current_charge_percent NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vehicles"
    ON public.vehicles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vehicles"
    ON public.vehicles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vehicles"
    ON public.vehicles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vehicles"
    ON public.vehicles FOR DELETE
    USING (auth.uid() = user_id);

-- Create road_units table
CREATE TABLE public.road_units (
    id TEXT PRIMARY KEY,
    location TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    power_rating_kw NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.road_units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Road units are viewable by authenticated users"
    ON public.road_units FOR SELECT
    TO authenticated
    USING (true);

-- Create charging_sessions table
CREATE TABLE public.charging_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    road_unit_id TEXT REFERENCES public.road_units(id) ON DELETE SET NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    energy_used_kwh NUMERIC,
    cost_inr NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.charging_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own charging sessions"
    ON public.charging_sessions FOR SELECT
    USING (
        vehicle_id IN (
            SELECT id FROM public.vehicles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own charging sessions"
    ON public.charging_sessions FOR INSERT
    WITH CHECK (
        vehicle_id IN (
            SELECT id FROM public.vehicles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own charging sessions"
    ON public.charging_sessions FOR UPDATE
    USING (
        vehicle_id IN (
            SELECT id FROM public.vehicles WHERE user_id = auth.uid()
        )
    );

-- Create trigger for auto-creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, phone_number, address)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'phone_number', ''),
        COALESCE(NEW.raw_user_meta_data->>'address', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
