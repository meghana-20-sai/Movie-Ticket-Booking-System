import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

export default function VoiceInputButton({ onSpeechResult, disabled = false }) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      const recogInstance = new SpeechRecognition();
      recogInstance.continuous = false;
      recogInstance.interimResults = false;
      recogInstance.lang = 'en-US';

      recogInstance.onstart = () => {
        setIsListening(true);
      };

      recogInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onSpeechResult?.(transcript);
        }
        setIsListening(false);
      };

      recogInstance.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recogInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recogInstance);
    }
  }, [onSpeechResult]);

  const toggleListening = () => {
    if (!isSupported) {
      alert('Speech recognition is not supported in this browser. Please type your command.');
      return;
    }

    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    } else {
      try {
        recognition?.start();
      } catch (err) {
        console.warn('Speech start error:', err);
      }
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={disabled}
      className={`relative p-2.5 rounded-xl transition-all duration-300 flex items-center justify-center ${
        isListening
          ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/50 animate-pulse ring-2 ring-rose-400'
          : 'bg-cinema-800 hover:bg-cinema-700 text-slate-300 hover:text-white border border-slate-700/80'
      }`}
      title={isListening ? 'Listening... click to stop' : 'Ask with Voice (Speech-to-Text)'}
    >
      {isListening ? (
        <>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
          <Mic className="w-4 h-4 text-white" />
        </>
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </button>
  );
}
