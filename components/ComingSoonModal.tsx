'use client';
import { X, Sparkles } from 'lucide-react';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
}

export default function ComingSoonModal({ isOpen, onClose, featureName = 'This Feature' }: ComingSoonModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-linear-to-r from-purple-500 to-pink-500 p-4 sm:p-6 text-white relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16" />
          <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-white/10 rounded-full -ml-8 sm:-ml-12 -mb-8 sm:-mb-12" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/80 hover:text-white transition z-10"
            aria-label="Close"
          >
            <X size={20} className="sm:hidden" />
            <X size={24} className="hidden sm:block" />
          </button>
          <div className="relative flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <Sparkles size={24} className="animate-pulse sm:w-8 sm:h-8" />
            <h2 className="text-xl sm:text-2xl font-bold">Coming Soon!</h2>
          </div>
          <p className="text-white/90 text-xs sm:text-sm relative">
            We're working on something exciting
          </p>
        </div>

        {/* Body - Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          <div className="text-center mb-4 sm:mb-6">
            <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🚀</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 px-2">
              {featureName}
            </h3>
            <p className="text-gray-600 text-xs sm:text-sm px-2">
              This feature is currently under development. We're building something amazing for you!
            </p>
          </div>

          {/* Features Preview */}
          <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">✨ What to expect:</p>
            <ul className="space-y-1 text-xs sm:text-sm text-gray-600">
              <li>• Enhanced functionality</li>
              <li>• Intuitive user experience</li>
              <li>• Seamless integration</li>
              <li>• Real-time updates</li>
            </ul>
          </div>

          {/* CTA */}
          <button
            onClick={onClose}
            className="w-full bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all transform active:scale-95 sm:hover:scale-105"
          >
            Got it, Thanks!
          </button>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 sm:px-6 py-2.5 sm:py-3 text-center border-t border-gray-100 shrink-0">
          <p className="text-[10px] sm:text-xs text-gray-500">
            Stay tuned for updates • Expected launch soon
          </p>
        </div>
      </div>
    </div>
  );
}
