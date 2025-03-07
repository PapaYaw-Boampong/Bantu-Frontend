# Bantu Project API Documentation

## Overview

The Bantu Project API provides access to speech recognition and translation services for African languages. This documentation outlines the available endpoints, request formats, and response structures.

## Base URL

```
https://api.bantuproject.org/v1
```

For local development:

```
http://localhost:3000
```

## Authentication

All API requests require authentication using a Bearer token.

```
Authorization: Bearer YOUR_API_KEY
```

You can obtain an API key by registering on the Bantu Project platform.

## Rate Limits

- **Free tier**: 100 requests per day
- **Standard tier**: 1,000 requests per day
- **Premium tier**: 10,000 requests per day

## Endpoints

### Transcription API

Convert audio to text in various African languages.

**Endpoint**: `/api/transcribe`

**Method**: `POST`

**Request Body**:

```json
{
  "audioUrl": "https://storage.example.com/audio.wav",
  "language": "yor" // Language code (e.g., yor for Yoruba)
}
```

**Response**:

```json
{
  "transcription": "Báwo ni o ṣe wà?",
  "confidence": 0.92
}
```

### Translation API

Translate text between African languages and English.

**Endpoint**: `/api/translate`

**Method**: `POST`

**Request Body**:

```json
{
  "text": "Báwo ni o ṣe wà?",
  "sourceLang": "yor", // Source language code
  "targetLang": "en"   // Target language code
}
```

**Response**:

```json
{
  "translation": "How are you?",
  "confidence": 0.89
}
```

## Supported Languages

| Language | Code | Region |
|----------|------|--------|
| Yoruba | yor | Nigeria |
| Igbo | ibo | Nigeria |
| Hausa | hau | Nigeria |
| Swahili | swa | East Africa |
| Amharic | amh | Ethiopia |
| Zulu | zul | South Africa |
| Xhosa | xho | South Africa |
| Twi | twi | Ghana |
| Wolof | wol | Senegal |
| Oromo | orm | Ethiopia |

## Error Handling

The API uses standard HTTP status codes to indicate success or failure of requests:

- **200 OK**: Request succeeded
- **400 Bad Request**: Invalid request parameters
- **401 Unauthorized**: Missing or invalid API key
- **429 Too Many Requests**: Rate limit exceeded
- **500 Server Error**: Internal server error

Error responses include a message field with details:

```json
{
  "error": "Invalid language code",
  "message": "The language code 'xyz' is not supported"
}
```

## File Upload

For audio file uploads, use the Storage API:

**Endpoint**: `/storage/upload`

**Method**: `POST`

**Request Body**:

```json
{
  "fileName": "recording.wav",
  "fileType": "audio/wav",
  "userId": "user-123"
}
```

**Response**:

```json
{
  "uploadUrl": "https://storage.example.com/recording.wav"
}
```

Use the returned URL to upload the file directly.

## Webhooks

Set up webhooks to receive notifications when processing is complete:

**Endpoint**: `/webhooks/register`

**Method**: `POST`

**Request Body**:

```json
{
  "event": "transcription.complete",
  "url": "https://your-app.com/webhook",
  "secret": "your-webhook-secret"
}
```

## SDK Integration

### JavaScript

```javascript
import { BantuAPI } from '@bantu/api-client';

const client = new BantuAPI('YOUR_API_KEY');

// Transcribe audio
const result = await client.transcribe({
  audioUrl: 'https://example.com/audio.wav',
  language: 'yor'
});

console.log(result.transcription);
```

### Python

```python
from bantu_api import BantuAPI

client = BantuAPI('YOUR_API_KEY')

# Translate text
result = client.translate(
    text="Báwo ni o ṣe wà?",
    source_lang="yor",
    target_lang="en"
)

print(result.translation)
```

## Best Practices

1. **Audio Quality**: For best transcription results, ensure audio is clear with minimal background noise
2. **File Format**: Use WAV or MP3 format for audio files
3. **Caching**: Cache API responses to reduce API calls
4. **Error Handling**: Implement robust error handling for API responses
5. **Rate Limiting**: Respect rate limits and implement exponential backoff for retries