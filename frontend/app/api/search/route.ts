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

    const prompt = `Search and analyze current information about "${query}". Provide a balanced perspective analysis.

TOPIC: ${query}

INSTRUCTIONS:
- Search for 5-7 recent, diverse sources about this topic
- Find different viewpoints (mainstream, alternative, international perspectives)
- Extract key supporting, opposing, and neutral points
- Return ONLY valid JSON, no markdown or extra text

OUTPUT FORMAT:
{
  "title": "Main topic about ${query}",
  "summary": "Brief explanation (max 100 words)",
  "perspectives": {
    "for": ["Supporting point here", "Another supporting point"],
    "against": ["Opposing point here", "Another opposing point"],
    "neutral": ["Neutral fact here", "Another neutral fact"]
  },
  "sources": []
}

CRITICAL:
- Return pure JSON only (start with {, end with })
- Do NOT include markdown code blocks or backticks
- Sources will be added from grounding metadata`;

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

    // Extract JSON from response
    let article: any = null;
    try {
      const codeBlockMatch = generatedText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      let jsonText = codeBlockMatch?.[1] || generatedText.substring(
        generatedText.indexOf('{'),
        generatedText.lastIndexOf('}') + 1
      );

      console.log(`[${requestId}] Extracted JSON (first 500 chars):`, jsonText.substring(0, 500));
      article = JSON.parse(jsonText);

      // Validate structure
      if (!article.perspectives?.for || !article.perspectives?.against || !article.perspectives?.neutral) {
        throw new Error('Invalid article structure');
      }

      // Ensure arrays
      ['for', 'against', 'neutral'].forEach(key => {
        if (typeof article.perspectives[key] === 'string') {
          article.perspectives[key] = [article.perspectives[key]];
        }
      });

      article.id = article.id || `search-${Date.now()}`;

      // Use grounding sources if available, otherwise use JSON sources
      article.sources = extractedSources.length > 0 ? extractedSources : (article.sources || []);

      console.log(`[${requestId}] Parsed successfully. Sources: ${article.sources.length}`);
    } catch (parseError) {
      console.error(`[${requestId}] JSON parse error:`, parseError);
      console.error(`[${requestId}] Text:`, generatedText);

      article = {
        id: Date.now().toString(),
        title: `Analysis of "${query}"`,
        summary: 'Unable to parse AI response. Please try again.',
        perspectives: {
          for: ['Error: ' + generatedText.substring(0, 100) + '...'],
          against: [],
          neutral: []
        },
        sources: extractedSources
      };
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
