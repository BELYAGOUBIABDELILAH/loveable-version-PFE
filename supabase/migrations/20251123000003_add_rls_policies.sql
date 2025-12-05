-- Migration: Add Row Level Security policies for new tables
-- Date: 2025-11-23
-- Description: Add RLS policies for medical_ads, favorites, and profile_claims tables

-- RLS Policies for medical_ads table
-- Public can view approved ads
CREATE POLICY "Approved medical ads are viewable by everyone"
ON public.medical_ads FOR SELECT
USING (status = 'approved');

-- Providers can view their own ads (any status)
CREATE POLICY "Providers can view their own medical ads"
ON public.medical_ads FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.providers
    WHERE providers.id = medical_ads.provider_id
    AND providers.user_id = auth.uid()
  )
);

-- Providers can insert their own ads
CREATE POLICY "Providers can create medical ads"
ON public.medical_ads FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.providers
    WHERE providers.id = medical_ads.provider_id
    AND providers.user_id = auth.uid()
    AND providers.verification_status = 'verified'
  )
);

-- Providers can update their own ads
CREATE POLICY "Providers can update their own medical ads"
ON public.medical_ads FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.providers
    WHERE providers.id = medical_ads.provider_id
    AND providers.user_id = auth.uid()
  )
);

-- Providers can delete their own ads
CREATE POLICY "Providers can delete their own medical ads"
ON public.medical_ads FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.providers
    WHERE providers.id = medical_ads.provider_id
    AND providers.user_id = auth.uid()
  )
);

-- Admins can manage all medical ads
CREATE POLICY "Admins can manage all medical ads"
ON public.medical_ads FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for favorites table
-- Users can view their own favorites
CREATE POLICY "Users can view their own favorites"
ON public.favorites FOR SELECT
USING (auth.uid() = user_id);

-- Users can add favorites
CREATE POLICY "Users can add favorites"
ON public.favorites FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can remove their own favorites
CREATE POLICY "Users can remove their own favorites"
ON public.favorites FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for profile_claims table
-- Providers can view their own claims
CREATE POLICY "Providers can view their own profile claims"
ON public.profile_claims FOR SELECT
USING (auth.uid() = user_id);

-- Providers can view claims for their profiles
CREATE POLICY "Providers can view claims for their profiles"
ON public.profile_claims FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.providers
    WHERE providers.id = profile_claims.provider_id
    AND providers.user_id = auth.uid()
  )
);

-- Providers can create profile claims
CREATE POLICY "Providers can create profile claims"
ON public.profile_claims FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can manage all profile claims
CREATE POLICY "Admins can manage all profile claims"
ON public.profile_claims FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update existing providers RLS policies to include new columns
-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Verified providers are viewable by everyone" ON public.providers;
DROP POLICY IF EXISTS "Providers can update their own profile" ON public.providers;

-- Recreate providers SELECT policy to include new columns
CREATE POLICY "Verified providers are viewable by everyone"
ON public.providers FOR SELECT
USING (
  verification_status = 'verified' 
  OR auth.uid() = user_id 
  OR public.has_role(auth.uid(), 'admin')
);

-- Recreate providers UPDATE policy to include new columns
CREATE POLICY "Providers can update their own profile"
ON public.providers FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add policy for admins to update preloaded/claimed flags
CREATE POLICY "Admins can update preloaded and claimed flags"
ON public.providers FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));