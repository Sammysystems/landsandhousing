import React from 'react';
import { ArrowRight, MapPin, Check, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { Property } from '../types';

interface EditorialFeatureProps {
  onSelectProperty: (property: Property) => void;
  featuredProperty: Property;
}

export const EditorialFeature: React.FC<EditorialFeatureProps> = ({
  onSelectProperty,
  featuredProperty,
}) => {
  return (
    <section
      id="editorial-story"
      className="py-20 md:py-28 px-5 sm:px-7 md:px-10 bg-[#F7F4EE] border-t border-[#DED7CA]"
    >
      <div className="max-w-[1280px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.8 }}
          className="bg-[#FFFFFF] rounded-2xl border border-[#DED7CA] overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.04)]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Dramatic Editorial Image (Col 1-7) */}
            <div className="lg:col-span-7 relative min-h-[320px] sm:min-h-[420px] lg:min-h-[560px] bg-[#EEE8DD] overflow-hidden group border-b lg:border-b-0 lg:border-r border-[#DED7CA]">
              <img
                src={featuredProperty.imageUrl}
                alt={featuredProperty.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/70 via-transparent to-transparent" />
              
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                <span className="bg-[#121212] text-[#F7F4EE] text-[10px] font-semibold uppercase tracking-[0.12em] px-3.5 sm:px-4 py-1.5 rounded-full border border-[#A98946]/40 shadow-xs">
                  FEATURED EDITORIAL ADVISORY
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 text-[#F7F4EE]">
                <div className="flex items-center gap-1.5 text-xs text-[#DED7CA] mb-1">
                  <MapPin className="w-3.5 h-3.5 text-[#A98946]" />
                  <span>{featuredProperty.location}</span>
                </div>
                <div className="font-serif text-2xl sm:text-3xl font-semibold text-[#FFFFFF]">
                  {featuredProperty.title}
                </div>
              </div>
            </div>

            {/* Narrative & Details Area (Col 8-12) */}
            <div className="lg:col-span-5 p-5 sm:p-8 lg:p-12 flex flex-col justify-between space-y-6 sm:space-y-8">
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-[#DED7CA] pb-4">
                  <span className="text-[11px] uppercase tracking-[0.12em] text-[#625F58] font-semibold">
                    Category: {featuredProperty.type}
                  </span>
                  <span className="text-[11px] font-semibold text-[#A98946] uppercase tracking-[0.12em]">
                    {featuredProperty.status}
                  </span>
                </div>

                <h3 className="font-serif text-3xl sm:text-4xl font-semibold text-[#121212] leading-tight">
                  A Different Kind of Property Experience.
                </h3>

                <p className="text-sm sm:text-base text-[#625F58] leading-relaxed font-sans">
                  {featuredProperty.description}
                </p>

                {/* Key Architectural / Investment Features */}
                <div className="space-y-2.5 pt-2">
                  <span className="text-[11px] uppercase tracking-[0.12em] text-[#121212] font-semibold block">
                    Distinguishing Highlights:
                  </span>
                  <ul className="space-y-2">
                    {featuredProperty.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-[#625F58]">
                        <Check className="w-4 h-4 text-[#65715D] shrink-0 mt-0.5" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Pricing & CTA */}
              <div className="pt-6 border-t border-[#DED7CA] space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] uppercase tracking-[0.12em] text-[#625F58]">
                    Indicative Valuation
                  </span>
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-[#A98946]">
                    {featuredProperty.priceFormatted}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.button
                    id="editorial-view-property-btn"
                    onClick={() => onSelectProperty(featuredProperty)}
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(169, 137, 70, 0.35)" }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-[#A98946] hover:bg-[#95773B] text-[#FFFFFF] py-3.5 px-6 rounded-full text-xs font-semibold uppercase tracking-[0.12em] transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer group"
                  >
                    <span>View Property Details</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </motion.button>
                </div>

                <p className="text-[11px] text-[#625F58]/80 text-center italic">
                  Illustrative property showcase for portfolio visualization.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
