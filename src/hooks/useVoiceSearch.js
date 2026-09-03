import { useState, useEffect, useCallback } from "react";

/**
 * Web Speech API Voice Search Hook.
 * Listens for spoken voice input and extracts city names.
 */
export function useVoiceSearch(onQueryResult) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      setIsSupported(true);
    }
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript("");
    };

    recognition.onresult = (event) => {
      const speechText = event.results[0][0].transcript;
      setTranscript(speechText);

      // Clean up common voice phrases e.g. "what's the weather in Tokyo" -> "Tokyo"
      let city = speechText
        .replace(/what'?s the weather in/i, "")
        .replace(/weather in/i, "")
        .replace(/how is the weather in/i, "")
        .trim();

      if (city) {
        onQueryResult(city);
      }
    };

    recognition.onerror = (event) => {
      setError(`Voice error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      setError("Failed to start voice recognition.");
      setIsListening(false);
    }
  }, [isSupported, onQueryResult]);

  return { isListening, transcript, error, isSupported, startListening };
}
