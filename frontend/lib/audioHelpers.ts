import { supabase } from './supabase';

export async function generateAndUploadAudio(
  articleId: string,
  text: string
): Promise<string | null> {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      console.error('ElevenLabs API key not configured');
      return null;
    }

    // Generate audio using ElevenLabs
    const voiceId = 's3TPKV1kjDlVtZbl4Ksh';
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('ElevenLabs API error:', await response.text());
      return null;
    }

    const audioBuffer = await response.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });

    // Upload to Supabase Storage
    const fileName = `${articleId}.mp3`;
    const { data, error } = await supabase.storage
      .from('article-audio')
      .upload(fileName, audioBlob, {
        contentType: 'audio/mpeg',
        upsert: true, // Overwrite if exists
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('article-audio')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error generating/uploading audio:', error);
    return null;
  }
}
