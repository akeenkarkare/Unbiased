import { NextResponse } from 'next/server';
import { getActiveArticles } from '@/lib/supabaseHelpers';

export async function GET() {
  try {
    // Get current articles
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
