import { useState, useCallback } from 'react';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      duration
    };

    setNotifications(prev => [...prev, notification]);

    // Play sound/speech for notifications
    if (type === 'success') {
      try {
        // Use Speech Synthesis API for vocal feedback
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance('Succès');
          utterance.lang = 'fr-FR'; // French language
          utterance.volume = 0.8;
          utterance.rate = 1;
          utterance.pitch = 1;

          // Try to use a French voice if available
          const voices = speechSynthesis.getVoices();
          const frenchVoice = voices.find(voice => voice.lang.startsWith('fr'));
          if (frenchVoice) {
            utterance.voice = frenchVoice;
          }

          speechSynthesis.speak(utterance);
          console.log('Success speech played');
        } else {
          // Fallback to simple beep sound
          playBeepSound();
        }
      } catch (error) {
        console.log('Speech synthesis not supported:', error);
        // Fallback to simple beep sound
        playBeepSound();
      }
    } else if (type === 'error') {
      try {
        // Use Speech Synthesis API for error feedback
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance('Échec');
          utterance.lang = 'fr-FR'; // French language
          utterance.volume = 0.8;
          utterance.rate = 1;
          utterance.pitch = 0.8; // Slightly lower pitch for error

          // Try to use a French voice if available
          const voices = speechSynthesis.getVoices();
          const frenchVoice = voices.find(voice => voice.lang.startsWith('fr'));
          if (frenchVoice) {
            utterance.voice = frenchVoice;
          }

          speechSynthesis.speak(utterance);
          console.log('Error speech played');
        } else {
          // Fallback to simple beep sound
          playErrorSound();
        }
      } catch (error) {
        console.log('Speech synthesis not supported:', error);
        // Fallback to simple beep sound
        playErrorSound();
      }
    }

    function playBeepSound() {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') {
          audioContext.resume().then(() => playBeep(audioContext));
        } else {
          playBeep(audioContext);
        }

        function playBeep(audioContext) {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.2);
        }
      } catch (error) {
        console.log('Fallback sound failed:', error);
      }
    }

    function playErrorSound() {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') {
          audioContext.resume().then(() => playError(audioContext));
        } else {
          playError(audioContext);
        }

        function playError(audioContext) {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.5);
        }
      } catch (error) {
        console.log('Fallback error sound failed:', error);
      }
    }

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success: (message, duration) => addNotification(message, 'success', duration),
    error: (message, duration) => addNotification(message, 'error', duration),
    warning: (message, duration) => addNotification(message, 'warning', duration),
    info: (message, duration) => addNotification(message, 'info', duration)
  };
};