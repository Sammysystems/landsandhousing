import React from 'react';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { LOCATIONS_DATA } from '../data/mockData';
import { LocationDestination } from '../types';

interface DiscoverLocationsProps {
  onSelectLocation: (loc: LocationDestination) => void;
}

export const DiscoverLocations: React.FC<DiscoverLocationsProps> = ({
  onSelectLocation,
}) => {
  return (
    <section
      id="locations"
      className="py-20 md:py-28 px-5 sm:px-7 md:px-10 bg-[#EEE8DD]/40 border-t border-[#DED7CA]"
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
            LOCAL MARKET GEOGRAPHY
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#121212] leading-tight">
            Explore Property Opportunities Across Uyo
          </h2>
          <p className="text-[#625F58] text-base md:text-lg mt-3 font-sans">
            From established prime residential enclaves to strategic arterial commercial axes, discover neighborhoods defined by strong capital retention and lifestyle value.
          </p>
        </motion.div>

        {/* Travel-Editorial Destination Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
          {LOCATIONS_DATA.map((location, idx) => (
            <motion.div
              key={location.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.6, delay: idx * 0.08 }}
              whileHover={{ y: -6 }}
              id={`destination-card-${location.id}`}
              onClick={() => onSelectLocation(location)}
              className="group cursor-pointer bg-[#FFFFFF] rounded-2xl border border-[#DED7CA] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-[#A98946] hover:shadow-[0_16px_36px_rgba(0,0,0,0.06)] shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
            >
              {/* Photo Area */}
              <div className="relative aspect-[16/10] sm:aspect-[16/11] overflow-hidden bg-[#EEE8DD]">
                <img
                  src={location.imageUrl}
                  alt={location.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/85 via-[#121212]/30 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />
                
                <div className="absolute bottom-4 left-4 right-4 text-[#F7F4EE]">
                  <span className="text-[10px] uppercase tracking-[0.12em] font-medium text-[#DED7CA] block mb-1">
                    {location.character}
                  </span>
                  <h3 className="font-serif text-2xl font-semibold leading-tight text-[#FFFFFF] group-hover:text-[#F7F4EE] transition-colors">
                    {location.name}
                  </h3>
                </div>
              </div>

              {/* Text Description */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-sm text-[#625F58] leading-relaxed font-sans">
                  {location.description}
                </p>

                <div className="pt-4 border-t border-[#DED7CA]/60 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#65715D] uppercase tracking-[0.1em]">
                    {location.propertyCount}
                  </span>

                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#121212] group-hover:text-[#A98946] transition-colors"
                  >
                    <span>View Properties</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

