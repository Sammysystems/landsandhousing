import React from 'react';
import { ArrowUpRight, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { INSIGHTS_DATA } from '../data/mockData';
import { MarketInsight } from '../types';

interface MarketInsightsProps {
  onSelectInsight: (insight: MarketInsight) => void;
}

export const MarketInsights: React.FC<MarketInsightsProps> = ({
  onSelectInsight,
}) => {
  return (
    <section
      id="insights"
      className="py-20 md:py-28 px-5 sm:px-7 md:px-10 bg-[#F7F4EE] border-t border-[#DED7CA]"
    >
      <div className="max-w-[1280px] mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl mb-12"
        >
          <span className="text-[11px] font-semibold text-[#A98946] uppercase tracking-[0.14em] font-sans block mb-2">
            EDITORIAL BRIEFS & PERSPECTIVES
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#121212] leading-tight">
            Property Decisions, With Better Context.
          </h2>
          <p className="text-[#625F58] text-base md:text-lg mt-3 font-sans">
            Practical briefings on documentation, commercial positioning, and asset protection across Akwa Ibom real estate.
          </p>
        </motion.div>

        {/* Insights 3-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {INSIGHTS_DATA.map((item, idx) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              whileHover={{ y: -6 }}
              id={`insight-card-${item.id}`}
              onClick={() => onSelectInsight(item)}
              className="group cursor-pointer bg-[#FFFFFF] rounded-2xl border border-[#DED7CA] p-5 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:border-[#A98946] hover:shadow-[0_16px_36px_rgba(0,0,0,0.06)] shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
            >
              <div className="space-y-3.5 sm:space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="bg-[#EEE8DD] text-[#65715D] font-semibold uppercase tracking-[0.1em] text-[10px] px-3 py-1 rounded-full">
                    {item.category}
                  </span>
                  <span className="text-[#625F58] flex items-center gap-1 text-[11px] font-medium font-sans">
                    <Clock className="w-3.5 h-3.5 text-[#A98946]" />
                    {item.readTime}
                  </span>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#121212] group-hover:text-[#A98946] transition-colors leading-snug">
                  {item.title}
                </h3>

                <p className="text-sm text-[#625F58] leading-relaxed font-sans">
                  {item.summary}
                </p>
              </div>

              <div className="pt-5 sm:pt-6 mt-5 sm:mt-6 border-t border-[#DED7CA]/60 flex items-center justify-between">
                <span className="text-xs font-medium text-[#625F58]">
                  {item.publishDate}
                </span>

                <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.1em] text-[#121212] group-hover:text-[#A98946] transition-colors">
                  <span>Read Insight</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

