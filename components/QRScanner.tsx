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
  const readerRef = useRef<HTMLDivElement>(null);
  const elementId = 'qr-reader';

  const startScanning = async () => {
    try {
      console.log('startScanning invoked');
      // Flip the UI state first to render the DOM element
      setIsScanning(true);

      // Wait for the reader element to be mounted into DOM
      const timeout = 2000; // 2 seconds max wait
      const interval = 30; // poll every 30ms
      let waited = 0;
      while (!readerRef.current && waited < timeout) {
        await new Promise((resolve) => setTimeout(resolve, interval));
        waited += interval;
      }
      console.log('readerRef after wait:', readerRef.current);

      if (!readerRef.current) {
        // Something went wrong with rendering, revert scanning UI and raise an error
        setIsScanning(false);
        throw new Error('QR reader element not found in DOM');
      }

      // Stop any existing scanner first
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch (e) {
          // ignore
        }
        try {
          scannerRef.current.clear();
        } catch {}
        scannerRef.current = null;
      }

      // Initialize scanner now that element exists
      console.log('Creating Html5Qrcode instance (elementId)', elementId);
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

      setHasPermission(true);
      console.log('Html5Qrcode started');
    } catch (err: any) {
      console.error('Error starting scanner:', err);
      setHasPermission(false);
      // Reset scanner UI so user can re-open attempt
      setIsScanning(false);
      const msg = err?.message || String(err);
      if (/permission|not allowed|denied/i.test(msg)) {
        const friendly = 'Camera permission denied. Please allow camera access in your browser.';
        if (onError) onError(friendly);
      } else if (onError) {
        onError(msg);
      }
    }
  };

  const stopScanning = async () => {
    // Always set scanning UI to false immediately
    setIsScanning(false);

    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        // ignore stop errors
      }
      try {
        scannerRef.current.clear();
      } catch (err) {
        // ignore
      }
      scannerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  useEffect(() => {
    // Debug: report when readerRef is present (helps diagnose DOM mount issues)
    if (readerRef.current) {
      console.log('QR reader element present in DOM', readerRef.current);
    } else {
      console.log('QR reader element NOT present in DOM yet');
    }
  }, [readerRef.current]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <div
          ref={readerRef}
          id={elementId}
          className={`rounded-lg overflow-hidden border-4 border-blue-500 bg-black transition ${isScanning ? 'min-h-[400px]' : 'h-0 opacity-0 pointer-events-none'}`}
          style={isScanning ? { minHeight: '400px' } : undefined}
        />

        {!isScanning ? (
          <button
            onClick={startScanning}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Camera size={20} />
            Start Camera Scanner
          </button>
        ) : (
          <button
            onClick={stopScanning}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg z-10"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {hasPermission === false && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
          <p className="font-semibold">Camera permission denied</p>
          <p className="mt-1">Please allow camera access in your browser settings to scan QR codes. Go to site settings and enable camera access.</p>
        </div>
      )}
    </div>
  );
}