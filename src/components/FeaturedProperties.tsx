import React, { useState } from 'react';
import { ArrowUpRight, Bed, Bath, Maximize2, MapPin, Tag, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Property } from '../types';

interface FeaturedPropertiesProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  activeFilter?: string;
}

export const FeaturedProperties: React.FC<FeaturedPropertiesProps> = ({
  properties,
  onSelectProperty,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Commercial', 'Residential', 'Land'];

  const filteredProperties = properties.filter((prop) => {
    if (activeCategory === 'All') return true;
    return prop.type === activeCategory;
  });

  const mainFeatured = filteredProperties[0] || properties[0];
  const supportingProperties = filteredProperties.slice(1, 4);

  return (
    <section
      id="properties"
      className="py-20 md:py-28 px-5 sm:px-7 md:px-10 bg-[#F7F4EE]"
    >
      <div className="max-w-[1280px] mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-[#DED7CA]"
        >
          <div>
            <span className="text-[11px] font-semibold text-[#A98946] uppercase tracking-[0.14em] font-sans block mb-2">
              DISCOVERY & PORTFOLIO
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#121212] leading-tight">
              Selected Properties
            </h2>
            <p className="text-[#625F58] text-base md:text-lg mt-3 max-w-xl font-sans">
              A curated selection of properties and opportunities worth a closer look across Uyo.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <motion.button
                key={cat}
                id={`property-cat-${cat.toLowerCase()}`}
                onClick={() => setActiveCategory(cat)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-[0.1em] transition-all duration-200 cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#121212] text-[#F7F4EE] shadow-xs'
                    : 'bg-[#FFFFFF] text-[#625F58] border border-[#DED7CA] hover:border-[#A98946] hover:text-[#121212]'
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Asymmetrical Editorial Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Main Large Featured Property (Col 1-7) */}
          {mainFeatured && (
            <motion.div
              key={`main-${mainFeatured.id}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.8 }}
              whileHover={{ y: -6 }}
              id={`featured-primary-${mainFeatured.id}`}
              onClick={() => onSelectProperty(mainFeatured)}
              className="lg:col-span-7 group cursor-pointer bg-[#FFFFFF] rounded-2xl border border-[#DED7CA] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-[#A98946] hover:shadow-[0_16px_36px_rgba(0,0,0,0.06)] shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
            >
              {/* Image Container */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[#EEE8DD]">
                <img
                  src={mainFeatured.imageUrl}
                  alt={mainFeatured.title}
                  loading="lazy"
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-[#121212]/90 backdrop-blur-xs text-[#F7F4EE] text-[11px] font-medium uppercase tracking-wider px-3 py-1 rounded-full">
                    {mainFeatured.type}
                  </span>
                  <span className="bg-[#A98946] text-[#F7F4EE] text-[11px] font-medium uppercase tracking-wider px-3 py-1 rounded-full">
                    {mainFeatured.purpose}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 sm:p-8 flex-1 flex flex-col justify-between space-y-5 sm:space-y-6">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-[#625F58] mb-2 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#A98946]" />
                    <span>{mainFeatured.location}</span>
                  </div>

                  <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#121212] group-hover:text-[#A98946] transition-colors leading-snug">
                    {mainFeatured.title}
                  </h3>

                  <p className="text-sm text-[#625F58] mt-3 line-clamp-2 leading-relaxed font-sans">
                    {mainFeatured.description}
                  </p>
                </div>

                {/* Specs & Price */}
                <div className="pt-5 border-t border-[#DED7CA]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div>
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#625F58] block font-medium">
                      Guide Price
                    </span>
                    <span className="font-serif text-2xl font-bold text-[#A98946]">
                      {mainFeatured.priceFormatted}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 text-xs text-[#625F58] pt-2 sm:pt-0 border-t sm:border-t-0 border-[#DED7CA]/40">
                    <div className="flex items-center gap-3">
                      {mainFeatured.beds && (
                        <span className="flex items-center gap-1">
                          <Bed className="w-3.5 h-3.5 text-[#121212]" /> {mainFeatured.beds} Beds
                        </span>
                      )}
                      {mainFeatured.sizeSqFt && (
                        <span className="flex items-center gap-1">
                          <Maximize2 className="w-3.5 h-3.5 text-[#121212]" /> {mainFeatured.sizeSqFt}
                        </span>
                      )}
                      {mainFeatured.plotSize && !mainFeatured.beds && (
                        <span className="flex items-center gap-1">
                          <Maximize2 className="w-3.5 h-3.5 text-[#121212]" /> {mainFeatured.plotSize}
                        </span>
                      )}
                    </div>

                    <div className="inline-flex items-center gap-1 text-[#121212] group-hover:text-[#A98946] font-semibold text-xs sm:ml-2 sm:pl-3 sm:border-l border-[#DED7CA]">
                      <span>View Property</span>
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Supporting Asymmetrical Cards (Col 8-12) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {supportingProperties.map((prop, idx) => (
              <motion.div
                key={prop.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                whileHover={{ y: -4 }}
                id={`featured-supporting-${prop.id}`}
                onClick={() => onSelectProperty(prop)}
                className="group cursor-pointer bg-[#FFFFFF] rounded-2xl border border-[#DED7CA] p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-5 transition-all duration-300 hover:border-[#A98946] hover:shadow-[0_12px_28px_rgba(0,0,0,0.05)] shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
              >
                {/* Thumbnail */}
                <div className="sm:w-2/5 aspect-[4/3] sm:aspect-square rounded-xl overflow-hidden bg-[#EEE8DD] shrink-0 relative">
                  <img
                    src={prop.imageUrl}
                    alt={prop.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-semibold text-[#65715D] uppercase tracking-wider bg-[#EEE8DD] px-2 py-0.5 rounded-sm">
                        {prop.type}
                      </span>
                      <span className="text-[11px] text-[#625F58] truncate">{prop.location}</span>
                    </div>

                    <h4 className="font-serif text-lg sm:text-xl font-semibold text-[#121212] group-hover:text-[#A98946] transition-colors leading-snug line-clamp-2">
                      {prop.title}
                    </h4>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#DED7CA]/60 flex items-center justify-between">
                    <span className="font-serif text-lg font-bold text-[#121212]">
                      {prop.priceFormatted}
                    </span>

                    <span className="text-xs font-medium text-[#121212] group-hover:text-[#A98946] flex items-center gap-1">
                      <span>View</span>
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Prototype / Illustrative Inventory Notice (Adhering to strict rule) */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-[#EEE8DD]/70 rounded-2xl border border-[#DED7CA] p-5 flex items-start gap-3 text-xs text-[#625F58]"
            >
              <Info className="w-4 h-4 text-[#A98946] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#121212] block font-medium mb-0.5">
                  Illustrative Advisory Catalog
                </strong>
                Current properties are rendered as illustrative portfolio examples. LandsandHousing provides active bespoke search and verified on-demand acquisition across Uyo.
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

