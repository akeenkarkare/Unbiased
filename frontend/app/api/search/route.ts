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

    const prompt = `You are a real-time perspective analysis and structured data extraction assistant with Google Search access. Your sole task is to analyze "${query}" and strictly adhere to the defined output structure and constraints.

TOPIC TO ANALYZE: ${query}

CRITICAL INSTRUCTIONS:
- MANDATORY: You MUST use Google Search to find real, current information about this topic
- DO NOT hallucinate or make up sources - ONLY use actual websites you find via Google Search
- You have access to Google Search grounding - USE IT to find 5-7 real sources
- USE EXTENDED THINKING: Before responding, engage in deep analysis to explore multiple angles
- MANDATORY: Search and analyze AT LEAST 5-7 DIFFERENT sources from DIVERSE outlets (mainstream media, alternative media, international sources, academic sources, industry publications)
- ACTIVELY SEEK CONTRADICTING VIEWPOINTS: Do not settle for surface-level agreement. Find sources that genuinely disagree with each other
- Cross-reference claims across multiple websites to ensure accuracy and identify bias
- CITE ALL SOURCES: EVERY single point MUST end with an inline citation like [1], [2], [3], etc.
- CITATION FORMAT: Each bullet point must end with the citation number in square brackets, e.g., "This is a claim [1]"
- Track all sources you use and include them in a "sources" array

WORKFLOW:
1. Visit each source and extract up to 2 distinct points per source
2. Categorize each point as "for", "against", or "neutral"
3. If a source has no points for a category (e.g., "against"), leave that category empty for that source
4. After collecting all points from all sources, perform deduplication: remove any points that are repetitive or say essentially the same thing
5. Keep only unique, non-redundant points in the final output
6. LIMIT: Return a MAXIMUM of 5 points per category ("for", "against", "neutral")

ACTION & FOCUS:
Find a high-quality, DIVERSE, and recent sources from DIFFERENT outlets about "${query}". You MUST consult sources with varying political leanings, geographical locations, and perspectives. For EACH source visited, extract up to 2 points and categorize them into "for", "against", or "neutral" perspectives. Return a MAXIMUM of 5 points per category. CITE EVERY CLAIM with the source number [1], [2], etc.

OUTPUT FORMAT EXAMPLE - Return as JSON:
{
  "title": "Current debate or main topic about ${query}",
  "summary": "Core definition/description (maximum 100 words): A concise, factual explanation of ${query} or the most current news/debate",
  "perspectives": {
    "for": [
      {
        "point": "Supporters argue that this policy will increase economic growth",
        "sourceId": 1
      },
      {
        "point": "Proponents claim it reduces bureaucratic overhead and saves taxpayer money",
        "sourceId": 2
      }
    ],
    "against": [
      {
        "point": "Critics warn that this approach could lead to job losses in the public sector",
        "sourceId": 3
      }
    ],
    "neutral": [
      {
        "point": "The policy was first proposed in March 2024 and is currently under review",
        "sourceId": 4
      }
    ]
  },
  "sources": [
    {
      "id": 1,
      "name": "New York Times",
      "url": "https://example.com/article",
      "publishedAt": "2025-10-04"
    },
    {
      "id": 2,
      "name": "Wall Street Journal",
      "url": "https://example.com/article2",
      "publishedAt": "2025-10-03"
    }
  ]
}

IMPORTANT: Each perspective point MUST have both a "point" field and a "sourceId" field that references a source in the sources array.
IMPORTANT: Your entire response must be valid JSON that can be parsed directly. Do not include any explanatory text, thinking process, or formatting markers.`;

    const ai = new GoogleGenAI({ apiKey });

    const groundingTool = {
      googleSearch: {},
    };

    console.log(`[${requestId}] Calling Gemini API...`);
    console.log(`[${requestId}] FULL PROMPT BEING SENT:\n`, prompt);

    // NOTE: Google Search grounding requires PAID API tier ($35 per 1000 queries)
    // Your API key doesn't have grounding enabled - you need to upgrade at aistudio.google.com

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.3,
        tools: [groundingTool],
        maxOutputTokens: 8192, // Limit response size for faster generation
      },
    });

    console.log(`[${requestId}] Gemini API responded in ${Date.now() - startTime}ms`);

    // Log full response to check for grounding metadata
    console.log(`[${requestId}] Full response:`, JSON.stringify(response, null, 2));

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
        console.warn(`[${requestId}] Could not extract sources from grounding:`, e);
      }

      return sources;
    }

    // Add inline citations to text
    function addCitations(text: string, response: any): string {
      try {
        const candidate = response.candidates?.[0];
        const supports = candidate?.groundingMetadata?.groundingSupports;
        const chunks = candidate?.groundingMetadata?.groundingChunks;

        if (!supports || !chunks) {
          return text;
        }

        // Sort supports by end_index in descending order
        const sortedSupports = [...supports].sort(
          (a: any, b: any) => (b.segment?.endIndex ?? 0) - (a.segment?.endIndex ?? 0)
        );

        for (const support of sortedSupports) {
          const endIndex = support.segment?.endIndex;
          if (endIndex === undefined || !support.groundingChunkIndices?.length) {
            continue;
          }

          const citationLinks = support.groundingChunkIndices
            .map((i: number) => {
              const uri = chunks[i]?.web?.uri;
              if (uri) {
                return `[${i + 1}](${uri})`;
              }
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

    console.log(`[${requestId}] Extracted ${extractedSources.length} sources from grounding metadata`);

    if (!generatedText) {
      console.error(`[${requestId}] No text in Gemini response`);
      return NextResponse.json({ error: 'No results from Gemini API' }, { status: 500 });
    }

    console.log(`[${requestId}] Generated text length:`, generatedText.length);
    console.log(`[${requestId}] First 200 chars:`, generatedText.substring(0, 200));

    // Try to extract JSON from the response
    let article = null;
    try {
      // First, try to find JSON code blocks (```json ... ```)
      const codeBlockMatch = generatedText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      let jsonText = null;

      if (codeBlockMatch) {
        jsonText = codeBlockMatch[1];
      } else {
        // Try to find a standalone JSON object
        // Look for the first { and last } to extract the JSON
        const firstBrace = generatedText.indexOf('{');
        const lastBrace = generatedText.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          jsonText = generatedText.substring(firstBrace, lastBrace + 1);
        }
      }

      if (jsonText) {
        console.log(`[${requestId}] Extracted JSON text (first 500 chars):`, jsonText.substring(0, 500));
        article = JSON.parse(jsonText);

        // Validate the structure
        if (!article.perspectives || !article.perspectives.for || !article.perspectives.against || !article.perspectives.neutral) {
          console.error(`[${requestId}] Invalid article structure:`, article);
          throw new Error('Invalid article structure');
        }

        // Transform the new structure to the old format for compatibility
        // Convert { point: "text", sourceId: 1 } to "text [1]"
        const transformPerspectives = (items: any[]) => {
          if (!Array.isArray(items)) return [];
          return items.map(item => {
            if (typeof item === 'string') return item;
            if (item.point && item.sourceId) {
              return `${item.point} [${item.sourceId}]`;
            }
            return String(item);
          });
        };

        article.perspectives.for = transformPerspectives(article.perspectives.for);
        article.perspectives.against = transformPerspectives(article.perspectives.against);
        article.perspectives.neutral = transformPerspectives(article.perspectives.neutral);

        // Add ID if missing
        article.id = article.id || `search-${Date.now()}`;

        // Merge sources from grounding metadata with sources from JSON response
        const jsonSources = article.sources || [];
        article.sources = extractedSources.length > 0 ? extractedSources : jsonSources;

        console.log(`[${requestId}] Successfully parsed article. Sources count:`, article.sources?.length || 0);
        console.log(`[${requestId}] Perspectives: for=${article.perspectives.for.length}, against=${article.perspectives.against.length}, neutral=${article.perspectives.neutral.length}`);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error(`[${requestId}] JSON parsing error:`, parseError);
      console.error(`[${requestId}] Generated text:`, generatedText);

      // Fallback response if JSON parsing fails
      article = {
        id: Date.now().toString(),
        title: `Analysis of "${query}"`,
        summary: 'Unable to parse the AI response. Please try again.',
        perspectives: {
          for: ['Error parsing response. Raw text: ' + generatedText.substring(0, 100) + '...'],
          against: [],
          neutral: []
        },
        sources: []
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