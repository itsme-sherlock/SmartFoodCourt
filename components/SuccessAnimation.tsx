'use client';
import { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

interface SuccessAnimationProps {
  show: boolean;
  onComplete?: () => void;
  message?: string;
  duration?: number;
}

export default function SuccessAnimation({ 
  show, 
  onComplete, 
  message = "Success!",
  duration = 2000 
}: SuccessAnimationProps) {
  console.log('🎬 SuccessAnimation render:', { show, message, duration });

  useEffect(() => {
    if (show) {
      console.log('🎬 SuccessAnimation showing for', duration, 'ms');
      const timer = setTimeout(() => {
        console.log('🎬 SuccessAnimation onComplete called');
        onComplete?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete, duration]);

  if (!show) {
    console.log('🎬 SuccessAnimation not showing (show=false)');
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative flex flex-col items-center animate-bounce">
        {/* Ripple effect */}
        <div className="absolute w-40 h-40 bg-green-500/30 rounded-full animate-ping" />
        
        {/* Glow effect */}
        <div className="absolute w-40 h-40 bg-green-400/40 rounded-full blur-xl animate-pulse" />
        
        {/* Main check circle */}
        <div className="relative bg-gradient-to-br from-green-400 to-green-600 rounded-full p-8 shadow-2xl">
          <CheckCircle 
            size={80} 
            className="text-white" 
          />
        </div>

        {/* Message */}
        <div className="mt-8 text-white text-2xl font-bold text-center">
          {message}
        </div>

        {/* Confetti particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 rounded-full animate-ping"
            style={{
              background: ['#10b981', '#34d399', '#6ee7b7', '#fbbf24', '#f59e0b'][i % 5],
              left: '50%',
              top: '50%',
              transform: `rotate(${i * 30}deg) translateY(-100px)`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: '1.5s',
            }}
          />
        ))}
      </div>
    </div>
  );
}
