import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  try {
    const { query } = await request.json();
    console.log(`[${requestId}] Received search request for: "${query}"`);

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    const prompt = `You are a JSON generator. Search and analyze "${query}". Return ONLY valid JSON with no extra text.

STRICT JSON FORMAT (copy exactly):
{
  "title": "Brief title about ${query}",
  "summary": "2-3 sentence summary",
  "perspectives": {
    "for": ["Point supporting ${query}", "Another supporting point"],
    "against": ["Point against ${query}", "Another opposing point"],
    "neutral": ["Factual point about ${query}", "Another neutral fact"]
  }
}

RULES:
1. Start response with { and end with }
2. NO markdown, NO backticks, NO code blocks
3. Each perspective array must have at least 1 point
4. Keep points concise (under 150 characters each)
5. Return ONLY the JSON object`;

    const ai = new GoogleGenAI({ apiKey });
    const groundingTool = {
      googleSearch: {},
    };

    const config = {
      tools: [groundingTool],
      temperature: 0.3
    };

    console.log(`[${requestId}] Calling Gemini API...`);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: config,
    });

    console.log(`[${requestId}] Gemini API responded in ${Date.now() - startTime}ms`);

    // Extract sources from grounding metadata
    function extractSourcesFromGrounding(response: any) {
      const sources: any[] = [];
      try {
        const candidate = response.candidates?.[0];
        const metadata = candidate?.groundingMetadata;

        if (metadata?.groundingChunks) {
          metadata.groundingChunks.forEach((chunk: any, idx: number) => {
            if (chunk?.web?.uri) {
              sources.push({
                id: idx + 1,
                name: chunk.web.title || chunk.web.uri.split('/')[2] || 'Source',
                url: chunk.web.uri,
                publishedAt: null
              });
            }
          });
        }
      } catch (e) {
        console.warn(`[${requestId}] Could not extract sources:`, e);
      }
      return sources;
    }

    // Add inline citations to text
    function addCitations(text: string, response: any): string {
      try {
        const candidate = response.candidates?.[0];
        const supports = candidate?.groundingMetadata?.groundingSupports;
        const chunks = candidate?.groundingMetadata?.groundingChunks;

        if (!supports || !chunks) return text;

        const sortedSupports = [...supports].sort(
          (a: any, b: any) => (b.segment?.endIndex ?? 0) - (a.segment?.endIndex ?? 0)
        );

        for (const support of sortedSupports) {
          const endIndex = support.segment?.endIndex;
          if (endIndex === undefined || !support.groundingChunkIndices?.length) continue;

          const citationLinks = support.groundingChunkIndices
            .map((i: number) => {
              const uri = chunks[i]?.web?.uri;
              if (uri) return `[${i + 1}](${uri})`;
              return null;
            })
            .filter(Boolean);

          if (citationLinks.length > 0) {
            const citationString = citationLinks.join(', ');
            text = text.slice(0, endIndex) + citationString + text.slice(endIndex);
          }
        }
      } catch (e) {
        console.warn(`[${requestId}] Could not add citations:`, e);
      }
      return text;
    }

    const extractedSources = extractSourcesFromGrounding(response);
    const generatedText = addCitations(response.text || '', response);

    console.log(`[${requestId}] Extracted ${extractedSources.length} sources`);

    if (!generatedText) {
      console.error(`[${requestId}] No text in Gemini response`);
      return NextResponse.json({ error: 'No results from Gemini API' }, { status: 500 });
    }

    console.log(`[${requestId}] Generated text length:`, generatedText.length);
    console.log(`[${requestId}] First 200 chars:`, generatedText.substring(0, 200));

    // Extract JSON from response with multiple strategies
    let article: any = null;

    // Strategy 1: Try to find JSON in code blocks
    const codeBlockMatch = generatedText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);

    // Strategy 2: Try to find JSON between first { and last }
    const firstBrace = generatedText.indexOf('{');
    const lastBrace = generatedText.lastIndexOf('}');

    // Strategy 3: Clean up common issues
    let jsonText = '';
    if (codeBlockMatch?.[1]) {
      jsonText = codeBlockMatch[1];
      console.log(`[${requestId}] Found JSON in code block`);
    } else if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonText = generatedText.substring(firstBrace, lastBrace + 1);
      console.log(`[${requestId}] Extracted JSON between braces`);
    } else {
      // Try to clean the whole text
      jsonText = generatedText.trim().replace(/^[^{]*/, '').replace(/[^}]*$/, '');
      console.log(`[${requestId}] Cleaned entire text`);
    }

    console.log(`[${requestId}] JSON to parse (first 500 chars):`, jsonText.substring(0, 500));

    try {
      article = JSON.parse(jsonText);

      // Validate and fix structure
      if (!article.title) article.title = `Analysis of "${query}"`;
      if (!article.summary) article.summary = 'Analysis of the topic.';

      if (!article.perspectives) {
        article.perspectives = { for: [], against: [], neutral: [] };
      }

      // Ensure all perspective arrays exist
      ['for', 'against', 'neutral'].forEach(key => {
        if (!article.perspectives[key]) {
          article.perspectives[key] = [];
        } else if (typeof article.perspectives[key] === 'string') {
          article.perspectives[key] = [article.perspectives[key]];
        } else if (!Array.isArray(article.perspectives[key])) {
          article.perspectives[key] = [];
        }
      });

      article.id = article.id || `search-${Date.now()}`;
      article.sources = extractedSources.length > 0 ? extractedSources : (article.sources || []);

      console.log(`[${requestId}] ✅ Parsed successfully. Sources: ${article.sources.length}`);
    } catch (parseError) {
      console.error(`[${requestId}] ❌ JSON parse failed:`, parseError);
      console.error(`[${requestId}] Failed text:`, jsonText.substring(0, 1000));

      // Last resort: return error with sources
      article = {
        id: Date.now().toString(),
        title: `Search Results: ${query}`,
        summary: 'We found sources but had trouble parsing the analysis. Please try your search again.',
        perspectives: {
          for: ['Unable to extract supporting points - please try again'],
          against: ['Unable to extract opposing points - please try again'],
          neutral: ['Unable to extract neutral facts - please try again']
        },
        sources: extractedSources
      };

      console.log(`[${requestId}] ⚠️ Returning fallback response`);
    }

    const totalTime = Date.now() - startTime;
    console.log(`[${requestId}] Request completed in ${totalTime}ms`);

    // Return response WITHOUT debug info to reduce payload size
    return NextResponse.json({
      article,
      query
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search news articles' },
      { status: 500 }
    );
  }
}
