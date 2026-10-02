import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Compass,
  Layers,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface RoomTourData {
  id: string;
  name: string;
  category: string;
  description: string;
  videoUrl?: string;
  imageUrl: string;
  panoramicUrl: string;
  specs: {
    label: string;
    value: string;
  }[];
  hotspots: {
    id: string;
    top: number; // percentage
    left: number; // percentage
    title: string;
    detail: string;
    material: string;
  }[];
}

const TOUR_ROOMS: RoomTourData[] = [
  {
    id: 'foyer',
    name: 'Grand Living Foyer',
    category: 'Reception & Living',
    description:
      'Double-height 4.2m atrium featuring floor-to-ceiling Low-E architectural glazing, bespoke slatted acoustic paneling, and imported Italian travertine tile flooring.',
    imageUrl:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=90&w=1600&auto=format&fit=crop',
    panoramicUrl:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=90&w=2200&auto=format&fit=crop',
    specs: [
      { label: 'Ceiling Height', value: '4.20 meters' },
      { label: 'Floor Finish', value: 'Italian Travertine 1200x600' },
      { label: 'Lighting', value: 'Concealed DALI Smart LEDs' },
      { label: 'Glazing', value: 'Double-glazed Low-E Tint' },
    ],
    hotspots: [
      {
        id: 'hs-1',
        top: 32,
        left: 48,
        title: 'Floor-to-Ceiling Glazing',
        detail: 'Acoustically dampened double glazing with solar heat reduction coating.',
        material: 'Low-E Thermal Glazing',
      },
      {
        id: 'hs-2',
        top: 72,
        left: 35,
        title: 'Travertine Flooring',
        detail: 'Seamless matte-finish imported natural stone tiles with anti-slip treatment.',
        material: 'Italian Travertine',
      },
      {
        id: 'hs-3',
        top: 22,
        left: 82,
        title: 'Architectural Soffit Lighting',
        detail: 'Integrated 2700K warm circadian ambient light channels with mobile scene control.',
        material: 'DALI 2.0 Smart LED',
      },
    ],
  },
  {
    id: 'kitchen',
    name: "Chef's Gourmet Kitchen",
    category: 'Culinary & Dining',
    description:
      'Open-concept chef kitchen with a 3.4m Calacatta quartz waterfall island, flush-mounted soft-close cabinetry, built-in induction suite, and discrete pantry corridor.',
    imageUrl:
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=90&w=1600&auto=format&fit=crop',
    panoramicUrl:
      'https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=90&w=2200&auto=format&fit=crop',
    specs: [
      { label: 'Countertops', value: 'Calacatta Quartz Waterfall' },
      { label: 'Cabinetry', value: 'Matte Handleless Soft-Close' },
      { label: 'Appliances', value: 'Integrated Bosch German Suite' },
      { label: 'Extractor', value: 'Flush Downdraft Ventilation' },
    ],
    hotspots: [
      {
        id: 'hs-4',
        top: 58,
        left: 50,
        title: 'Waterfall Quartz Island',
        detail: 'Single-slab 3.4m island with cantilevered breakfast seating for 4.',
        material: 'Engineered Quartz',
      },
      {
        id: 'hs-5',
        top: 42,
        left: 78,
        title: 'Concealed Appliance Wall',
        detail: 'Seamless matte lacquered tall units hiding refrigerator and secondary pantry.',
        material: 'Anti-fingerprint Matte Lacquer',
      },
      {
        id: 'hs-6',
        top: 30,
        left: 28,
        title: 'Linear Task Luminaire',
        detail: 'Custom slimline black architectural pendant with dual up/down dimming.',
        material: 'Anodized Aluminum',
      },
    ],
  },
  {
    id: 'master-suite',
    name: 'Master Penthouse Suite',
    category: 'Private Quarters',
    description:
      'Expansive master suite boasting private veranda access, timber acoustic fluted feature wall, walk-in dressing wardrobe, and spa ensuite bathroom.',
    imageUrl:
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=90&w=1600&auto=format&fit=crop',
    panoramicUrl:
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=90&w=2200&auto=format&fit=crop',
    specs: [
      { label: 'Suite Footprint', value: '68 sqm + 18 sqm Terrace' },
      { label: 'Flooring', value: 'Engineered Natural Oak Plank' },
      { label: 'Wardrobe', value: 'Walk-in Glass Fronted Dressing' },
      { label: 'Climate', value: 'Concealed Multi-Zone VRF AC' },
    ],
    hotspots: [
      {
        id: 'hs-7',
        top: 45,
        left: 36,
        title: 'Fluted Acoustic Bedhead',
        detail: 'Bespoke natural white oak slatted wall paneling with integrated brass reading lamps.',
        material: 'Natural White Oak',
      },
      {
        id: 'hs-8',
        top: 40,
        left: 82,
        title: 'Private Sunset Veranda',
        detail: 'Direct sliding portal to the covered outdoor terrace overlooking lush greenery.',
        material: 'Thermal Framed Slider',
      },
      {
        id: 'hs-9',
        top: 75,
        left: 55,
        title: 'Wide-Plank Oak Floor',
        detail: 'Multi-layer matte lacquer engineered oak with underfloor acoustic underlay.',
        material: 'Engineered Hardwood',
      },
    ],
  },
  {
    id: 'study-lounge',
    name: 'Executive Study & Library',
    category: 'Work & Leisure',
    description:
      'Private study configured with floor-to-ceiling dark walnut joinery, integrated media wall, motorized privacy blinds, and high-speed fiber terminal.',
    imageUrl:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=90&w=1600&auto=format&fit=crop',
    panoramicUrl:
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=90&w=2200&auto=format&fit=crop',
    specs: [
      { label: 'Joinery', value: 'Walnut & Brushed Brass' },
      { label: 'Connectivity', value: 'Dedicated CAT6A + 1Gbps Fiber' },
      { label: 'Acoustics', value: 'Class A Sound Dampening' },
      { label: 'Orientation', value: 'North-facing Diffused Light' },
    ],
    hotspots: [
      {
        id: 'hs-10',
        top: 40,
        left: 28,
        title: 'Custom Walnut Shelving',
        detail: 'Precision-crafted millwork with concealed shelf LED lighting.',
        material: 'American Walnut',
      },
      {
        id: 'hs-11',
        top: 55,
        left: 70,
        title: 'Executive Lounge Seating',
        detail: 'Full-grain Italian aniline leather lounge chairs by architectural craftsmen.',
        material: 'Full-Grain Leather',
      },
    ],
  },
  {
    id: 'courtyard-pool',
    name: 'Courtyard & Pool Oasis',
    category: 'Outdoor Architecture',
    description:
      'Sunken garden lounge, natural basalt stone water features, infinity reflection pool, outdoor shower, and perimeter security with architectural dusk illumination.',
    imageUrl:
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=90&w=1600&auto=format&fit=crop',
    panoramicUrl:
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=90&w=2200&auto=format&fit=crop',
    specs: [
      { label: 'Pool Type', value: 'Saltwater Infinity Spillway' },
      { label: 'Decking', value: 'Non-slip Porcelain & Composite' },
      { label: 'Landscape', value: 'Indigenous Low-Maintenance Palms' },
      { label: 'Security', value: 'Infrared & 4K PTZ Perimeter' },
    ],
    hotspots: [
      {
        id: 'hs-12',
        top: 60,
        left: 45,
        title: 'Infinity Edge Pool',
        detail: 'Cascading spillway into concealed subterranean filtration reservoir.',
        material: 'Ceramic Mosaic & Basalt',
      },
      {
        id: 'hs-13',
        top: 48,
        left: 80,
        title: 'Covered Lanai Lounge',
        detail: 'Weather-resistant cantilevered canopy with integrated ceiling fans and heaters.',
        material: 'Powder-coated Steel',
      },
    ],
  },
];

interface VirtualTourHeroPlayerProps {
  onOpenAdvisorModal?: (interest?: string) => void;
}

export const VirtualTourHeroPlayer: React.FC<VirtualTourHeroPlayerProps> = ({
  onOpenAdvisorModal,
}) => {
  const [currentRoomIndex, setCurrentRoomIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [panOffset, setPanOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const [showSpecsPanel, setShowSpecsPanel] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentRoom = TOUR_ROOMS[currentRoomIndex];

  // Continuous auto-tour hands-free rotation every 7 seconds
  useEffect(() => {
    if (isPlaying && !isDragging) {
      autoPlayTimerRef.current = setInterval(() => {
        setCurrentRoomIndex((prev) => (prev + 1) % TOUR_ROOMS.length);
        setPanOffset(0);
      }, 7000);
    }
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isPlaying, isDragging]);

  // Mouse / Touch Parallax & Drag Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX - panOffset);
    setIsPlaying(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newOffset = e.clientX - startX;
    const clampedOffset = Math.max(-80, Math.min(80, newOffset));
    setPanOffset(clampedOffset);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX - panOffset);
    setIsPlaying(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const newOffset = e.touches[0].clientX - startX;
    const clampedOffset = Math.max(-80, Math.min(80, newOffset));
    setPanOffset(clampedOffset);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleSelectRoom = (idx: number) => {
    setCurrentRoomIndex(idx);
    setPanOffset(0);
  };

  const nextRoom = () => {
    setCurrentRoomIndex((prev) => (prev + 1) % TOUR_ROOMS.length);
    setPanOffset(0);
  };

  const prevRoom = () => {
    setCurrentRoomIndex((prev) => (prev - 1 + TOUR_ROOMS.length) % TOUR_ROOMS.length);
    setPanOffset(0);
  };

  return (
    <div className="w-full h-full relative">
      {/* Hero Embedded Player Container */}
      <div
        ref={containerRef}
        className="w-full h-full min-h-[380px] sm:min-h-[460px] md:min-h-[520px] lg:min-h-[580px] rounded-2xl overflow-hidden bg-[#121212] border border-[#DED7CA] shadow-[0_16px_40px_rgba(0,0,0,0.12)] relative flex flex-col justify-between select-none group"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Visual Scene Canvas with Smooth Pan Transition */}
        <div className="absolute inset-0 overflow-hidden bg-[#171716]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentRoom.id}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full relative"
              style={{
                transform: `scale(1.08) translateX(${panOffset * 0.4}px)`,
                transition: isDragging ? 'none' : 'transform 0.5s ease-out',
              }}
            >
              <img
                src={currentRoom.panoramicUrl}
                alt={`${currentRoom.name} - Architectural Virtual Walkthrough Uyo`}
                className="w-full h-full object-cover object-center pointer-events-none"
                loading="eager"
              />
            </motion.div>
          </AnimatePresence>

          {/* Cinematic Vignette and Ambient Depth Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/95 via-[#121212]/20 to-[#121212]/60 pointer-events-none" />
          <div className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-40" />
        </div>

        {/* Top Header Overlay: Live Tour Status & Interactive Actions */}
        <div className="relative z-10 p-3.5 sm:p-5 flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-[#121212]/85 backdrop-blur-md border border-[#A98946]/50 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.12em] text-[#A98946] shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#A98946] animate-pulse" />
              <span>360° Virtual Walkthrough</span>
            </span>

            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#121212]/70 backdrop-blur-md border border-[#FFFFFF]/10 text-[10px] font-medium text-[#DED7CA]">
              <Compass className="w-3 h-3 text-[#A98946]" />
              <span>Drag to Pan</span>
            </span>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSpecsPanel(!showSpecsPanel);
              }}
              title="Toggle Architectural Component Specs"
              className={`h-7 sm:h-8 px-2.5 sm:px-3 rounded-full border text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.1em] flex items-center gap-1.5 backdrop-blur-md transition-all cursor-pointer ${
                showSpecsPanel
                  ? 'bg-[#A98946] border-[#A98946] text-[#FFFFFF]'
                  : 'bg-[#121212]/80 border-[#FFFFFF]/20 text-[#FFFFFF] hover:border-[#A98946]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Specs</span>
            </button>
          </div>
        </div>

        {/* Slide-out Component Specs Drawer (Positioned safely on mobile) */}
        <AnimatePresence>
          {showSpecsPanel && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="absolute top-14 sm:top-16 right-3 sm:right-5 z-30 w-[calc(100%-1.5rem)] max-w-xs bg-[#121212]/95 backdrop-blur-xl border border-[#A98946]/50 rounded-2xl p-4 shadow-2xl text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#FFFFFF]/10 pb-2.5 mb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#A98946] block">
                    {currentRoom.category}
                  </span>
                  <h4 className="font-serif text-sm font-semibold text-[#FFFFFF]">
                    {currentRoom.name}
                  </h4>
                </div>
                <button
                  onClick={() => setShowSpecsPanel(false)}
                  className="text-[#DED7CA] hover:text-[#FFFFFF] p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 mb-3">
                {currentRoom.specs.map((spec, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs py-1 border-b border-[#FFFFFF]/5"
                  >
                    <span className="text-[#DED7CA] text-[11px]">{spec.label}</span>
                    <span className="text-[#FFFFFF] font-semibold text-[11px]">{spec.value}</span>
                  </div>
                ))}
              </div>

              <p className="text-[10px] sm:text-[11px] text-[#DED7CA]/90 leading-relaxed italic mb-3 line-clamp-3">
                "{currentRoom.description}"
              </p>

              {onOpenAdvisorModal && (
                <button
                  onClick={() => onOpenAdvisorModal(`Virtual Tour Inquiry: ${currentRoom.name}`)}
                  className="w-full bg-[#A98946] hover:bg-[#95773B] text-[#FFFFFF] py-2 rounded-xl text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Request Full Spec Sheet</span>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Tour Control Panel: Room Information & Room Switcher Ribbon */}
        <div className="relative z-10 p-3.5 sm:p-5 space-y-2.5 sm:space-y-3 bg-gradient-to-t from-[#121212] via-[#121212]/90 to-transparent">
          {/* Active Room Title & Auto-Play Navigation */}
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.14em] font-semibold text-[#A98946] truncate">
                  Room 0{currentRoomIndex + 1} of 0{TOUR_ROOMS.length} · {currentRoom.category}
                </span>
              </div>
              <h3 className="font-serif text-lg sm:text-2xl font-semibold text-[#FFFFFF] leading-tight truncate">
                {currentRoom.name}
              </h3>
            </div>

            {/* Play/Pause & Room Arrows */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlaying(!isPlaying);
                }}
                aria-label={isPlaying ? 'Pause auto walkthrough' : 'Resume auto walkthrough'}
                className="w-8 h-8 rounded-full bg-[#FFFFFF]/10 hover:bg-[#A98946] text-[#FFFFFF] border border-[#FFFFFF]/20 flex items-center justify-center transition-all cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 translate-x-0.5" />}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevRoom();
                }}
                aria-label="Previous room"
                className="w-8 h-8 rounded-full bg-[#FFFFFF]/10 hover:bg-[#FFFFFF]/20 text-[#FFFFFF] border border-[#FFFFFF]/20 flex items-center justify-center transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextRoom();
                }}
                aria-label="Next room"
                className="w-8 h-8 rounded-full bg-[#FFFFFF]/10 hover:bg-[#FFFFFF]/20 text-[#FFFFFF] border border-[#FFFFFF]/20 flex items-center justify-center transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Room Selector Pills Ribbon */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-none">
            {TOUR_ROOMS.map((room, idx) => {
              const isSelected = idx === currentRoomIndex;
              return (
                <button
                  key={room.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectRoom(idx);
                  }}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs whitespace-nowrap font-medium transition-all duration-300 flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-[#A98946] text-[#FFFFFF] font-semibold shadow-md'
                      : 'bg-[#121212]/80 hover:bg-[#FFFFFF]/15 text-[#DED7CA] border border-[#FFFFFF]/10'
                  }`}
                >
                  <span className="text-[9px] sm:text-[10px] opacity-75">0{idx + 1}</span>
                  <span>{room.name}</span>
                </button>
              );
            })}
          </div>

          {/* Continuous Auto-Tour Progress Bar */}
          <div className="w-full bg-[#FFFFFF]/10 h-1 rounded-full overflow-hidden">
            <motion.div
              key={currentRoomIndex + (isPlaying ? '-playing' : '-paused')}
              initial={{ width: '0%' }}
              animate={{ width: isPlaying ? '100%' : '0%' }}
              transition={{ duration: 7, ease: 'linear' }}
              className="h-full bg-[#A98946]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
