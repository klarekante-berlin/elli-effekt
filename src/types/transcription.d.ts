interface WhisperSegment {
  id: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
}

interface WhisperTranscription {
  text: string;
  segments: WhisperSegment[];
  language: string;
}

declare module '*/transcription.json' {
  const content: WhisperTranscription;
  export default content;
}

interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
  type: string;
}

interface Transcript {
  segments: TranscriptSegment[];
}

declare module '*/transcript_gsap.json' {
  const content: Transcript;
  export default content;
} 