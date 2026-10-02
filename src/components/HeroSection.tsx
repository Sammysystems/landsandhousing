import React, { useState } from 'react';
import { Search, ChevronDown, Star, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { BUSINESS_INFO } from '../data/mockData';
import { VirtualTourHeroPlayer } from './VirtualTourHeroPlayer';

interface HeroSectionProps {
  onSearch: (filters: { location: string; type: string; purpose: string; budget: string }) => void;
  onExploreClick: () => void;
  onOpenAdvisorModal: (interest?: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearch,
  onExploreClick,
  onOpenAdvisorModal,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<string>('All Locations in Uyo');
  const [selectedType, setSelectedType] = useState<string>('All Property Types');
  const [selectedPurpose, setSelectedPurpose] = useState<string>('Buy');
  const [selectedBudget, setSelectedBudget] = useState<string>('Any Budget');

  const locationOptions = [
    'All Locations in Uyo',
    'Aka Road Corridor',
    'Ewet Housing Estate',
    'Shelter Afrique',
    'Osongama Estate',
    'Abak Road Hub',
    'Uyo City Centre',
    'Ring Road Expansion Zones',
  ];

  const typeOptions = [
    'All Property Types',
    'Residential Luxury Villa',
    'Commercial Office & Plaza',
    'Detached Executive House',
    'Prime Development Land',
    'Mixed-Use Commercial',
  ];

  const purposeOptions = ['Buy', 'Rent', 'Invest', 'Commercial'];

  const budgetOptions = [
    'Any Budget',
    'Under ₦50M',
    '₦50M – ₦150M',
    '₦150M – ₦300M',
    '₦300M+',
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      location: selectedLocation,
      type: selectedType,
      purpose: selectedPurpose,
      budget: selectedBudget,
    });
    const propertiesSection = document.getElementById('properties');
    if (propertiesSection) {
      propertiesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      className="relative bg-[#F7F4EE] pt-20 sm:pt-24 lg:pt-28 pb-8 lg:pb-12 overflow-hidden"
    >
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8 md:px-12">
        {/* Split Editorial Composition: Desktop Left 45% / Right 55% */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[580px] lg:min-h-[640px]">
          {/* Left Column: ~45% Editorial Content */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center space-y-6 pt-4 lg:pt-0"
          >
            {/* Hero Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="text-[12px] uppercase tracking-[0.14em] font-semibold text-[#A98946] inline-block">
                PROPERTY ADVISORY · UYO, NIGERIA
              </span>
            </motion.div>

            {/* Hero Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-[#121212] text-[34px] sm:text-[48px] md:text-[56px] lg:text-[62px] xl:text-[68px] font-medium leading-[1.06] tracking-[-0.02em] max-w-[620px]"
            >
              Find the <span className="text-[#A98946] font-bold">Right Property</span>.<br />
              Move With <span className="text-[#A98946] font-bold">Confidence</span>.
            </motion.h1>

            {/* Supporting Copy */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-[#625F58] font-sans text-base sm:text-lg leading-[1.6] max-w-[560px]"
            >
              LandsandHousing helps buyers, owners, and investors navigate property sales, costing, and management with clarity and confidence.
            </motion.p>

            {/* CTA System */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 w-full sm:w-auto"
            >
              <motion.button
                id="hero-explore-cta"
                onClick={onExploreClick}
                whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(169, 137, 70, 0.35)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto bg-[#A98946] hover:bg-[#95773B] text-[#FFFFFF] h-[52px] sm:h-[54px] px-8 rounded-full text-xs font-semibold uppercase tracking-[0.12em] transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer group shadow-xs"
              >
                <span>Explore Properties</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </motion.button>

              <motion.button
                id="hero-advisor-cta"
                onClick={() => onOpenAdvisorModal('General Advisory')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto bg-transparent hover:bg-[#121212] hover:text-[#FFFFFF] text-[#121212] border border-[#121212] h-[52px] sm:h-[54px] px-8 rounded-full text-xs font-medium uppercase tracking-[0.12em] transition-all duration-200 flex items-center justify-center cursor-pointer"
              >
                Speak With an Advisor
              </motion.button>
            </motion.div>

            {/* Trust Signal (Understated & Verified) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="pt-2 text-xs text-[#625F58] flex items-center gap-2"
            >
              <div className="flex items-center text-[#A98946]">
                <Star className="w-3.5 h-3.5 fill-[#A98946] stroke-none" />
              </div>
              <span className="font-semibold text-[#121212]">4.9★ on Google</span>
              <span className="text-[#DED7CA]">·</span>
              <span>19 Reviews</span>
              <span className="text-[#DED7CA]">·</span>
              <span>Uyo, Akwa Ibom</span>
            </motion.div>
          </motion.div>

          {/* Right Column: ~55% Architectural Virtual Tour & Video Walkthrough Player */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 xl:col-span-7 h-[420px] sm:h-[480px] md:h-[540px] lg:h-[600px] w-full"
          >
            <VirtualTourHeroPlayer onOpenAdvisorModal={onOpenAdvisorModal} />
          </motion.div>
        </div>

        {/* Property Discovery Bar at the bottom of the Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 lg:mt-10"
        >
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#DED7CA] p-4 sm:p-5 lg:px-6 lg:py-3.5 shadow-[0_6px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_32px_rgba(0,0,0,0.07)] transition-shadow duration-300">
            <form
              onSubmit={handleSearchSubmit}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-0 items-center"
            >
              {/* Field 1: Location */}
              <div className="lg:col-span-3 pb-3 sm:pb-3 lg:pb-0 sm:pr-3 lg:pr-4 border-b sm:border-b-0 sm:border-r lg:border-r border-[#DED7CA]">
                <label
                  htmlFor="hero-search-location"
                  className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#625F58] mb-0.5"
                >
                  Location
                </label>
                <div className="relative">
                  <select
                    id="hero-search-location"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full appearance-none bg-transparent text-sm text-[#121212] font-medium focus:outline-none focus:text-[#A98946] pr-6 py-1 cursor-pointer"
                  >
                    {locationOptions.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#625F58] absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Field 2: Property Type */}
              <div className="lg:col-span-3 py-3 sm:py-3 lg:py-0 sm:pl-3 lg:px-4 border-b sm:border-b-0 lg:border-r border-[#DED7CA]">
                <label
                  htmlFor="hero-search-type"
                  className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#625F58] mb-0.5"
                >
                  Property Type
                </label>
                <div className="relative">
                  <select
                    id="hero-search-type"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full appearance-none bg-transparent text-sm text-[#121212] font-medium focus:outline-none focus:text-[#A98946] pr-6 py-1 cursor-pointer"
                  >
                    {typeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#625F58] absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Field 3: Purpose */}
              <div className="lg:col-span-2 py-3 sm:py-3 lg:py-0 sm:pr-3 lg:px-4 border-b sm:border-b-0 sm:border-t sm:border-r lg:border-t-0 lg:border-r border-[#DED7CA]">
                <label
                  htmlFor="hero-search-purpose"
                  className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#625F58] mb-0.5"
                >
                  Purpose
                </label>
                <div className="relative">
                  <select
                    id="hero-search-purpose"
                    value={selectedPurpose}
                    onChange={(e) => setSelectedPurpose(e.target.value)}
                    className="w-full appearance-none bg-transparent text-sm text-[#121212] font-medium focus:outline-none focus:text-[#A98946] pr-6 py-1 cursor-pointer"
                  >
                    {purposeOptions.map((purp) => (
                      <option key={purp} value={purp}>
                        {purp}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#625F58] absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Field 4: Budget */}
              <div className="lg:col-span-2 py-3 sm:py-3 lg:py-0 sm:pl-3 lg:px-4 border-b sm:border-b-0 sm:border-t lg:border-t-0 lg:border-r border-[#DED7CA]">
                <label
                  htmlFor="hero-search-budget"
                  className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-[#625F58] mb-0.5"
                >
                  Budget
                </label>
                <div className="relative">
                  <select
                    id="hero-search-budget"
                    value={selectedBudget}
                    onChange={(e) => setSelectedBudget(e.target.value)}
                    className="w-full appearance-none bg-transparent text-sm text-[#121212] font-medium focus:outline-none focus:text-[#A98946] pr-6 py-1 cursor-pointer"
                  >
                    {budgetOptions.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#625F58] absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Action Button */}
              <div className="lg:col-span-2 pt-3 sm:pt-4 lg:pt-0 sm:col-span-2 lg:pl-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  id="hero-search-submit-btn"
                  className="w-full bg-[#A98946] hover:bg-[#95773B] text-[#FFFFFF] h-[48px] px-4 rounded-xl text-xs font-semibold uppercase tracking-[0.1em] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Search className="w-4 h-4" />
                  <span className="whitespace-nowrap">Search Properties</span>
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
