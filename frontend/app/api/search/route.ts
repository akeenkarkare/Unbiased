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

    const prompt = `You are a real-time perspective analysis and structured data extraction assistant. Your sole task is to analyze "${query}" and strictly adhere to the defined output structure and constraints.

TOPIC TO ANALYZE: ${query}

CRITICAL INSTRUCTIONS:
- NEVER use the phrase "input term" in your response
- USE EXTENDED THINKING: Before responding, engage in deep analysis to explore multiple angles
- MANDATORY: Search and analyze AT LEAST 5-7 DIFFERENT sources from DIVERSE outlets (mainstream media, alternative media, international sources, academic sources, industry publications)
- ACTIVELY SEEK CONTRADICTING VIEWPOINTS: Do not settle for surface-level agreement. Find sources that genuinely disagree with each other
- Cross-reference claims across multiple websites to ensure accuracy and identify bias
- CITE ALL SOURCES: EVERY single point MUST end with an inline citation like [1], [2], [3], etc.
- CITATION FORMAT: Each bullet point must end with the citation number in square brackets, e.g., "This is a claim [1]"
- Track all sources you use and include them in a "sources" array

WORKFLOW:
1. Visit each source and extract up to 3 distinct points per source
2. Categorize each point as "for", "against", or "neutral"
3. If a source has no points for a category (e.g., "against"), leave that category empty for that source
4. After collecting all points from all sources, perform deduplication: remove any points that are repetitive or say essentially the same thing
5. Keep only unique, non-redundant points in the final output

ACTION & FOCUS:
Find a minimum of 5-7 high-quality, DIVERSE, and recent sources from DIFFERENT outlets about "${query}". You MUST consult sources with varying political leanings, geographical locations, and perspectives. For EACH source visited, extract up to 3 points and categorize them into "for", "against", or "neutral" perspectives. CITE EVERY CLAIM with the source number [1], [2], etc.

OUTPUT FORMAT - Return as JSON:
{
  "title": "Current debate or main topic about ${query}",
  "summary": "Core definition/description (maximum 100 words): A concise, factual explanation of ${query} or the most current news/debate",
  "perspectives": {
    "for": [
      "Supporters argue that this policy will increase economic growth [1]",
      "Proponents claim it reduces bureaucratic overhead and saves taxpayer money [2]",
      "Advocates highlight improved efficiency in government services [3]"
    ],
    "against": [
      "Critics warn that this approach could lead to job losses in the public sector [4]",
      "Opponents argue it may reduce essential services for vulnerable populations [5]"
    ],
    "neutral": [
      "The policy was first proposed in March 2024 and is currently under review [6]",
      "Similar measures have been implemented in 12 other states with mixed results [7]"
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

IMPORTANT: Notice in the example above how EVERY single bullet point ends with a citation number in square brackets [1], [2], etc. You MUST follow this exact format.

STRICT CONSTRAINTS:
- CRITICAL: Return ONLY the JSON object, absolutely NO other text before or after it
- Do NOT include markdown code blocks, do NOT wrap in backticks
- Start your response with { and end with }
- NEVER use the phrase "input term" anywhere in your response
- Each perspective ("for", "against", "neutral") MUST be an array of strings (bullet points)
- Each source can contribute up to 3 points total across all categories
- If a source has no points for a category, simply don't add points from that source to that category
- MANDATORY: After collecting all points, deduplicate and remove repetitive points that convey the same information
- ABSOLUTELY CRITICAL: Each and every point in the "for", "against", and "neutral" arrays MUST end with a citation number in square brackets like [1], [2], [3]
- MANDATORY: Include a complete "sources" array with all sources referenced by citation number
- Focus on current debates and recent developments
- Include only verified, credible source information
- Prioritize intellectual diversity and opposing viewpoints over consensus

IMPORTANT: Your entire response must be valid JSON that can be parsed directly. Do not include any explanatory text, thinking process, or formatting markers. Remember: EVERY bullet point must have a citation at the end!`;

    const ai = new GoogleGenAI({ apiKey });
    const groundingTool = {
      googleSearch: {},
    };

    const config = {
      tools: [groundingTool],
      temperature: 0.3  // Lower temperature for more consistent output
    };

    console.log(`[${requestId}] Calling Gemini API...`);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: config,
    });

    console.log(`[${requestId}] Gemini API responded in ${Date.now() - startTime}ms`);

    const generatedText = response.text;

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

        // Ensure perspectives are arrays
        if (typeof article.perspectives.for === 'string') {
          article.perspectives.for = [article.perspectives.for];
        }
        if (typeof article.perspectives.against === 'string') {
          article.perspectives.against = [article.perspectives.against];
        }
        if (typeof article.perspectives.neutral === 'string') {
          article.perspectives.neutral = [article.perspectives.neutral];
        }

        // Add ID if missing
        article.id = article.id || `search-${Date.now()}`;

        // Ensure sources array exists
        article.sources = article.sources || [];

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