/*
  # College Results Recovery Portal Database Schema

  1. New Tables
    - `student_results` - Main table storing student marks and grades
      - `id` (uuid, primary key)
      - `roll_no` (text, unique identifier for student)
      - `name` (text, student name)
      - `subject` (text, subject name)
      - `marks` (integer, marks obtained)
      - `grade` (text, grade assigned)
      - `created_at` (timestamp)
      
    - `checkpoint_table` - Backup table for checkpoint recovery
      - `id` (uuid, primary key)
      - `roll_no` (text)
      - `name` (text)
      - `subject` (text)
      - `marks` (integer)
      - `grade` (text)
      - `checkpoint_time` (timestamp)
      
    - `logs` - Transaction log for log-based recovery
      - `id` (uuid, primary key)
      - `roll_no` (text)
      - `old_marks` (integer)
      - `new_marks` (integer)
      - `operation` (text, e.g., INSERT, UPDATE, DELETE)
      - `status` (text, e.g., Committed, Aborted)
      - `created_at` (timestamp)
      
    - `remote_backup` - Remote backup storage
      - `id` (uuid, primary key)
      - `roll_no` (text)
      - `name` (text)
      - `subject` (text)
      - `marks` (integer)
      - `grade` (text)
      - `backup_time` (timestamp)
      
  2. Security
    - Enable RLS on all tables
    - Add policies for anonymous access (demo purposes)
*/

-- Create student_results table
CREATE TABLE IF NOT EXISTS student_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roll_no text NOT NULL,
  name text NOT NULL,
  subject text NOT NULL,
  marks integer NOT NULL,
  grade text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create checkpoint_table
CREATE TABLE IF NOT EXISTS checkpoint_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roll_no text NOT NULL,
  name text NOT NULL,
  subject text NOT NULL,
  marks integer NOT NULL,
  grade text NOT NULL,
  checkpoint_time timestamptz DEFAULT now()
);

-- Create logs table
CREATE TABLE IF NOT EXISTS logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roll_no text NOT NULL,
  old_marks integer,
  new_marks integer,
  operation text NOT NULL,
  status text DEFAULT 'Pending',
  created_at timestamptz DEFAULT now()
);

-- Create remote_backup table
CREATE TABLE IF NOT EXISTS remote_backup (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roll_no text NOT NULL,
  name text NOT NULL,
  subject text NOT NULL,
  marks integer NOT NULL,
  grade text NOT NULL,
  backup_time timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE student_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkpoint_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE remote_backup ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (demo purposes)
CREATE POLICY "Allow anonymous select on student_results"
  ON student_results FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert on student_results"
  ON student_results FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update on student_results"
  ON student_results FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete on student_results"
  ON student_results FOR DELETE
  TO anon
  USING (true);

-- Checkpoint table policies
CREATE POLICY "Allow anonymous select on checkpoint_table"
  ON checkpoint_table FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert on checkpoint_table"
  ON checkpoint_table FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete on checkpoint_table"
  ON checkpoint_table FOR DELETE
  TO anon
  USING (true);

-- Logs table policies
CREATE POLICY "Allow anonymous select on logs"
  ON logs FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert on logs"
  ON logs FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update on logs"
  ON logs FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Remote backup policies
CREATE POLICY "Allow anonymous select on remote_backup"
  ON remote_backup FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert on remote_backup"
  ON remote_backup FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete on remote_backup"
  ON remote_backup FOR DELETE
  TO anon
  USING (true);
