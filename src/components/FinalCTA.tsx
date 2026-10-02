import React from 'react';
import { ArrowRight, Phone } from 'lucide-react';
import { motion } from 'motion/react';
import { BUSINESS_INFO } from '../data/mockData';

interface FinalCTAProps {
  onOpenAdvisorModal: () => void;
  onExploreProperties: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({
  onOpenAdvisorModal,
  onExploreProperties,
}) => {
  return (
    <section
      id="final-conversion"
      className="relative py-24 md:py-32 px-5 sm:px-7 md:px-10 bg-[#121212] text-[#F7F4EE] overflow-hidden"
    >
      {/* Background Architectural Photo with Deep Vignette */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop"
          alt="Luxury modern property architecture in Nigeria"
          loading="lazy"
          className="w-full h-full object-cover object-center opacity-25 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/90 to-[#121212]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-[960px] mx-auto text-center space-y-8"
      >
        <span className="inline-block text-[11px] font-semibold text-[#A98946] uppercase tracking-[0.14em] font-sans border border-[#A98946]/40 px-4 py-1.5 rounded-full">
          LANDSANDHOUSING PROPERTY ADVISORY
        </span>

        <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-semibold leading-[1.1] tracking-tight text-[#FFFFFF]">
          Find the Right Property With Confidence.
        </h2>

        <p className="text-[#DED7CA] text-base sm:text-lg md:text-xl font-normal max-w-2xl mx-auto leading-relaxed font-sans">
          Tell us what you are looking for and let us help you take the next step. Discreet advisory for buyers, sellers, landlords, and commercial developers in Uyo.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-4 max-w-md sm:max-w-none mx-auto">
          <motion.button
            id="final-speak-advisor-btn"
            onClick={onOpenAdvisorModal}
            whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(169, 137, 70, 0.4)" }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto bg-[#A98946] hover:bg-[#95773B] text-[#FFFFFF] font-semibold px-9 py-3.5 sm:py-4 rounded-full text-xs uppercase tracking-[0.12em] transition-colors duration-200 flex items-center justify-center gap-2.5 shadow-xl cursor-pointer group"
          >
            <span>Speak With an Advisor</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </motion.button>

          <motion.button
            id="final-explore-properties-btn"
            onClick={onExploreProperties}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto bg-transparent hover:bg-[#FFFFFF]/10 text-[#F7F4EE] border border-[#DED7CA]/40 hover:border-[#DED7CA] px-8 py-3.5 sm:py-4 rounded-full text-xs font-semibold uppercase tracking-[0.12em] transition-all duration-200 cursor-pointer"
          >
            Explore Properties
          </motion.button>
        </div>

        <div className="pt-6 sm:pt-8 border-t border-[#DED7CA]/20 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-6 text-xs text-[#DED7CA]/80">
          <span>181 Aka Rd, Uyo 520001, Akwa Ibom</span>
          <span className="hidden sm:inline">•</span>
          <a
            href={`tel:${BUSINESS_INFO.phoneClean}`}
            className="text-[#A98946] hover:underline font-semibold"
          >
            Direct Line: {BUSINESS_INFO.phone}
          </a>
          <span className="hidden sm:inline">•</span>
          <span>Google Rating: 4.9★ (19 Reviews)</span>
        </div>
      </motion.div>
    </section>
  );
};

