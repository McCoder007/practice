# Google Text-to-Speech API Implementation Reference

This document provides a complete reference for how the Google Text-to-Speech API is currently implemented in this project, including API details, voice options, configuration, and security recommendations for future implementations.

## API Endpoint

```
POST https://texttospeech.googleapis.com/v1/text:synthesize?key={API_KEY}
```

## Request Format

### Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "input": {
    "text": "Your text here"
  },
  "voice": {
    "languageCode": "en-US",
    "name": "en-US-Neural2-D"
  },
  "audioConfig": {
    "audioEncoding": "MP3",
    "speakingRate": 0.9
  }
}
```

## Voice Configuration

### Current Voice Used
- **Voice Name:** `en-US-Neural2-D`
- **Language Code:** `en-US`
- **Type:** Neural2 (male voice)
- **Description:** High-quality neural voice optimized for US English

### Voice Selection
- The voice name is set via `setVoice(voice)` method
- Default voice: `en-US-Neural2-D`
- The voice name is passed in the `voice.name` field of the request

### Available Voice Options

Google TTS supports many voices. Common patterns:

**Neural2 Voices (High Quality):**
- `en-US-Neural2-A` (female neural voice)
- `en-US-Neural2-B` (female neural voice)
- `en-US-Neural2-C` (male neural voice)
- `en-US-Neural2-D` (male neural voice) ← **Currently using this**
- `en-US-Neural2-E` (female neural voice)
- `en-US-Neural2-F` (female neural voice)
- `en-US-Neural2-G` (female neural voice)
- `en-US-Neural2-H` (female neural voice)
- `en-US-Neural2-I` (male neural voice)
- `en-US-Neural2-J` (male neural voice)

**Standard Voices (Lower Cost, Lower Quality):**
- `en-US-Standard-A` through `en-US-Standard-J`

**Note:** You can query available voices using the Google Cloud TTS API's `voices.list` endpoint to get the full list of available voices for your project.

## Audio Configuration

### Current Settings
```javascript
audioConfig: {
  audioEncoding: 'MP3',      // Audio format
  speakingRate: 0.9          // Slightly slower for ESL learners
}
```

### Available Audio Configuration Options

- **`speakingRate`**: 0.25 to 4.0 (default: 1.0)
  - Controls the speed of speech
  - Current setting: 0.9 (slightly slower for ESL learners)

- **`pitch`**: -20.0 to 20.0 semitones (default: 0.0)
  - Controls the pitch of the voice
  - Not currently used in this implementation

- **`volumeGainDb`**: -96.0 to 16.0 dB (default: 0.0)
  - Controls the volume gain
  - Not currently used in this implementation

- **`audioEncoding`**: `MP3`, `LINEAR16`, `OGG_OPUS`, `MULAW`, `ALAW`
  - Current setting: `MP3`
  - MP3 is recommended for web applications

- **`sampleRateHertz`**: 16000, 22050, 24000, 44100, 48000
  - Sample rate for audio output
  - Not explicitly set (uses default)

## Response Format

### Success Response
```json
{
  "audioContent": "base64-encoded-audio-data"
}
```

### Usage
- The `audioContent` is base64-encoded MP3 audio
- Decode and play using: `data:audio/mp3;base64,{audioContent}`
- Can be used directly with HTML5 `<Audio>` element

### Example Playback
```javascript
const audioSrc = `data:audio/mp3;base64,${audioContent}`;
const audio = new Audio(audioSrc);
audio.play();
```

## Current Implementation Details

### Features
1. **Audio Caching**: Responses are cached by text to reduce API calls
2. **Fallback Mechanism**: Falls back to browser TTS if API fails
3. **Pre-initialization**: Makes a dummy request to warm up the service
4. **Error Handling**: Retries with modified text on failure
5. **Mobile Detection**: Detects iOS/Android devices

### Key Methods

**`setApiKey(key)`**
- Sets the API key for Google TTS
- Validates key format (should start with "AIza")
- Triggers pre-initialization after setting

**`setVoice(voice)`**
- Sets the voice name (e.g., "en-US-Neural2-D")
- Voice name must match Google's available voices

**`speak(text)`**
- Synthesizes and plays speech
- Returns a Promise
- Falls back to browser TTS on error

**`synthesizeSpeech(text)`**
- Returns audio without playing
- Used for pre-initialization
- Returns base64 audio content

### Implementation Flow

1. API key is set via `setApiKey()`
2. Optional pre-initialization with dummy request
3. Text is sent to Google TTS API
4. Response contains base64 audio
5. Audio is cached for future use
6. Audio is played via HTML5 Audio element
7. Falls back to browser TTS if API fails

## Security Recommendations for New Project

### Current Security Issues (to avoid)

1. **API key exposed in client-side code**
   - Visible in browser DevTools
   - Can be extracted from source code
   - Visible in network requests

2. **API key sent in URL query parameter**
   - Appears in browser history
   - Logged in server access logs
   - Visible in network tab

3. **No usage restrictions**
   - Anyone can extract and use the key
   - No way to prevent abuse
   - Could lead to unexpected costs

### Recommended Secure Implementation

#### Option 1: Backend Proxy Approach (Most Secure)

**Architecture:**
```
Client → Your Backend API → Google TTS API → Your Backend → Client
```

**Benefits:**
- API key never exposed to client
- Full control over usage
- Can implement rate limiting
- Can add authentication
- Can cache responses server-side

**Example Implementation:**

**Backend (Node.js/Express):**
```javascript
const express = require('express');
const app = express();
app.use(express.json());

app.post('/api/tts', async (req, res) => {
  const { text, voice = 'en-US-Neural2-D' } = req.body;
  const apiKey = process.env.GOOGLE_TTS_API_KEY; // Server-side only
  
  try {
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: { languageCode: 'en-US', name: voice },
          audioConfig: { 
            audioEncoding: 'MP3', 
            speakingRate: 0.9 
          }
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`Google TTS API error: ${response.status}`);
    }
    
    const data = await response.json();
    res.json({ audioContent: data.audioContent });
  } catch (error) {
    console.error('TTS Error:', error);
    res.status(500).json({ error: 'Failed to synthesize speech' });
  }
});

app.listen(3000);
```

**Client-side:**
```javascript
async function speakText(text) {
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    
    const { audioContent } = await response.json();
    const audioSrc = `data:audio/mp3;base64,${audioContent}`;
    const audio = new Audio(audioSrc);
    await audio.play();
  } catch (error) {
    console.error('TTS failed:', error);
    // Fallback to browser TTS
  }
}
```

#### Option 2: API Key Restrictions (if must use client-side)

If you must use the API key client-side, implement these restrictions in Google Cloud Console:

1. **HTTP Referrer Restrictions**
   - Go to Google Cloud Console → APIs & Services → Credentials
   - Edit your API key
   - Under "Application restrictions", select "HTTP referrers"
   - Add your domain(s): `https://yourdomain.com/*`
   - Add localhost for development: `http://localhost:*`

2. **API Restrictions**
   - Under "API restrictions", select "Restrict key"
   - Select only "Cloud Text-to-Speech API"
   - This prevents the key from being used for other Google APIs

3. **Usage Quotas**
   - Set up quotas in Google Cloud Console
   - Limit requests per day/hour
   - Set up billing alerts
   - Monitor usage regularly

4. **Key Rotation**
   - Rotate API keys regularly
   - Have a process to update keys if compromised

#### Option 3: Environment Variables & Secrets Management

**Never commit API keys to version control:**

```bash
# .env file (add to .gitignore)
GOOGLE_TTS_API_KEY=your_api_key_here
```

**Use secrets management services:**
- AWS Secrets Manager
- Google Secret Manager
- Azure Key Vault
- HashiCorp Vault

**Example with Google Secret Manager:**
```javascript
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();

async function getApiKey() {
  const [version] = await client.accessSecretVersion({
    name: 'projects/YOUR_PROJECT/secrets/GOOGLE_TTS_API_KEY/versions/latest',
  });
  return version.payload.data.toString();
}
```

## Best Practices Summary

1. ✅ **Use backend proxy** - Keep API key on server
2. ✅ **Implement rate limiting** - Prevent abuse
3. ✅ **Add authentication** - Control who can use the service
4. ✅ **Cache responses** - Reduce API calls and costs
5. ✅ **Monitor usage** - Set up alerts for unusual activity
6. ✅ **Use environment variables** - Never hardcode keys
7. ✅ **Implement fallback** - Browser TTS as backup
8. ✅ **Handle errors gracefully** - Don't expose sensitive info
9. ✅ **Set up quotas** - Limit usage and costs
10. ✅ **Rotate keys regularly** - Security best practice

## Additional Resources

- [Google Cloud Text-to-Speech API Documentation](https://cloud.google.com/text-to-speech/docs)
- [Available Voices List](https://cloud.google.com/text-to-speech/docs/voices)
- [API Reference](https://cloud.google.com/text-to-speech/docs/reference/rest)
- [Pricing Information](https://cloud.google.com/text-to-speech/pricing)
- [Security Best Practices](https://cloud.google.com/docs/security)

## Current Project Files Reference

- **Implementation:** `vocabulary-next/public/google-tts.js`
- **TypeScript Wrapper:** `vocabulary-next/lib/tts.ts`
- **Configuration:** `vocabulary-next/next.config.ts`
- **Layout (API Key Setup):** `vocabulary-next/app/layout.tsx`
