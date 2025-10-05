import React, { useState, useRef, useEffect } from 'react';
import { QrCode, Camera, Play, Square, Volume2, VolumeX } from 'lucide-react';
import { useCompany } from '../../utils/CompanyContext';
import { useCompanyTheme } from '../../hooks/useCompanyTheme';
import { useNotifications } from '../../hooks/useNotifications';
import jsQR from 'jsqr';

const AttendanceScan = () => {
  const { company } = useCompany();
  const theme = useCompanyTheme();
  const { addNotification } = useNotifications();

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastScanTime, setLastScanTime] = useState(null);
  const [manualMatricule, setManualMatricule] = useState('');
  const [isProcessingManual, setIsProcessingManual] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Sons de succès et d'erreur
  const successSound = useRef(new Audio('/sounds/success.mp3'));
  const errorSound = useRef(new Audio('/sounds/error.mp3'));

  useEffect(() => {
    // Créer les sons si les fichiers n'existent pas
    if (!successSound.current.src.includes('success.mp3')) {
      createSuccessSound();
    }
    if (!errorSound.current.src.includes('error.mp3')) {
      createErrorSound();
    }

    return () => {
      stopScanning();
    };
  }, []);

  const createSuccessSound = () => {
    // Créer un son de succès simple (bip ascendant)
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);

    // Stocker pour pouvoir le rejouer
    successSound.current = {
      play: () => {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.2);
      }
    };
  };

  const createErrorSound = () => {
    // Créer un son d'erreur simple (bip descendant)
    errorSound.current = {
      play: () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      }
    };
  };

  const playSound = (type) => {
    if (!soundEnabled) return;

    try {
      if (type === 'success') {
        successSound.current.play();
      } else if (type === 'error') {
        errorSound.current.play();
      }
    } catch (error) {
      console.error('Erreur lors de la lecture du son:', error);
    }
  };

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setIsScanning(true);

      // Démarrer le scan continu
      scanIntervalRef.current = setInterval(scanQRCode, 500);

    } catch (error) {
      console.error('Erreur d\'accès à la caméra:', error);
      addNotification('Erreur d\'accès à la caméra', 'error');
    }
  };

  const stopScanning = () => {
    setIsScanning(false);

    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    if (canvas.width === 0 || canvas.height === 0) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Obtenir les données de l'image
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Scanner le QR code
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (code) {
      console.log('QR Code détecté:', code.data);
      processQRCode(code.data);
    }
  };

  const processQRCode = async (qrData) => {
    // Éviter les scans trop rapprochés
    const now = Date.now();
    if (lastScanTime && now - lastScanTime < 2000) {
      return;
    }
    setLastScanTime(now);

    try {
      const response = await fetch('/api/attendance/scan-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          qrData,
          type: 'CHECK_IN'
        })
      });

      const data = await response.json();

      if (data.success) {
        setScanResult({
          success: true,
          message: data.data.message,
          employee: data.data.employee
        });
        playSound('success');
        addNotification(data.data.message, 'success');
      } else {
        setScanResult({
          success: false,
          message: data.message
        });
        playSound('error');
        addNotification(data.message, 'error');
      }
    } catch (error) {
      console.error('Erreur lors du scan:', error);
      let errorMessage = 'Erreur de connexion';

      // Try to get a more specific error message
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setScanResult({
        success: false,
        message: errorMessage
      });
      playSound('error');
      addNotification(errorMessage, 'error');
    }
  };

  const processManualMatricule = async () => {
    if (!manualMatricule.trim()) {
      addNotification('Veuillez saisir un matricule', 'error');
      return;
    }

    setIsProcessingManual(true);

    // Éviter les pointages trop rapprochés
    const now = Date.now();
    if (lastScanTime && now - lastScanTime < 2000) {
      setIsProcessingManual(false);
      return;
    }
    setLastScanTime(now);

    try {
      const response = await fetch('/api/attendance/scan-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          qrData: manualMatricule.trim(),
          type: 'CHECK_IN'
        })
      });

      const data = await response.json();

      if (data.success) {
        setScanResult({
          success: true,
          message: data.data.message,
          employee: data.data.employee
        });
        playSound('success');
        addNotification(data.data.message, 'success');
        setManualMatricule(''); // Vider le champ après succès
      } else {
        setScanResult({
          success: false,
          message: data.message
        });
        playSound('error');
        addNotification(data.message, 'error');
      }
    } catch (error) {
      console.error('Erreur lors du pointage manuel:', error);
      let errorMessage = 'Erreur de connexion';

      // Try to get a more specific error message
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setScanResult({
        success: false,
        message: errorMessage
      });
      playSound('error');
      addNotification(errorMessage, 'error');
    } finally {
      setIsProcessingManual(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    processManualMatricule();
  };


  return (
    <div className="min-h-screen">
      <div className="w-full max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white border-opacity-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 rounded-xl mr-4" style={{ background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` }}>
                <QrCode className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Scan de Présence</h1>
                <p className="text-gray-600 text-lg">Scanner automatique des badges QR avec sons</p>
              </div>
            </div>

            {/* Contrôle du son */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-3 rounded-lg transition-colors duration-200 ${
                soundEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}
              title={soundEnabled ? 'Désactiver le son' : 'Activer le son'}
            >
              {soundEnabled ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Zone de scan */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white border-opacity-20 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Caméra */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Caméra</h2>

              <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ height: '400px' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ display: isScanning ? 'block' : 'none' }}
                />

                {!isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Caméra inactive</p>
                    </div>
                  </div>
                )}

                {/* Overlay de scan */}
                {isScanning && (
                  <div className="absolute inset-0 border-2 border-green-400 rounded-lg">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-48 h-48 border-2 border-green-400 rounded-lg relative">
                        <div className="absolute -top-1 -left-1 w-6 h-6 border-l-4 border-t-4 border-green-400"></div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 border-r-4 border-t-4 border-green-400"></div>
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-l-4 border-b-4 border-green-400"></div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-r-4 border-b-4 border-green-400"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <canvas ref={canvasRef} className="hidden" />

              {/* Contrôles */}
              <div className="flex space-x-4">
                {!isScanning ? (
                  <button
                    onClick={startScanning}
                    className="flex items-center space-x-2 px-6 py-3 rounded-lg text-white font-medium transition-all duration-300"
                    style={{ background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` }}
                  >
                    <Play className="h-5 w-5" />
                    <span>Démarrer le scan</span>
                  </button>
                ) : (
                  <button
                    onClick={stopScanning}
                    className="flex items-center space-x-2 px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-all duration-300"
                  >
                    <Square className="h-5 w-5" />
                    <span>Arrêter le scan</span>
                  </button>
                )}
              </div>
            </div>

            {/* Résultat du scan */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Résultat du scan</h2>

              {/* Résultat */}
              {scanResult && (
                <div className={`p-4 rounded-lg ${
                  scanResult.success
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      scanResult.success ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {scanResult.success ? (
                        <QrCode className="h-4 w-4 text-green-600" />
                      ) : (
                        <QrCode className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className={`font-medium ${
                        scanResult.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {scanResult.message}
                      </p>
                      {scanResult.employee && (
                        <p className="text-sm text-gray-600">
                          Employé: {scanResult.employee.name} ({scanResult.employee.matricule})
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Saisie manuelle du matricule */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Pointage Manuel</h3>
                <form onSubmit={handleManualSubmit} className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Matricule de l'employé
                    </label>
                    <input
                      type="text"
                      value={manualMatricule}
                      onChange={(e) => setManualMatricule(e.target.value)}
                      placeholder="Ex: EMP-001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase transition-none"
                      disabled={isProcessingManual}
                      style={{ fontFamily: 'monospace' }}
                      autoComplete="off"
                      spellCheck="false"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isProcessingManual || !manualMatricule.trim()}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
                  >
                    {isProcessingManual ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Pointage en cours...
                      </>
                    ) : (
                      'Pointer l\'employé'
                    )}
                  </button>
                </form>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Instructions</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Activez la caméra pour le scan automatique des QR codes</li>
                  <li>• Ou saisissez manuellement le matricule de l'employé</li>
                  <li>• Placez le QR code du badge devant la caméra</li>
                  <li>• Un son de succès indique un pointage réussi</li>
                  <li>• Un son d'erreur indique un problème</li>
                  <li>• Chaque employé ne peut se pointer qu'une fois par jour</li>
                  <li>• Le son peut être activé/désactivé en haut à droite</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceScan;