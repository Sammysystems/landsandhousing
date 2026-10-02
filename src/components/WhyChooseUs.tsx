import React from 'react';
import { Compass, Scale, Briefcase, LifeBuoy, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { BUSINESS_INFO } from '../data/mockData';

export const WhyChooseUs: React.FC = () => {
  const principles = [
    {
      icon: Compass,
      title: 'Local Market Knowledge',
      description:
        'Deep on-the-ground familiarity with Uyo’s evolving zoning corridors, land registries, pricing benchmarks, and infrastructural growth axes.',
    },
    {
      icon: Scale,
      title: 'Clear Property Evaluation',
      description:
        'Objective costing and documented title verification before any commitment, ensuring buyers and investors never overpay or inherit legal friction.',
    },
    {
      icon: Briefcase,
      title: 'Professional Service',
      description:
        'Discreet, transparent representation whether negotiating commercial arterial assets or managing high-spec residential properties.',
    },
    {
      icon: LifeBuoy,
      title: 'Long-Term Property Support',
      description:
        'From acquisition through ongoing tenancy management and facility oversight, our relationship continues well past closing.',
    },
  ];

  return (
    <section
      id="advisory"
      className="py-20 md:py-28 px-5 sm:px-7 md:px-10 bg-[#EEE8DD]/50 border-t border-[#DED7CA]"
    >
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Image with Floating Google Badge (Col 1-5) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 relative"
          >
            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-[#DED7CA] border border-[#DED7CA] shadow-[0_12px_36px_rgba(0,0,0,0.05)] group">
              <img
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop"
                alt="Architecture and Property Advisory in Uyo"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>

            {/* Floating trust badge with subtle hover motion - contained safely within mobile bounds */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-3 right-3 sm:-bottom-6 sm:right-6 bg-[#FFFFFF]/95 backdrop-blur-xs border border-[#DED7CA] p-4 sm:p-5 rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.08)] max-w-[220px] sm:max-w-[260px]"
            >
              <div className="flex items-center gap-2 text-[#65715D] mb-1">
                <ShieldCheck className="w-4 h-4 text-[#A98946]" />
                <span className="text-[10px] uppercase tracking-[0.12em] font-semibold">
                  Google Verified
                </span>
              </div>
              <div className="font-serif text-xl sm:text-2xl font-bold text-[#121212]">
                4.9 / 5.0
              </div>
              <p className="text-[11px] sm:text-xs text-[#625F58] mt-1 font-sans">
                19 verified client reviews & 24-hour advisory service.
              </p>
            </motion.div>
          </motion.div>

          {/* Right Column: Principles (Col 6-12) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 space-y-8 sm:space-y-10"
          >
            <div>
              <span className="text-[11px] font-semibold text-[#A98946] uppercase tracking-[0.14em] font-sans block mb-2">
                THE ADVISORY STANDARD
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#121212] leading-tight">
                Real Estate Decisions Deserve More Than a Listing.
              </h2>
              <p className="text-[#625F58] text-base md:text-lg mt-4 font-sans leading-relaxed">
                Navigating Nigerian real estate requires factual clarity, uncompromised due diligence, and reliable local execution. We provide the structure required for confident decisions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2">
              {principles.map((p, idx) => {
                const IconComp = p.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="space-y-2.5 p-4 sm:p-5 rounded-xl bg-[#FFFFFF]/70 sm:bg-transparent border border-[#DED7CA] sm:border-transparent hover:bg-[#FFFFFF] sm:hover:bg-[#FFFFFF]/70 hover:border-[#A98946]/50 transition-all duration-300 group shadow-xs sm:shadow-none"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#FFFFFF] border border-[#DED7CA] group-hover:border-[#A98946] flex items-center justify-center text-[#121212] transition-colors shadow-xs">
                      <IconComp className="w-4 h-4 text-[#A98946]" />
                    </div>
                    <h3 className="font-serif text-xl font-semibold text-[#121212] group-hover:text-[#A98946] transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#625F58] leading-relaxed font-sans">
                      {p.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

