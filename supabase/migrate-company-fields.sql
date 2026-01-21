-- Migration: Add company fields to profiles table
-- Run this in your Supabase SQL Editor

-- Add company fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS company_url text,
ADD COLUMN IF NOT EXISTS company_description text;

-- Create index on company_url for searching
CREATE INDEX IF NOT EXISTS profiles_company_url_idx ON public.profiles(company_url);

-- Function to normalize URL for searching (strips protocol and www)
CREATE OR REPLACE FUNCTION public.normalize_url(url text)
RETURNS text AS $$
BEGIN
  IF url IS NULL THEN
    RETURN NULL;
  END IF;
  -- Remove protocol and www
  RETURN lower(regexp_replace(regexp_replace(url, '^https?://', ''), '^www\.', ''));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create index on normalized company_url
CREATE INDEX IF NOT EXISTS profiles_company_url_normalized_idx 
ON public.profiles(public.normalize_url(company_url));
