import React from 'react';
import { X, Clock, BookOpen, Share2, ArrowLeft } from 'lucide-react';
import { MarketInsight } from '../types';

interface InsightModalProps {
  insight: MarketInsight | null;
  onClose: () => void;
}

export const InsightModal: React.FC<InsightModalProps> = ({
  insight,
  onClose,
}) => {
  if (!insight) return null;

  return (
    <div
      id="insight-detail-modal"
      className="fixed inset-0 z-50 bg-[#171716]/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#F7F4EE] rounded-3xl border border-[#DED7CA] max-w-3xl w-full p-6 sm:p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="close-insight-modal-btn"
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#FFFFFF] border border-[#DED7CA] flex items-center justify-center text-[#171716] hover:bg-[#EEE8DD] transition-colors"
          aria-label="Close insight"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          <div className="space-y-3 pb-6 border-b border-[#DED7CA]">
            <div className="flex items-center gap-3 text-xs">
              <span className="bg-[#EEE8DD] text-[#65715D] font-semibold uppercase letter-luxury text-[10px] px-3 py-1 rounded-full">
                {insight.category}
              </span>
              <span className="text-[#625F58] flex items-center gap-1 text-[11px] font-sans-ui font-medium">
                <Clock className="w-3.5 h-3.5 text-[#B18A4A]" />
                {insight.readTime}
              </span>
              <span className="text-[#DED7CA]">|</span>
              <span className="text-[#625F58] text-[11px]">{insight.publishDate}</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-[#171716] leading-tight">
              {insight.title}
            </h2>

            <p className="text-base text-[#625F58] font-serif italic pt-1">
              "{insight.summary}"
            </p>
          </div>

          <div className="space-y-4 font-sans-ui text-sm sm:text-base text-[#171716] leading-relaxed">
            {insight.fullContent.map((paragraph, idx) => (
              <p key={idx} className="text-[#625F58]">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="pt-6 border-t border-[#DED7CA] flex items-center justify-between">
            <span className="text-xs text-[#625F58] font-medium">
              Published by LandsandHousing Advisory Research Desk, Uyo
            </span>
            <button
              onClick={onClose}
              className="text-xs font-semibold text-[#171716] hover:text-[#B18A4A] flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Insights</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
