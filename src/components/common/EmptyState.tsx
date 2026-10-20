import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-slate-50/70 border border-dashed border-slate-200 rounded-xl ${className}`}
    >
      <div className="p-3 bg-white text-slate-400 rounded-full shadow-2xs border border-slate-100 mb-3">
        {icon || <Inbox className="w-8 h-8 stroke-[1.5]" />}
      </div>
      <h4 className="text-sm font-semibold text-slate-800 mb-1">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm leading-relaxed mb-4">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
