import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { TrustStrip } from './components/TrustStrip';
import { FeaturedProperties } from './components/FeaturedProperties';
import { DiscoverLocations } from './components/DiscoverLocations';
import { ServicesSection } from './components/ServicesSection';
import { WhyChooseUs } from './components/WhyChooseUs';
import { EditorialFeature } from './components/EditorialFeature';
import { ReviewsSection } from './components/ReviewsSection';
import { PropertyOwnerCTA } from './components/PropertyOwnerCTA';
import { MarketInsights } from './components/MarketInsights';
import { ContactLocation } from './components/ContactLocation';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { RevealOnScroll } from './components/RevealOnScroll';

import { PropertyDetailModal } from './components/PropertyDetailModal';
import { AdvisorModal } from './components/AdvisorModal';
import { ListPropertyModal } from './components/ListPropertyModal';
import { InsightModal } from './components/InsightModal';

import { PROPERTIES_DATA, BUSINESS_INFO } from './data/mockData';
import { Property, LocationDestination, MarketInsight } from './types';
import { Phone, ArrowUp } from 'lucide-react';

export default function App() {
  const [propertiesList, setPropertiesList] = useState<Property[]>(PROPERTIES_DATA);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<MarketInsight | null>(null);
  const [advisorModalOpen, setAdvisorModalOpen] = useState<boolean>(false);
  const [advisorInitialTopic, setAdvisorInitialTopic] = useState<string>('Property Acquisition / Buying in Uyo');
  const [listPropertyModalOpen, setListPropertyModalOpen] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Search handler from Hero
  const handleHeroSearch = (filters: {
    location: string;
    type: string;
    purpose: string;
    budget: string;
  }) => {
    let filtered = [...PROPERTIES_DATA];

    if (filters.location && filters.location !== 'All Locations in Uyo') {
      const query = filters.location.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.location.toLowerCase().includes(query) ||
          p.zone.toLowerCase().includes(query)
      );
    }

    if (filters.type && filters.type !== 'All Property Types') {
      if (filters.type.includes('Commercial')) {
        filtered = filtered.filter((p) => p.type === 'Commercial' || p.type === 'Mixed-Use');
      } else if (filters.type.includes('Residential') || filters.type.includes('House')) {
        filtered = filtered.filter((p) => p.type === 'Residential');
      } else if (filters.type.includes('Land')) {
        filtered = filtered.filter((p) => p.type === 'Land');
      }
    }

    if (filters.purpose) {
      if (filters.purpose === 'Buy' || filters.purpose === 'Invest') {
        filtered = filtered.filter((p) => p.purpose === 'Sale' || p.purpose === 'Invest');
      } else if (filters.purpose === 'Rent') {
        filtered = filtered.filter((p) => p.purpose === 'Rent');
      } else if (filters.purpose === 'Commercial') {
        filtered = filtered.filter((p) => p.type === 'Commercial' || p.type === 'Mixed-Use');
      }
    }

    setPropertiesList(filtered.length > 0 ? filtered : PROPERTIES_DATA);
  };

  const handleOpenAdvisor = (topic?: string) => {
    if (topic) {
      setAdvisorInitialTopic(topic);
    } else {
      setAdvisorInitialTopic('Property Acquisition / Buying in Uyo');
    }
    setAdvisorModalOpen(true);
  };

  const handleSelectLocation = (loc: LocationDestination) => {
    const matched = PROPERTIES_DATA.filter(
      (p) =>
        p.location.toLowerCase().includes(loc.name.toLowerCase()) ||
        p.zone.toLowerCase().includes(loc.name.toLowerCase()) ||
        loc.name.toLowerCase().includes(p.zone.toLowerCase())
    );
    setPropertiesList(matched.length > 0 ? matched : PROPERTIES_DATA);

    const propEl = document.getElementById('properties');
    if (propEl) {
      propEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreProperties = () => {
    const propEl = document.getElementById('properties');
    if (propEl) {
      propEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Primary editorial highlight property
  const editorialFeaturedProp =
    PROPERTIES_DATA.find((p) => p.editorialHighlight) || PROPERTIES_DATA[0];

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#171716] flex flex-col overflow-x-hidden w-full">
      {/* Top Refined Sticky Header */}
      <Navbar
        onOpenAdvisorModal={handleOpenAdvisor}
        onOpenListPropertyModal={() => setListPropertyModalOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="flex-1 overflow-x-hidden">
        {/* 1. Cinematic Luxury Property Hero with Integrated Search */}
        <HeroSection
          onSearch={handleHeroSearch}
          onExploreClick={handleExploreProperties}
          onOpenAdvisorModal={handleOpenAdvisor}
        />

        {/* 2. Restrained Trust / Credibility Strip */}
        <RevealOnScroll direction="up" delay={0.1} distance={24}>
          <TrustStrip />
        </RevealOnScroll>

        {/* 3. Featured Properties (Selected Properties - Asymmetrical Layout) */}
        <RevealOnScroll direction="up" delay={0.15} distance={36}>
          <FeaturedProperties
            properties={propertiesList}
            onSelectProperty={(prop) => setSelectedProperty(prop)}
          />
        </RevealOnScroll>

        {/* 4. Discover by Location (Travel-Editorial Destination Cards) */}
        <RevealOnScroll direction="up" delay={0.15} distance={36}>
          <DiscoverLocations onSelectLocation={handleSelectLocation} />
        </RevealOnScroll>

        {/* 5. Services Section (Editorial Composition for 4 Key Offerings) */}
        <RevealOnScroll direction="up" delay={0.15} distance={36}>
          <ServicesSection onOpenAdvisorModal={handleOpenAdvisor} />
        </RevealOnScroll>

        {/* 6. Why LandsandHousing (4 Concise Trust Principles) */}
        <RevealOnScroll direction="up" delay={0.15} distance={36}>
          <WhyChooseUs />
        </RevealOnScroll>

        {/* 7. Editorial Property Feature (Magazine Feature Spread) */}
        <RevealOnScroll direction="up" delay={0.15} distance={36}>
          <EditorialFeature
            featuredProperty={editorialFeaturedProp}
            onSelectProperty={(prop) => setSelectedProperty(prop)}
          />
        </RevealOnScroll>

        {/* 8. Google Reviews Proof (Authentic 4.9★, 19 Reviews, Exact Official Quote) */}
        <RevealOnScroll direction="up" delay={0.15} distance={36}>
          <ReviewsSection />
        </RevealOnScroll>

        {/* 9. Property Owner / Seller CTA */}
        <RevealOnScroll direction="up" delay={0.15} distance={36}>
          <PropertyOwnerCTA
            onOpenListModal={() => setListPropertyModalOpen(true)}
            onOpenAdvisorModal={handleOpenAdvisor}
          />
        </RevealOnScroll>

        {/* 10. Market Insights & Editorial Briefs */}
        <RevealOnScroll direction="up" delay={0.15} distance={36}>
          <MarketInsights onSelectInsight={(item) => setSelectedInsight(item)} />
        </RevealOnScroll>

        {/* 11. High-Trust Contact & Physical Location (181 Aka Rd, Uyo) */}
        <RevealOnScroll direction="up" delay={0.15} distance={36}>
          <ContactLocation />
        </RevealOnScroll>

        {/* 12. Final Conversion CTA (Magazine Closing Spread) */}
        <RevealOnScroll direction="up" delay={0.15} distance={36}>
          <FinalCTA
            onOpenAdvisorModal={() => handleOpenAdvisor('General Advisory')}
            onExploreProperties={handleExploreProperties}
          />
        </RevealOnScroll>
      </main>

      {/* Spacious Editorial Footer */}
      <Footer
        onOpenListPropertyModal={() => setListPropertyModalOpen(true)}
        onOpenAdvisorModal={handleOpenAdvisor}
      />

      {/* Floating Quick Action Controls */}
      <aside aria-label="Quick Action Controls" className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2">
        {showScrollTop && (
          <button
            id="scroll-to-top-btn"
            onClick={scrollToTop}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FFFFFF] border border-[#DED7CA] text-[#171716] hover:border-[#A98946] hover:text-[#A98946] shadow-md flex items-center justify-center transition-all cursor-pointer"
            title="Scroll to top"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}

        <a
          id="floating-whatsapp-btn"
          href={`https://wa.me/${BUSINESS_INFO.whatsappClean}?text=Hello%20LandsandHousing,%20I%20am%20interested%20in%20property%20advisory%20in%20Uyo.`}
          target="_blank"
          rel="noopener noreferrer"
          className="gold-gradient gold-gradient-hover text-[#FFFFFF] px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded-full shadow-xl flex items-center gap-2 text-xs font-semibold uppercase letter-luxury transition-all border border-[#FFFFFF]/25 hover:scale-105"
          title="Direct WhatsApp Advisory"
        >
          <Phone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">0805 632 1856</span>
          <span className="sm:hidden font-sans font-bold">WhatsApp</span>
        </a>
      </aside>

      {/* Modals & Dialogs */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onOpenAdvisorModal={(title) => {
            setSelectedProperty(null);
            handleOpenAdvisor(`Inquiry on ${title}`);
          }}
        />
      )}

      <AdvisorModal
        isOpen={advisorModalOpen}
        onClose={() => setAdvisorModalOpen(false)}
        initialTopic={advisorInitialTopic}
      />

      <ListPropertyModal
        isOpen={listPropertyModalOpen}
        onClose={() => setListPropertyModalOpen(false)}
      />

      {selectedInsight && (
        <InsightModal
          insight={selectedInsight}
          onClose={() => setSelectedInsight(null)}
        />
      )}
    </div>
  );
}
