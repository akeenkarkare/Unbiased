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

    const prompt = `You are a real-time perspective analysis and structured data extraction assistant. Your sole task is to analyze the input term and strictly adhere to the defined output structure and constraints.

INPUT TERM: ${query}

ACTION & FOCUS:
Find a minimum of 3-5 high-quality, diverse, and recent sources for the INPUT TERM. Identify the most important, current, and hotly debated point or recent news development. Extract information and categorize it into three required perspectives.

OUTPUT FORMAT - Return as JSON array:
[
  {
    "title": "Current debate or main topic about ${query}",
    "summary": "Core definition/description (maximum 100 words): A concise, factual explanation of the INPUT TERM or the most current news/debate",
    "source": "Primary news source",
    "publishedAt": "2025-10-04",
    "perspectives": {
      "for": "In Support/Pros: Arguments for the INPUT TERM's current application or supporting position. Include 2-3 key points with factual claims.",
      "against": "In Dissent/Cons: Arguments against the INPUT TERM's current application or dissenting position. Include 2-3 key points with factual claims.",
      "neutral": "Neutral Facts: Purely descriptive, historical, or background information without bias. Include 2-3 key factual points about current status/timeline."
    }
  }
]

STRICT CONSTRAINTS:
- Return ONLY the JSON array, no other text
- Every perspective must contain factual, cited information
- Focus on current debates and recent developments
- Include only verified, credible source information`;

    const ai = new GoogleGenAI({ apiKey });
    const groundingTool = {
      googleSearch: {},
    };
    const config = {
      tools: [groundingTool],
    };
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: config,
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
    articles = articles.map((article: any, index: number) => ({
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