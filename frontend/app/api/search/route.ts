import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    const prompt = `Find recent news articles about "${query}". Present information about this topic from multiple perspectives. For each relevant news story, provide the title, a brief summary, the source, and publication date.

Then present three different viewpoints on this topic:
- Supporting arguments and evidence
- Critical arguments and concerns  
- Background context and balanced analysis

Format as a JSON array:
[
  {
    "title": "News article title",
    "summary": "Brief article summary",
    "source": "News source name",
    "publishedAt": "2025-10-04",
    "perspectives": {
      "for": "Supporting arguments and evidence",
      "against": "Critical arguments and concerns",
      "neutral": "Background context and analysis"
    }
  }
]

Provide 3-5 relevant news stories. Focus on factual reporting from credible sources.`;

    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 0, // Disables thinking for faster response
        },
      }
    });

    const generatedText = response.text;

    if (!generatedText) {
      return NextResponse.json({ error: 'No results from Gemini API' }, { status: 500 });
    }

    // Try to extract JSON from the response
    let articles = [];
    try {
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        articles = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: create a single article from the response
        articles = [{
          id: Date.now().toString(),
          title: `Search results for "${query}"`,
          summary: generatedText.substring(0, 200) + '...',
          source: 'Gemini Search',
          publishedAt: new Date().toISOString().split('T')[0],
          perspectives: {
            for: 'Various supporting viewpoints were found in the search results.',
            against: 'Various opposing viewpoints were also discovered.',
            neutral: 'The search returned multiple perspectives on this topic.'
          }
        }];
      }
    } catch (parseError) {
      // Fallback response if JSON parsing fails
      articles = [{
        id: Date.now().toString(),
        title: `Search results for "${query}"`,
        summary: generatedText.substring(0, 200) + '...',
        source: 'Gemini Search',
        publishedAt: new Date().toISOString().split('T')[0],
        perspectives: {
          for: 'Various supporting viewpoints were found in the search results.',
          against: 'Various opposing viewpoints were also discovered.',
          neutral: 'The search returned multiple perspectives on this topic.'
        }
      }];
    }

    // Add IDs if missing
    articles = articles.map((article, index) => ({
      ...article,
      id: article.id || `search-${Date.now()}-${index}`
    }));

    return NextResponse.json({ articles, query });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search news articles' },
      { status: 500 }
    );
  }
}