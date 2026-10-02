import React from 'react';
import { motion } from 'motion/react';
import { BUSINESS_INFO } from '../data/mockData';

export const TrustStrip: React.FC = () => {
  const trustItems = [
    {
      stat: '4.9★',
      label: 'Google Rating · 19 Reviews',
      accent: 'text-[#A98946]',
    },
    {
      stat: 'Sales',
      label: 'Verified Acquisitions',
      accent: 'text-[#121212]',
    },
    {
      stat: 'Management',
      label: 'Full-Lifecycle Support',
      accent: 'text-[#121212]',
    },
    {
      stat: '181 Aka Rd',
      label: 'Uyo Physical Presence',
      accent: 'text-[#121212]',
    },
  ];

  return (
    <section
      id="trust-strip"
      className="border-y border-[#DED7CA] bg-[#F7F4EE] py-8 sm:py-10 px-5 sm:px-7 md:px-10"
    >
      <div className="max-w-[1280px] mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.12 },
            },
          }}
          className="grid grid-cols-2 md:grid-cols-4 divide-y-0"
        >
          {trustItems.map((item, idx) => {
            // Precise border alignment for 2x2 on mobile and 1x4 on desktop
            const borderClasses = [
              // Item 0: top-left on mobile, first on desktop
              'border-r border-b md:border-b-0 border-[#DED7CA] pr-4 pb-4 md:pb-0 md:pr-6',
              // Item 1: top-right on mobile, second on desktop
              'pl-4 pb-4 md:pb-0 md:px-6 md:border-r border-b md:border-b-0 border-[#DED7CA]',
              // Item 2: bottom-left on mobile, third on desktop
              'pt-4 md:pt-0 pr-4 md:px-6 border-r border-[#DED7CA]',
              // Item 3: bottom-right on mobile, fourth on desktop
              'pt-4 md:pt-0 pl-4 md:pl-6',
            ][idx];

            return (
              <motion.div
                key={idx}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
                }}
                whileHover={{ y: -3 }}
                className={`flex flex-col justify-center gap-1 ${borderClasses} transition-transform duration-200 group cursor-default`}
              >
                <span className={`font-serif text-2xl sm:text-3xl font-semibold ${item.accent} group-hover:text-[#A98946] transition-colors leading-tight`}>
                  {item.stat}
                </span>
                <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.12em] text-[#625F58] font-medium leading-tight">
                  {item.label}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};


