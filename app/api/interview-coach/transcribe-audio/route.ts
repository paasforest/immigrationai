import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-mock',
});

export async function POST(request: NextRequest) {
  try {
    const { audio, mimeType } = await request.json();

    if (!audio) {
      return NextResponse.json(
        { error: 'No audio data provided' },
        { status: 400 }
      );
    }

    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audio, 'base64');

    // Create a temporary file-like object for Whisper
    const audioFile = new File([audioBuffer], 'audio.webm', { type: mimeType || 'audio/webm' });

    // Transcribe using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en', // Assuming English for now
      response_format: 'verbose_json',
    });

    // Calculate duration (rough estimate based on file size)
    const duration = audioBuffer.length / 16000; // Rough estimate for 16kHz audio

    return NextResponse.json({
      transcription: transcription.text,
      duration: Math.round(duration),
      confidence: 0.9, // Whisper doesn't provide confidence, so we'll use a high default
      language: transcription.language || 'en',
    });

  } catch (error) {
    console.error('Error transcribing audio:', error);
    
    // Fallback: return a mock transcription for development
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        transcription: 'This is a mock transcription for development purposes. The actual audio would be transcribed here.',
        duration: 30,
        confidence: 0.5,
        language: 'en',
        warning: 'Mock transcription - OpenAI API not configured',
      });
    }

    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}


