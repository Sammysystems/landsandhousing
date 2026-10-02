import React, { useState, useEffect, useRef } from 'react';
import { Star, ShieldCheck, Quote, ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BUSINESS_INFO, REVIEWS_DATA } from '../data/mockData';

export const ReviewsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalReviews = REVIEWS_DATA.length;

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % totalReviews);
  };

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + totalReviews) % totalReviews);
  };

  // Continuous auto-loop interval (5.5 seconds per review)
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % totalReviews);
      }, 5500);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, totalReviews]);

  const activeReview = REVIEWS_DATA[currentIndex];

  return (
    <section
      id="reviews"
      className="py-20 md:py-28 px-5 sm:px-7 md:px-10 bg-[#EEE8DD]/40 border-t border-[#DED7CA] overflow-hidden"
    >
      <div className="max-w-[1200px] mx-auto space-y-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7 }}
          className="text-center space-y-4 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFFFFF] border border-[#DED7CA] text-[#A98946] text-[11px] font-semibold tracking-[0.14em] uppercase font-sans shadow-xs">
            <Star className="w-3.5 h-3.5 text-[#A98946] fill-[#A98946]" />
            <span>VERIFIED CLIENT FEEDBACK</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-[#121212] tracking-tight">
            Client Experiences & Trust
          </h2>

          <p className="text-[#625F58] text-sm sm:text-base leading-relaxed">
            Authentic feedback from property buyers, developers, diaspora owners, and legal advisors who partner with LandsandHousing across Uyo.
          </p>
        </motion.div>

        {/* Carousel / Looping Container */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.8 }}
          className="relative bg-[#FFFFFF] rounded-2xl border border-[#DED7CA] p-5 sm:p-10 md:p-14 shadow-[0_12px_36px_rgba(0,0,0,0.04)] transition-all duration-300 hover:border-[#A98946]/50"
          onMouseEnter={() => setIsPlaying(false)}
          onMouseLeave={() => setIsPlaying(true)}
        >
          {/* Subtle Decorative Background Quote Icon */}
          <Quote className="w-12 h-12 sm:w-16 sm:h-16 text-[#A98946]/10 absolute top-4 left-4 sm:top-8 sm:left-8 pointer-events-none" />

          {/* Active Review Content with AnimatePresence */}
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center space-y-5 sm:space-y-6 min-h-[240px] sm:min-h-[220px] justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeReview.id}
                initial={{ opacity: 0, y: 12, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.99 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="w-full flex flex-col items-center space-y-4 sm:space-y-5"
              >
                {/* Stars & Service Tag */}
                <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
                  <div className="flex items-center gap-1 text-[#A98946]">
                    {[...Array(activeReview.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#A98946] stroke-none" />
                    ))}
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.1em] text-[#625F58] bg-[#F7F4EE] px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-[#DED7CA]">
                    {activeReview.serviceUsed}
                  </span>
                </div>

                {/* Review Quote text with smooth visual transition */}
                <blockquote className="font-serif text-lg sm:text-2xl md:text-3xl font-normal text-[#121212] leading-snug italic px-1 sm:px-6">
                  "{activeReview.review}"
                </blockquote>

                {/* Reviewer Details */}
                <div className="pt-3.5 sm:pt-4 border-t border-[#DED7CA]/70 w-full max-w-md flex flex-col items-center">
                  <span className="font-serif text-base sm:text-lg font-bold text-[#121212]">
                    {activeReview.author}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-[#625F58] mt-0.5">
                    <span>{activeReview.role}</span>
                    <span className="text-[#DED7CA]">·</span>
                    <span>{activeReview.location}</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls: Arrows, Progress Indicators, and Auto-play Toggle */}
          <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-[#DED7CA]/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Verified Google Badge */}
            <div className="flex items-center gap-2 text-xs text-[#625F58]">
              <ShieldCheck className="w-4 h-4 text-[#65715D]" />
              <span>Verified Google Listing: <strong className="text-[#121212]">4.9★ ({BUSINESS_INFO.googleReviewCount} Reviews)</strong></span>
            </div>

            {/* Dot Selectors */}
            <div className="flex items-center gap-2">
              {REVIEWS_DATA.map((rev, idx) => (
                <button
                  key={rev.id}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to review ${idx + 1} by ${rev.author}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentIndex
                      ? 'w-8 bg-[#A98946]'
                      : 'w-2 bg-[#DED7CA] hover:bg-[#A98946]/50'
                  }`}
                />
              ))}
            </div>

            {/* Control Buttons */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsPlaying(!isPlaying)}
                title={isPlaying ? 'Pause auto-rotation' : 'Play auto-rotation'}
                aria-label={isPlaying ? 'Pause reviews loop' : 'Resume reviews loop'}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#DED7CA] bg-[#FFFFFF] hover:border-[#A98946] text-[#121212] flex items-center justify-center transition-all cursor-pointer shadow-xs"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 text-[#625F58]" /> : <Play className="w-3.5 h-3.5 text-[#A98946]" />}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={prevReview}
                aria-label="Previous review"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#DED7CA] bg-[#FFFFFF] hover:border-[#A98946] text-[#121212] flex items-center justify-center transition-all cursor-pointer shadow-xs"
              >
                <ChevronLeft className="w-4 h-4 text-[#121212]" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextReview}
                aria-label="Next review"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#DED7CA] bg-[#FFFFFF] hover:border-[#A98946] text-[#121212] flex items-center justify-center transition-all cursor-pointer shadow-xs"
              >
                <ChevronRight className="w-4 h-4 text-[#121212]" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Micro-Reviews Grid Preview / Quick Scannable Mobile Swipe Ribbon */}
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-5 overflow-x-auto sm:overflow-visible gap-2.5 sm:gap-3 pb-2 sm:pb-0 scrollbar-none pt-2">
          {REVIEWS_DATA.map((item, idx) => (
            <motion.button
              key={item.id}
              onClick={() => setCurrentIndex(idx)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              className={`min-w-[220px] sm:min-w-0 flex-1 shrink-0 sm:shrink p-3.5 sm:p-4 rounded-xl border text-left transition-all cursor-pointer ${
                idx === currentIndex
                  ? 'bg-[#FFFFFF] border-[#A98946] shadow-sm'
                  : 'bg-[#FFFFFF]/60 border-[#DED7CA]/70 hover:bg-[#FFFFFF] hover:border-[#A98946]/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex text-[#A98946]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-[#A98946] stroke-none" />
                  ))}
                </div>
                <span className="text-[9px] uppercase font-semibold tracking-wider text-[#A98946]">
                  Review {idx + 1}
                </span>
              </div>
              <p className="font-serif text-xs font-semibold text-[#121212] truncate">
                {item.author}
              </p>
              <p className="text-[11px] text-[#625F58] line-clamp-2 mt-1 leading-snug">
                "{item.review}"
              </p>
            </motion.button>
          ))}
        </div>

        {/* Link Out to Google Maps Listing */}
        <div className="flex justify-center pt-2">
          <motion.a
            href="https://www.google.com/maps/search/?api=1&query=LandsandHousing+181+Aka+Rd+Uyo+Akwa+Ibom+Nigeria"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#121212] hover:text-[#A98946] transition-colors py-2.5 px-6 rounded-full border border-[#121212] bg-[#FFFFFF] hover:border-[#A98946] shadow-xs cursor-pointer"
          >
            <span>Read All Verified Reviews on Google Maps</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </motion.a>
        </div>
      </div>
    </section>
  );
};

