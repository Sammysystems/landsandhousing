import React from 'react';
import { ArrowRight, PlusCircle, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface PropertyOwnerCTAProps {
  onOpenListModal: () => void;
  onOpenAdvisorModal: (topic?: string) => void;
}

export const PropertyOwnerCTA: React.FC<PropertyOwnerCTAProps> = ({
  onOpenListModal,
  onOpenAdvisorModal,
}) => {
  return (
    <section
      id="owners"
      className="py-20 md:py-28 px-5 sm:px-7 md:px-10 bg-[#F7F4EE] border-t border-[#DED7CA]"
    >
      <div className="max-w-[1280px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.8 }}
          className="bg-[#EEE8DD] rounded-2xl border border-[#DED7CA] overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-[0_12px_36px_rgba(0,0,0,0.03)]"
        >
          {/* Text & Actions (Col 1-7) */}
          <div className="lg:col-span-7 p-6 sm:p-12 lg:p-16 flex flex-col justify-between space-y-6 sm:space-y-8 border-b lg:border-b-0 lg:border-r border-[#DED7CA]">
            <div className="space-y-3 sm:space-y-4">
              <span className="text-[11px] font-semibold text-[#A98946] uppercase tracking-[0.14em] font-sans block">
                FOR PROPERTY OWNERS & LANDLORDS
              </span>
              
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#121212] leading-tight">
                Have a Property to Sell or Manage?
              </h2>

              <p className="text-[#625F58] text-base md:text-lg leading-relaxed font-sans pt-1 sm:pt-2">
                Put your property in front of serious buyers and receive professional support from valuation through transaction. We assist landlords, diaspora owners, and commercial developers in maximizing asset performance.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2 sm:pt-4 w-full sm:w-auto">
              <motion.button
                id="owner-list-property-cta"
                onClick={onOpenListModal}
                whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(169, 137, 70, 0.35)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto bg-[#A98946] hover:bg-[#95773B] text-[#FFFFFF] px-8 py-3.5 sm:py-4 rounded-full text-xs font-semibold uppercase tracking-[0.12em] transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer group shadow-xs"
              >
                <PlusCircle className="w-4 h-4 text-[#FFFFFF] transition-transform duration-300 group-hover:rotate-90" />
                <span>List a Property</span>
              </motion.button>

              <motion.button
                id="owner-speak-advisor-cta"
                onClick={() => onOpenAdvisorModal('Property Management & Sales for Owners')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto bg-[#FFFFFF] hover:bg-[#121212] hover:text-[#FFFFFF] text-[#121212] border border-[#121212] px-8 py-3.5 sm:py-4 rounded-full text-xs font-semibold uppercase tracking-[0.12em] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-[#625F58] group-hover:text-[#FFFFFF]" />
                <span>Speak With an Advisor</span>
              </motion.button>
            </div>
          </div>

          {/* Image Area (Col 8-12) */}
          <div className="lg:col-span-5 relative min-h-[260px] sm:min-h-[300px] lg:min-h-full bg-[#DED7CA] overflow-hidden group">
            <img
              src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200&auto=format&fit=crop"
              alt="Luxury property management and sales in Uyo"
              loading="lazy"
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#EEE8DD]/30 to-transparent lg:from-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

