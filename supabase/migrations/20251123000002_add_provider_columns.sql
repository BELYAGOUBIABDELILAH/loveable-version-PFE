-- Migration: Add missing columns to providers table
-- Date: 2025-11-23
-- Description: Add is_preloaded, is_claimed, accessibility_features, and home_visit_available columns

-- Add missing columns to providers table
ALTER TABLE public.providers 
ADD COLUMN is_preloaded BOOLEAN DEFAULT false,
ADD COLUMN is_claimed BOOLEAN DEFAULT false,
ADD COLUMN accessibility_features TEXT[] DEFAULT '{}',
ADD COLUMN home_visit_available BOOLEAN DEFAULT false;

-- Create indexes for new columns
CREATE INDEX idx_providers_preloaded ON public.providers(is_preloaded);
CREATE INDEX idx_providers_claimed ON public.providers(is_claimed);
CREATE INDEX idx_providers_accessibility ON public.providers USING GIN(accessibility_features);
CREATE INDEX idx_providers_home_visit ON public.providers(home_visit_available);

-- Add comments for documentation
COMMENT ON COLUMN public.providers.is_preloaded IS 'Indicates if this provider profile was bulk-imported by admin';
COMMENT ON COLUMN public.providers.is_claimed IS 'Indicates if a preloaded profile has been claimed by a real provider';
COMMENT ON COLUMN public.providers.accessibility_features IS 'Array of accessibility features like wheelchair, parking, elevator, etc.';
COMMENT ON COLUMN public.providers.home_visit_available IS 'Indicates if the provider offers home/mobile services';