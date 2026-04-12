-- H-Fire Admin App: Required Schema Additions
-- Run this in your Supabase SQL Editor

-- Create the app_settings table for Admin & HOA PINs
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default PINs (CHANGE THESE IMMEDIATELY after running!)
-- Admin PIN: 1234 | HOA PIN: 5678
INSERT INTO public.app_settings (key, value) VALUES
    ('admin_pin', '1234'),
    ('hoa_pin', '5678')
ON CONFLICT (key) DO NOTHING;

-- Allow public (anon) read of settings (needed for PIN validation in the app)
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read app_settings" ON public.app_settings
    FOR SELECT USING (true);

CREATE POLICY "Allow update hoa_pin" ON public.app_settings
    FOR UPDATE USING (key = 'hoa_pin');

-- Enable Realtime on incidents (if not already done)
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
