import { NextResponse } from 'next/server';
import { getActiveArticles, needsRefresh } from '@/lib/supabaseHelpers';

export async function GET() {
  try {
    // Check if we need to refresh
    const shouldRefresh = await needsRefresh();

    // If refresh is needed, trigger it in the background
    if (shouldRefresh) {
      // Trigger refresh endpoint in background (fire and forget)
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/articles/refresh`, {
        method: 'POST',
      }).catch(err => console.error('Background refresh failed:', err));
    }

    // Get current active articles
    const articles = await getActiveArticles();

    return NextResponse.json({
      articles,
      count: articles.length,
    });

  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
