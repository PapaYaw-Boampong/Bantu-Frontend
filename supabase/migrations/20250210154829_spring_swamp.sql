/*
  # Initial Schema Setup for NTU Project

  1. New Tables
    - `profiles`
      - Extends auth.users with additional user information
      - Stores user preferences and metadata
    
    - `dialects`
      - Stores supported African languages/dialects
      - Reference table for contributions
    
    - `audio_recordings`
      - Stores metadata for audio recordings
      - Links to actual audio files in storage
    
    - `transcriptions`
      - Stores text transcriptions of audio
      - Supports both ASR and human corrections
    
    - `translations`
      - Stores translations of transcribed text
      - Supports both machine and human translations

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for public access where needed

  3. Functions
    - Add function to automatically create profile on user signup
*/

-- Create custom types
CREATE TYPE contribution_status AS ENUM ('pending', 'processing', 'completed', 'error');
CREATE TYPE contribution_type AS ENUM ('recording', 'transcription', 'translation');
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');

-- Create dialects table
CREATE TABLE IF NOT EXISTS dialects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  country text,
  native_language uuid REFERENCES dialects(id),
  preferred_dialects uuid[] DEFAULT ARRAY[]::uuid[],
  contribution_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create audio_recordings table
CREATE TABLE IF NOT EXISTS audio_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  dialect_id uuid REFERENCES dialects(id) ON DELETE SET NULL,
  storage_path text NOT NULL,
  duration_seconds integer,
  status contribution_status DEFAULT 'pending',
  is_generated_prompt boolean DEFAULT false,
  prompt_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transcriptions table
CREATE TABLE IF NOT EXISTS transcriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id uuid REFERENCES audio_recordings(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  text text NOT NULL,
  is_asr_generated boolean DEFAULT false,
  confidence_score float,
  review_status review_status DEFAULT 'pending',
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create translations table
CREATE TABLE IF NOT EXISTS translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transcription_id uuid REFERENCES transcriptions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  text text NOT NULL,
  target_language text DEFAULT 'en',
  is_machine_generated boolean DEFAULT false,
  confidence_score float,
  review_status review_status DEFAULT 'pending',
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dialects ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

-- Create policies

-- Dialects policies (publicly readable)
CREATE POLICY "Dialects are viewable by everyone"
  ON dialects FOR SELECT
  TO public
  USING (true);

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Audio recordings policies
CREATE POLICY "Users can view their own recordings"
  ON audio_recordings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create recordings"
  ON audio_recordings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Transcriptions policies
CREATE POLICY "Users can view transcriptions"
  ON transcriptions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create transcriptions"
  ON transcriptions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own transcriptions"
  ON transcriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Translations policies
CREATE POLICY "Users can view translations"
  ON translations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create translations"
  ON translations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own translations"
  ON translations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert initial dialects
INSERT INTO dialects (name, code, description) VALUES
  ('Yoruba', 'yor', 'Yoruba language from Nigeria'),
  ('Igbo', 'ibo', 'Igbo language from Nigeria'),
  ('Hausa', 'hau', 'Hausa language from Nigeria'),
  ('Swahili', 'swa', 'Swahili language from East Africa'),
  ('Amharic', 'amh', 'Amharic language from Ethiopia'),
  ('Zulu', 'zul', 'Zulu language from South Africa'),
  ('Xhosa', 'xho', 'Xhosa language from South Africa'),
  ('Twi', 'twi', 'Twi language from Ghana'),
  ('Wolof', 'wol', 'Wolof language from Senegal'),
  ('Oromo', 'orm', 'Oromo language from Ethiopia')
ON CONFLICT (code) DO NOTHING;