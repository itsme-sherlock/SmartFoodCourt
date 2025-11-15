"use client";
import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X } from 'lucide-react';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onError?: (error: string) => void;
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const elementId = 'qr-reader';

  const startScanning = async () => {
    try {
      const html5QrCode = new Html5Qrcode(elementId);
      scannerRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      };

      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          onScan(decodedText);
          stopScanning();
        },
        (errorMessage) => {
          // Ignore frequent scanning errors
          if (!errorMessage.includes('NotFoundException')) {
            console.log('QR scan error:', errorMessage);
          }
        }
      );

      setIsScanning(true);
      setHasPermission(true);
    } catch (err: any) {
      console.error('Error starting scanner:', err);
      setHasPermission(false);
      if (onError) {
        onError(err.message || 'Failed to start camera');
      }
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        setIsScanning(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="space-y-4">
      {!isScanning ? (
        <button
          onClick={startScanning}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition"
        >
          <Camera size={20} />
          Start Camera Scanner
        </button>
      ) : (
        <div className="relative">
          <div id={elementId} className="rounded-lg overflow-hidden border-4 border-blue-500" />
          <button
            onClick={stopScanning}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {hasPermission === false && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
          <p className="font-semibold">Camera permission denied</p>
          <p className="mt-1">Please allow camera access to scan QR codes.</p>
        </div>
      )}
    </div>
  );
}