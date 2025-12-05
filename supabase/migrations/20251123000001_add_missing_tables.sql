-- Migration: Add missing tables for CityHealth platform
-- Date: 2025-11-23
-- Description: Add medical_ads, favorites, and profile_claims tables

-- Create ENUM types for new tables
CREATE TYPE public.ad_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.claim_status AS ENUM ('pending', 'approved', 'rejected');

-- Medical ads table
CREATE TABLE public.medical_ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    status ad_status DEFAULT 'pending',
    display_priority INTEGER DEFAULT 0,
    start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Favorites table
CREATE TABLE public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, provider_id)
);

-- Profile claims table
CREATE TABLE public.profile_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status claim_status DEFAULT 'pending',
    documentation TEXT[] DEFAULT '{}',
    notes TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_medical_ads_provider ON public.medical_ads(provider_id);
CREATE INDEX idx_medical_ads_status ON public.medical_ads(status);
CREATE INDEX idx_medical_ads_priority ON public.medical_ads(display_priority DESC);
CREATE INDEX idx_medical_ads_dates ON public.medical_ads(start_date, end_date);
CREATE INDEX idx_favorites_user ON public.favorites(user_id);
CREATE INDEX idx_favorites_provider ON public.favorites(provider_id);
CREATE INDEX idx_profile_claims_provider ON public.profile_claims(provider_id);
CREATE INDEX idx_profile_claims_user ON public.profile_claims(user_id);
CREATE INDEX idx_profile_claims_status ON public.profile_claims(status);

-- Enable Row Level Security
ALTER TABLE public.medical_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_claims ENABLE ROW LEVEL SECURITY;

-- Add storage bucket for medical ads images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('medical-ads', 'medical-ads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for medical ads
CREATE POLICY "Medical ad images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'medical-ads');

CREATE POLICY "Providers can upload medical ad images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'medical-ads');

CREATE POLICY "Providers can update their own medical ad images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'medical-ads');

-- Add storage bucket for profile claim documentation
INSERT INTO storage.buckets (id, name, public) 
VALUES ('claim-docs', 'claim-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for claim documentation
CREATE POLICY "Providers can upload claim documentation"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'claim-docs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Providers and admins can view claim documentation"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'claim-docs' AND
  (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(), 'admin'))
);