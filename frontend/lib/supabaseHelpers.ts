import { supabase, DBArticle } from './supabase';
import { Article } from './data';

// Convert DB article to frontend Article type
export function dbArticleToArticle(dbArticle: DBArticle): Article {
  return {
    id: dbArticle.id,
    title: dbArticle.title,
    summary: dbArticle.summary,
    content: dbArticle.content,
    source: dbArticle.source,
    publishedAt: dbArticle.published_at,
    engagementScore: dbArticle.engagement_score,
    audioUrl: dbArticle.audio_url,
    perspectives: {
      for: dbArticle.perspective_for,
      against: dbArticle.perspective_against,
      neutral: dbArticle.perspective_neutral,
    },
  };
}

// Get active articles (less than 6 hours old)
export async function getActiveArticles(): Promise<Article[]> {
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .gte('created_at', sixHoursAgo)
    .order('engagement_score', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching articles:', error);
    return [];
  }

  return (data as DBArticle[]).map(dbArticleToArticle);
}

// Check if we need to refresh articles (older than 6 hours or no articles)
export async function needsRefresh(): Promise<boolean> {
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('articles')
    .select('id')
    .gte('created_at', sixHoursAgo)
    .limit(1);

  if (error) {
    console.error('Error checking refresh status:', error);
    return true;
  }

  return !data || data.length === 0;
}

// Delete old articles
export async function deleteOldArticles(): Promise<void> {
  const { error } = await supabase
    .from('articles')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (error) {
    console.error('Error deleting old articles:', error);
  }
}

// Insert new articles
export async function insertArticles(articles: Omit<DBArticle, 'id' | 'created_at' | 'updated_at'>[]): Promise<DBArticle[]> {
  const { data, error } = await supabase
    .from('articles')
    .insert(articles)
    .select();

  if (error) {
    console.error('Error inserting articles:', error);
    throw error;
  }

  return data || [];
}

// Get comments for an article
export async function getCommentsForArticle(articleId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('article_id', articleId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }

  return data;
}

// Get comment count for an article
export async function getCommentCount(articleId: string): Promise<number> {
  const { count, error } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('article_id', articleId);

  if (error) {
    console.error('Error getting comment count:', error);
    return 0;
  }

  return count || 0;
}

// Add a comment
export async function addComment(articleId: string, author: string, content: string) {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      article_id: articleId,
      author,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding comment:', error);
    throw error;
  }

  return data;
}
