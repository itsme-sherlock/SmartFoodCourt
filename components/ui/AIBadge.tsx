import React from 'react';
import { Sparkles } from 'lucide-react';

interface AIBadgeProps {
  text?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export default function AIBadge({ text = "AI Powered", className = "", size = "md" }: AIBadgeProps) {
  const sizeClasses = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1';
  
  return (
    <span className={`inline-flex items-center gap-1 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-full font-semibold shadow-sm ${sizeClasses} ${className}`}>
      <Sparkles size={size === 'sm' ? 10 : 12} className="animate-pulse" />
      {text}
    </span>
  );
}
