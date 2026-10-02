import React, { useState, useEffect } from 'react';
import { Phone, Menu, X, ArrowUpRight } from 'lucide-react';
import { BUSINESS_INFO } from '../data/mockData';

interface NavbarProps {
  onOpenAdvisorModal: (initialInterest?: string) => void;
  onOpenListPropertyModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAdvisorModal,
  onOpenListPropertyModal,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Properties', href: '#properties' },
    { name: 'Locations', href: '#locations' },
    { name: 'Services', href: '#services' },
    { name: 'About', href: '#advisory' },
  ];

  return (
    <>
      <header
        id="main-header"
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#F7F4EE]/98 backdrop-blur-md border-b border-[#DED7CA] py-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
            : 'bg-[#F7F4EE] py-3.5 sm:py-5 border-b border-[#DED7CA]/70'
        }`}
      >
        <div className="max-w-[1360px] mx-auto px-4 sm:px-8 md:px-12 flex items-center justify-between gap-4 sm:gap-8">
          {/* Logo / Brand Name */}
          <a
            href="#"
            id="brand-logo-link"
            className="flex items-center gap-3 group shrink-0"
          >
            <div className="flex flex-col justify-center">
              <span className="font-serif text-lg sm:text-2xl font-bold tracking-tight text-[#121212] leading-tight uppercase">
                LANDSANDHOUSING
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-[0.14em] uppercase font-sans text-[#625F58] font-medium leading-none mt-0.5 sm:mt-1">
                Real Estate Advisory · Uyo
              </span>
            </div>
          </a>

          {/* Center Navigation Links (Desktop) */}
          <nav
            id="desktop-navigation"
            aria-label="Main Navigation"
            className="hidden md:flex items-center space-x-8 lg:space-x-10"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-[12px] font-medium uppercase tracking-[0.12em] text-[#121212] hover:text-[#A98946] transition-colors relative py-1 whitespace-nowrap"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Actions (Desktop) */}
          <div className="hidden lg:flex items-center space-x-6 shrink-0">
            <button
              id="nav-list-property-btn"
              onClick={onOpenListPropertyModal}
              className="text-[12px] font-medium uppercase tracking-[0.12em] text-[#121212] hover:text-[#A98946] transition-colors cursor-pointer whitespace-nowrap"
            >
              List a Property
            </button>

            <button
              id="nav-advisor-cta-btn"
              onClick={() => onOpenAdvisorModal()}
              className="bg-[#A98946] hover:bg-[#95773B] text-[#FFFFFF] px-6 py-3 rounded-full text-[12px] font-medium uppercase tracking-[0.12em] transition-all duration-200 cursor-pointer whitespace-nowrap"
            >
              Speak With an Advisor
            </button>
          </div>

          {/* Mobile Menu Trigger & Phone button */}
          <div className="flex items-center gap-2 md:hidden">
            <a
              id="mobile-quick-call-btn"
              href={`tel:${BUSINESS_INFO.phoneClean}`}
              className="w-10 h-10 rounded-full border border-[#DED7CA] bg-[#FFFFFF] flex items-center justify-center text-[#121212] hover:border-[#A98946] shadow-xs"
              title="Call LandsandHousing"
              aria-label="Call LandsandHousing"
            >
              <Phone className="w-4 h-4 text-[#A98946]" />
            </a>

            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 rounded-full border border-[#DED7CA] bg-[#FFFFFF] flex items-center justify-center text-[#121212] shadow-xs"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className="fixed inset-0 z-50 bg-[#171716]/60 backdrop-blur-sm lg:hidden flex flex-col justify-end"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="bg-[#F7F4EE] rounded-t-3xl border-t border-[#DED7CA] p-6 max-h-[85vh] overflow-y-auto space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#DED7CA]">
              <div className="flex flex-col">
                <span className="font-serif text-xl font-bold tracking-tight text-[#171716] uppercase">
                  LANDSANDHOUSING
                </span>
                <span className="text-[10px] text-[#625F58] letter-luxury uppercase font-sans-ui mt-0.5">
                  181 Aka Rd, Uyo · 0805 632 1856
                </span>
              </div>
              <button
                id="close-mobile-menu-btn"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full hover:bg-[#EEE8DD] cursor-pointer"
              >
                <X className="w-5 h-5 text-[#171716]" />
              </button>
            </div>

            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-serif text-2xl text-[#171716] hover:text-[#B18A4A] py-2 border-b border-[#DED7CA]/50 flex items-center justify-between transition-colors"
                >
                  <span>{link.name}</span>
                  <ArrowUpRight className="w-4 h-4 text-[#B18A4A]" />
                </a>
              ))}
            </nav>

            <div className="pt-2 space-y-3">
              <button
                id="mobile-drawer-advisor-cta"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdvisorModal();
                }}
                className="w-full bg-[#A98946] hover:bg-[#95773B] text-[#FFFFFF] py-3.5 rounded-full text-xs font-medium uppercase tracking-[0.12em] transition-colors text-center block cursor-pointer"
              >
                Speak With an Advisor
              </button>

              <button
                id="mobile-drawer-list-btn"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenListPropertyModal();
                }}
                className="w-full bg-[#FFFFFF] border border-[#121212] text-[#121212] py-3.5 rounded-full text-xs font-medium uppercase tracking-[0.12em] transition-colors text-center block cursor-pointer"
              >
                List a Property
              </button>

              <div className="pt-2 flex items-center justify-between text-xs text-[#625F58] bg-[#EEE8DD]/60 p-3.5 rounded-xl">
                <span>Google Rating: <strong className="text-[#121212]">4.9★ (19 Reviews)</strong></span>
                <span className="text-[#625F58]">Uyo, Akwa Ibom</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
