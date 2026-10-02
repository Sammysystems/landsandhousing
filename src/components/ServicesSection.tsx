import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Calculator, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SERVICES_DATA } from '../data/mockData';
import { ServiceDetail } from '../types';

interface ServicesSectionProps {
  onOpenAdvisorModal: (serviceName?: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onOpenAdvisorModal,
}) => {
  const [activeTab, setActiveTab] = useState<string>(SERVICES_DATA[0].id);

  const selectedService = SERVICES_DATA.find((s) => s.id === activeTab) || SERVICES_DATA[0];

  return (
    <section
      id="services"
      className="py-20 md:py-28 px-5 sm:px-7 md:px-10 bg-[#F7F4EE] border-t border-[#DED7CA]"
    >
      <div className="max-w-[1280px] mx-auto">
        {/* Editorial Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mb-16"
        >
          <span className="text-[11px] font-semibold text-[#A98946] uppercase tracking-[0.14em] font-sans block mb-2">
            CORE CAPABILITIES & EXPERTISE
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#121212] leading-tight">
            More Than Property Sales.
          </h2>
          <p className="text-[#625F58] text-base md:text-lg mt-4 leading-relaxed font-sans">
            From acquisition to management, LandsandHousing supports the decisions that happen before, during, and after the transaction.
          </p>
        </motion.div>

        {/* Editorial Service Selector Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-8 sm:mb-10 pb-6 border-b border-[#DED7CA]">
          {SERVICES_DATA.map((service, idx) => (
            <motion.button
              key={service.id}
              id={`service-tab-${service.id}`}
              onClick={() => setActiveTab(service.id)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              className={`p-3.5 sm:p-5 rounded-xl text-left transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                activeTab === service.id
                  ? 'bg-[#121212] text-[#F7F4EE] shadow-md'
                  : 'bg-[#FFFFFF] text-[#121212] border border-[#DED7CA] hover:border-[#A98946]'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2 sm:mb-3">
                <span className={`text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.1em] ${
                  activeTab === service.id ? 'text-[#A98946]' : 'text-[#625F58]'
                }`}>
                  0{idx + 1} · {service.tag}
                </span>
                <ArrowUpRight className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${activeTab === service.id ? 'text-[#A98946] translate-x-0.5 -translate-y-0.5' : 'text-[#625F58]'}`} />
              </div>
              <span className="font-serif text-base sm:text-xl font-semibold leading-snug">
                {service.title}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Active Service Showcase - Large Editorial Layout with AnimatePresence */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#DED7CA] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedService.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-12"
            >
              {/* Text & Deliverables Area (Col 1-7) */}
              <div className="lg:col-span-7 p-5 sm:p-8 lg:p-12 flex flex-col justify-between space-y-6 sm:space-y-8 border-b lg:border-b-0 lg:border-r border-[#DED7CA]">
                <div className="space-y-4">
                  <span className="inline-block text-[11px] font-semibold text-[#65715D] uppercase tracking-[0.1em] font-sans bg-[#EEE8DD] px-3.5 py-1 rounded-full">
                    {selectedService.tag}
                  </span>

                  <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-[#121212] leading-tight">
                    {selectedService.title}
                  </h3>

                  <p className="text-[#A98946] font-serif text-lg italic">
                    "{selectedService.subtitle}"
                  </p>

                  <p className="text-sm sm:text-base text-[#625F58] leading-relaxed font-sans pt-2">
                    {selectedService.description}
                  </p>
                </div>

                {/* Key Deliverables */}
                <div className="space-y-3 pt-4 border-t border-[#DED7CA]/70">
                  <span className="text-[11px] font-semibold text-[#121212] uppercase tracking-[0.12em] block">
                    Standard Advisory Deliverables:
                  </span>
                  <ul className="space-y-2.5">
                    {selectedService.keyDeliverables.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#625F58]">
                        <CheckCircle2 className="w-4 h-4 text-[#65715D] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action CTA */}
                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <motion.button
                    id={`service-inquire-cta-${selectedService.id}`}
                    onClick={() => onOpenAdvisorModal(selectedService.title)}
                    whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(169, 137, 70, 0.35)" }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto bg-[#A98946] hover:bg-[#95773B] text-[#FFFFFF] px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-[0.12em] transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer group"
                  >
                    <span>Consult on {selectedService.title}</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </motion.button>
                </div>
              </div>

              {/* Supporting Photo Area (Col 8-12) */}
              <div className="lg:col-span-5 relative min-h-[260px] sm:min-h-[320px] lg:min-h-full bg-[#EEE8DD] overflow-hidden group">
                <img
                  src={selectedService.imageUrl}
                  alt={selectedService.title}
                  loading="lazy"
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/50 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 p-3.5 sm:p-4 rounded-xl bg-[#FFFFFF]/95 backdrop-blur-xs border border-[#DED7CA] shadow-sm">
                  <span className="text-[11px] uppercase tracking-wider text-[#625F58] font-semibold block">
                    LandsandHousing Standard
                  </span>
                  <span className="text-xs text-[#121212] font-medium mt-0.5 block">
                    181 Aka Rd, Uyo · Commercial & Residential Advisory
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

