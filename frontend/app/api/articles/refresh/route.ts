import { NextResponse } from 'next/server';
import { needsRefresh, deactivateOldArticles, insertArticles } from '@/lib/supabaseHelpers';
import { GoogleGenAI } from '@google/genai';
import { generateAndUploadAudio } from '@/lib/audioHelpers';

export async function POST(request: Request) {
  try {
    // Check for force parameter
    const url = new URL(request.url);
    const force = url.searchParams.get('force') === 'true';

    // Check if refresh is needed
    const shouldRefresh = force || await needsRefresh();

    if (!shouldRefresh) {
      return NextResponse.json({
        message: 'Articles are still fresh, no refresh needed',
        refreshed: false
      });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Call Gemini API to get top 10 trending articles
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    const groundingTool = {
      googleSearch: {},
    };
    const config = {
      tools: [groundingTool],
    };

    const prompt = `You are a news curator for an unbiased news platform. Find the top 10 most trending and important news stories from the last 24 hours globally.

For each story:
1. Research equal amounts of FOR and AGAINST perspectives from credible sources
2. Provide a neutral, factual summary
3. Include detailed content covering all perspectives (3-4 paragraphs)
4. Estimate engagement score based on how trending/important the story is (0-1000)

Return ONLY valid JSON array (no markdown, no code blocks):
[
  {
    "title": "Clear, compelling headline",
    "summary": "2-3 sentence neutral summary of the story",
    "content": "Detailed article content (3-4 paragraphs) covering the story from multiple angles. Include context, facts, and different viewpoints.",
    "source": "Primary credible news source",
    "published_at": "ISO 8601 timestamp (recent, within 24 hours)",
    "engagement_score": 500,
    "perspective_for": "1-2 sentences summarizing key arguments/perspectives in favor or supporting this development",
    "perspective_against": "1-2 sentences summarizing key arguments/perspectives against or critical of this development",
    "perspective_neutral": "1-2 sentences with purely objective facts, statistics, or background information",
    "is_active": true
  }
]

Focus on diverse topics: politics, technology, business, science, environment, health, culture, international affairs. Ensure perspectives are balanced and based on real reporting.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
      config: config,
    });

    const generatedText = response.text;

    if (!generatedText) {
      throw new Error('No response from Gemini API');
    }

    // Extract JSON from response
    let newArticles = [];
    try {
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        newArticles = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse JSON from Gemini response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response text:', generatedText);
      throw new Error('Failed to parse articles from Gemini API');
    }

    // Validate and limit to 10 articles
    newArticles = newArticles.slice(0, 10);

    // Deactivate old articles
    await deactivateOldArticles();

    // Generate audio URLs for each article BEFORE inserting
    if (newArticles.length > 0) {
      console.log('Generating audio for articles sequentially...');

      // Generate audio for articles one at a time (ElevenLabs free tier: max 5 concurrent)
      const articlesWithAudio = [];
      for (const article of newArticles) {
        const audioText = `${article.title}. ${article.content}`;

        // Generate a temporary ID for audio file naming
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const audioUrl = await generateAndUploadAudio(tempId, audioText);

        console.log(`Audio generated for article: ${article.title.substring(0, 50)}...`);

        articlesWithAudio.push({
          ...article,
          audio_url: audioUrl
        });
      }

      // Now insert articles with audio URLs
      await insertArticles(articlesWithAudio);
      console.log('Articles inserted with audio URLs');
    }

    return NextResponse.json({
      message: 'Articles refreshed successfully with audio',
      refreshed: true,
      count: newArticles.length
    });

  } catch (error) {
    console.error('Error refreshing articles:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to refresh articles', details: errorMessage },
      { status: 500 }
    );
  }
}

// Allow GET to trigger refresh manually
export async function GET(request: Request) {
  return POST(request);
}
