// Minimal Web Speech API hook for voice input
import { useState, useEffect } from 'react';

export function useVoiceInput() {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      setError('Voice not supported');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'hi-IN'; // Hindi
    recognition.interimResults = false;

    recognition.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setTranscript(text);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setError('Voice failed');
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    if (isListening) recognition.start();

    return () => recognition.stop();
  }, [isListening]);

  return { transcript, isListening, error, start: () => setIsListening(true) };
}
