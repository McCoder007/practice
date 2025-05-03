import { NextRequest, NextResponse } from 'next/server';

// Using the official Google Cloud Text-to-Speech client library
// You might need to install it: npm install @google-cloud/text-to-speech
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

// Initialize the client - it will automatically use credentials
// if configured via environment variables or application default credentials.
// For API Key usage specifically:
const client = new TextToSpeechClient({
  key: process.env.GOOGLE_TTS_API_KEY,
});


export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_TTS_API_KEY;

  if (!apiKey || apiKey.startsWith('__GOOGLE_TTS_API_KEY__')) {
    console.warn('Google TTS API Key not configured. Falling back.');
    // Indicate fallback is needed, or handle differently
    return NextResponse.json({ error: 'API Key not configured', fallback: true }, { status: 400 });
  }

  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const request = {
      input: { text: text },
      // Select the language and voice
      // See https://cloud.google.com/text-to-speech/docs/voices
      voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' as const },
      // Select the type of audio encoding
      audioConfig: { audioEncoding: 'MP3' as const },
    };

    // Performs the Text-to-Speech request
    // We need to handle the possibility of the client being null if the key wasn't provided
    // However, the initial check for apiKey should prevent this path if key is missing.
    // Type assertion needed because the library types sometimes conflict depending on usage.
    const [response] = await (client.synthesizeSpeech as any)(request);

    // Get the audio content from the response
    const audioContent = response.audioContent;

    if (!audioContent) {
        return NextResponse.json({ error: 'Failed to synthesize speech' }, { status: 500 });
    }

    // Return the audio content as base64 encoded string
    const audioBase64 = Buffer.from(audioContent).toString('base64');
    return NextResponse.json({ audioBase64 });

  } catch (error) {
    console.error('Error synthesizing speech:', error);
    let errorMessage = 'Internal Server Error';
    let statusCode = 500;

    // Check for specific error types if needed, e.g., authentication errors
    if (error instanceof Error) {
        errorMessage = error.message;
        // Potentially adjust status code based on error type
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
} 