#!/usr/bin/env python3
"""
Article Generation & Audio Caching Script
Generates 10 trending news articles with audio using Gemini and ElevenLabs
"""

import os
import json
import uuid
import requests
from dotenv import load_dotenv
from supabase import create_client, Client
from google import genai
from google.genai import types

# Load environment variables from .env in backend folder
load_dotenv()

# Configuration
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
ELEVENLABS_API_KEY = os.getenv('ELEVENLABS_API_KEY')
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

# Initialize clients
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
gemini_client = genai.Client(api_key=GEMINI_API_KEY)


def extract_sources_from_grounding(response):
    """Extract source URLs from grounding metadata"""
    sources = []

    try:
        # Get grounding metadata from response
        if hasattr(response, 'candidates') and len(response.candidates) > 0:
            candidate = response.candidates[0]
            if hasattr(candidate, 'grounding_metadata'):
                metadata = candidate.grounding_metadata

                # Extract grounding chunks (sources)
                if hasattr(metadata, 'grounding_chunks'):
                    for idx, chunk in enumerate(metadata.grounding_chunks):
                        if hasattr(chunk, 'web') and hasattr(chunk.web, 'uri'):
                            # Extract domain name from URL for display
                            uri = chunk.web.uri
                            title = chunk.web.title if hasattr(chunk.web, 'title') else uri.split('/')[2]

                            sources.append({
                                'id': idx + 1,
                                'name': title,
                                'url': uri,
                                'publishedAt': None  # Gemini doesn't provide publish dates
                            })
    except Exception as e:
        print(f"⚠ Warning: Could not extract sources from grounding metadata: {e}")

    return sources


def add_citations_to_text(text, response):
    """Add inline citations to text based on grounding metadata"""
    try:
        if hasattr(response, 'candidates') and len(response.candidates) > 0:
            candidate = response.candidates[0]
            if hasattr(candidate, 'grounding_metadata'):
                metadata = candidate.grounding_metadata

                supports = metadata.grounding_supports if hasattr(metadata, 'grounding_supports') else []
                chunks = metadata.grounding_chunks if hasattr(metadata, 'grounding_chunks') else []

                # Sort supports by end_index in descending order
                sorted_supports = sorted(
                    supports,
                    key=lambda s: s.segment.end_index if hasattr(s, 'segment') and hasattr(s.segment, 'end_index') else 0,
                    reverse=True
                )

                for support in sorted_supports:
                    if not hasattr(support, 'segment') or not hasattr(support.segment, 'end_index'):
                        continue

                    end_index = support.segment.end_index

                    if hasattr(support, 'grounding_chunk_indices') and support.grounding_chunk_indices:
                        citation_numbers = [f"[{i + 1}]" for i in support.grounding_chunk_indices]
                        citation_string = "".join(citation_numbers)
                        text = text[:end_index] + citation_string + text[end_index:]
    except Exception as e:
        print(f"⚠ Warning: Could not add citations: {e}")

    return text


def generate_articles_with_gemini():
    """Generate 10 trending news articles using Gemini API with Google Search grounding"""

    prompt = """You are a news curator that generates 10 COMPLETELY UNIQUE and diverse trending news articles from the last 24 hours using real Google Search results.

CRITICAL INSTRUCTIONS - NO DUPLICATES:
- MANDATORY: You MUST use Google Search to find real, current news from the last 24 hours
- DO NOT hallucinate or make up sources - ONLY use actual websites you find via Google Search
- ABSOLUTELY NO DUPLICATE TOPICS: Each article must be about a COMPLETELY DIFFERENT news story
- Search for 10 DISTINCT trending topics - NO OVERLAP between articles
- DO NOT write multiple articles about the same topic, policy, or event
- Ensure MAXIMUM DIVERSITY: politics, technology, business, science, environment, health, culture, international affairs, sports, entertainment
- For EACH topic, find 5-7 real sources from DIVERSE outlets (mainstream media, alternative media, international sources)
- ACTIVELY SEEK CONTRADICTING VIEWPOINTS - find sources that genuinely disagree with each other
- Extract supporting points, opposing points, and neutral facts from the sources

OUTPUT FORMAT - Return as JSON array:
[
  {
    "title": "Article headline about the topic",
    "summary": "2-3 sentence summary of the main issue/story",
    "content": "3-4 paragraphs of detailed content synthesized from sources",
    "source": "Primary news outlet name (e.g., 'New York Times')",
    "published_at": "2025-10-05T10:30:00Z",
    "engagement_score": 150,
    "perspective_for": "1-2 sentences with key supporting arguments from sources",
    "perspective_against": "1-2 sentences with key opposing arguments from sources",
    "perspective_neutral": "1-2 sentences with objective facts, statistics, or background from sources"
  }
]

REQUIREMENTS:
1. Generate exactly 10 articles
2. Each article MUST be about a COMPLETELY DIFFERENT trending topic - NO DUPLICATES OR SIMILAR STORIES
3. Use real Google Search results for each topic
4. Ensure MAXIMUM diversity: Cover at least 8 different categories (politics, tech, business, science, health, environment, culture, international, sports, entertainment)
5. Balance perspectives - include both supporting and opposing viewpoints
6. Use current sources from last 24 hours
7. Return ONLY valid JSON - no explanatory text"""

    # Configure Google Search grounding
    grounding_tool = types.Tool(
        google_search=types.GoogleSearch()
    )

    config = types.GenerateContentConfig(
        tools=[grounding_tool]
    )

    # Generate content with Google Search grounding
    response = gemini_client.models.generate_content(
        model='gemini-2.0-flash-exp',
        contents=prompt,
        config=config
    )

    # Extract sources from grounding metadata
    sources = extract_sources_from_grounding(response)
    print(f"✓ Extracted {len(sources)} sources from grounding metadata")

    # Add citations to response text
    text_with_citations = add_citations_to_text(response.text, response)

    # Extract JSON from response
    text = text_with_citations.strip()

    # Debug: Print raw response
    print(f"\n📄 Raw Gemini Response (first 500 chars):\n{text[:500]}\n")

    # Try to extract JSON from markdown code blocks or find JSON array
    json_text = text

    # Method 1: Look for ```json ... ``` blocks
    if '```json' in text:
        start = text.find('```json') + 7
        end = text.find('```', start)
        if end > start:
            json_text = text[start:end].strip()
    # Method 2: Look for ``` ... ``` blocks (without json)
    elif '```' in text:
        start = text.find('```') + 3
        end = text.find('```', start)
        if end > start:
            json_text = text[start:end].strip()
    # Method 3: Look for [ ... ] array
    elif '[' in text and ']' in text:
        start = text.find('[')
        end = text.rfind(']') + 1
        if end > start:
            json_text = text[start:end].strip()

    text = json_text.strip()

    # Sanitize JSON by fixing common escape sequence issues
    # Replace invalid escape sequences that aren't valid JSON escapes
    def sanitize_json(text):
        """Fix invalid escape sequences in JSON text"""
        # Common problematic patterns:
        # \[ -> \\[ (preserve literal brackets in text)
        # \n inside strings should stay as \n (newline)
        # But lone backslashes before other chars need escaping

        import re

        # Replace \[ and \] with \\[ and \\]
        text = text.replace(r'\[', r'\\[')
        text = text.replace(r'\]', r'\\]')

        # Replace other invalid escape sequences
        # Valid JSON escapes are: \", \\, \/, \b, \f, \n, \r, \t, \uXXXX
        # Anything else needs the backslash escaped

        return text

    text = sanitize_json(text)

    # Try to parse JSON
    try:
        articles = json.loads(text)
    except json.JSONDecodeError as e:
        print(f"✗ JSON parsing error: {e}")
        print(f"\n📄 Full response text:\n{text}\n")
        raise

    # Validate and limit to 10 articles
    if not isinstance(articles, list):
        print(f"✗ Response is not a list, got: {type(articles)}")
        print(f"Response: {articles}")
        raise ValueError("Gemini response is not a JSON array")

    articles = articles[:10]

    # Add sources to each article
    for article in articles:
        article['sources'] = sources

    print(f"✓ Generated {len(articles)} articles with {len(sources)} sources from Gemini")
    return articles


def generate_audio_elevenlabs(text: str) -> bytes:
    """Generate audio using ElevenLabs API"""

    voice_id = 's3TPKV1kjDlVtZbl4Ksh'  # Adam voice
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"

    headers = {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
    }

    data = {
        'text': text,
        'model_id': 'eleven_monolingual_v1',
        'voice_settings': {
            'stability': 0.5,
            'similarity_boost': 0.5
        }
    }

    response = requests.post(url, headers=headers, json=data)

    if not response.ok:
        print(f"✗ ElevenLabs API error: {response.text}")
        return None

    return response.content


def upload_audio_to_supabase(audio_bytes: bytes, article_id: str) -> str:
    """Upload audio to Supabase Storage and return public URL"""

    if not audio_bytes:
        return None

    file_name = f"{article_id}.mp3"

    # Upload to Supabase Storage
    try:
        supabase.storage.from_('article-audio').upload(
            file_name,
            audio_bytes,
            {
                'content-type': 'audio/mpeg',
                'upsert': 'true'  # Overwrite if exists
            }
        )

        # Get public URL
        public_url = supabase.storage.from_('article-audio').get_public_url(file_name)
        return public_url

    except Exception as e:
        print(f"✗ Supabase upload error: {e}")
        return None


def delete_old_articles():
    """Delete all existing articles from database"""

    try:
        # Delete all articles from the table
        supabase.table('articles').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()

        print("✓ Deleted old articles")
    except Exception as e:
        print(f"✗ Error deleting articles: {e}")


def insert_articles_to_db(articles: list):
    """Insert articles into Supabase database"""

    try:
        supabase.table('articles').insert(articles).execute()
        print(f"✓ Inserted {len(articles)} articles to database")
    except Exception as e:
        print(f"✗ Error inserting articles: {e}")
        raise


def refresh_articles():
    """Main function to refresh all articles with audio"""

    print("\n🚀 Starting article refresh...")
    print("=" * 50)

    # Step 1: Generate articles with Gemini
    print("\n1️⃣ Generating articles with Gemini...")
    articles = generate_articles_with_gemini()

    # Step 2: Delete old articles
    print("\n2️⃣ Deleting old articles...")
    delete_old_articles()

    # Step 3: Generate audio for each article (sequentially to avoid rate limits)
    print("\n3️⃣ Generating audio for articles...")
    articles_with_audio = []

    for i, article in enumerate(articles, 1):
        print(f"\n   [{i}/{len(articles)}] Processing: {article['title'][:60]}...")

        # Generate temporary ID for this article
        temp_id = f"temp-{uuid.uuid4()}"

        # Generate audio text
        audio_text = f"{article['title']}. {article['content']}"

        # Generate audio
        audio_bytes = generate_audio_elevenlabs(audio_text)

        # Upload to Supabase and get URL
        audio_url = None
        if audio_bytes:
            audio_url = upload_audio_to_supabase(audio_bytes, temp_id)
            print(f"   ✓ Audio generated and uploaded")
        else:
            print(f"   ⚠ Audio generation failed, article will have no audio")

        # Prepare article for database (convert to snake_case)
        db_article = {
            'title': article['title'],
            'summary': article['summary'],
            'content': article['content'],
            'source': article['source'],
            'published_at': article['published_at'],
            'engagement_score': article['engagement_score'],
            'perspective_for': article['perspective_for'],
            'perspective_against': article['perspective_against'],
            'perspective_neutral': article['perspective_neutral'],
            'audio_url': audio_url
        }

        articles_with_audio.append(db_article)

    # Step 4: Insert all articles into database
    print("\n4️⃣ Inserting articles into database...")
    insert_articles_to_db(articles_with_audio)

    print("\n" + "=" * 50)
    print(f"✅ Done! Refreshed {len(articles_with_audio)} articles with audio")
    print(f"   - Articles with audio: {sum(1 for a in articles_with_audio if a['audio_url'])}")
    print(f"   - Articles without audio: {sum(1 for a in articles_with_audio if not a['audio_url'])}")


if __name__ == '__main__':
    refresh_articles()
