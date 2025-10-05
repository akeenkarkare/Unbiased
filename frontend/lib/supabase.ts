import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'set' : 'missing');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'set' : 'missing');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Types for our database
export interface DBArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  published_at: string;
  engagement_score: number;
  audio_url?: string;
  perspective_for: string;
  perspective_against: string;
  perspective_neutral: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface DBComment {
  id: string;
  article_id: string;
  author: string;
  content: string;
  created_at: string;
}
