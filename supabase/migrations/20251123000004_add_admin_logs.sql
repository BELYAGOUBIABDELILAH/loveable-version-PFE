-- Migration: Add admin_logs table for tracking admin actions
-- Date: 2025-11-23
-- Description: Create admin_logs table to track all admin modifications

-- Create admin_logs table
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  changes JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX idx_admin_logs_admin_id ON public.admin_logs(admin_id);
CREATE INDEX idx_admin_logs_entity_type ON public.admin_logs(entity_type);
CREATE INDEX idx_admin_logs_entity_id ON public.admin_logs(entity_id);
CREATE INDEX idx_admin_logs_timestamp ON public.admin_logs(timestamp DESC);
CREATE INDEX idx_admin_logs_action ON public.admin_logs(action);

-- Add comments for documentation
COMMENT ON TABLE public.admin_logs IS 'Tracks all administrative actions and modifications';
COMMENT ON COLUMN public.admin_logs.admin_id IS 'ID of the admin user who performed the action';
COMMENT ON COLUMN public.admin_logs.action IS 'Type of action performed (e.g., approve_verification, reject_verification, update_provider, moderate_ad)';
COMMENT ON COLUMN public.admin_logs.entity_type IS 'Type of entity being modified (e.g., provider, medical_ad, verification, profile_claim)';
COMMENT ON COLUMN public.admin_logs.entity_id IS 'ID of the entity being modified';
COMMENT ON COLUMN public.admin_logs.changes IS 'JSON object containing the changes made (before/after values)';
COMMENT ON COLUMN public.admin_logs.timestamp IS 'When the action was performed';

-- Enable Row Level Security
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_logs table
-- Only admins can view logs
CREATE POLICY "Admins can view all admin logs"
ON public.admin_logs FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert logs (system will handle this)
CREATE POLICY "Admins can insert admin logs"
ON public.admin_logs FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- No one can update or delete logs (audit trail integrity)
-- Logs are immutable once created
