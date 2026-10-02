import React from 'react';
import { Star, ShieldCheck, MapPin, Phone, Clock, ArrowUp } from 'lucide-react';
import { BUSINESS_INFO } from '../data/mockData';

interface FooterProps {
  onOpenListPropertyModal: () => void;
  onOpenAdvisorModal: (topic?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenListPropertyModal,
  onOpenAdvisorModal,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      id="site-footer"
      className="bg-[#171716] text-[#F7F4EE] pt-16 pb-12 px-5 sm:px-7 md:px-10 border-t border-[#DED7CA]/20"
    >
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-[#DED7CA]/20">
          {/* Col 1-5: Brand identity & verified credentials */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FFFFFF] flex items-center justify-center text-[#171716]">
                <span className="font-serif text-xl font-bold text-[#B18A4A]">L</span>
              </div>
              <div>
                <span className="font-serif text-2xl font-semibold tracking-tight text-[#FFFFFF] block">
                  LandsandHousing
                </span>
                <span className="text-[10px] letter-luxury uppercase text-[#DED7CA]/80">
                  Commercial & Residential Real Estate Advisory
                </span>
              </div>
            </div>

            <p className="text-sm text-[#DED7CA]/80 max-w-md font-sans-ui leading-relaxed">
              A trusted property advisory helping buyers, investors, property owners, and businesses make confident real estate decisions in Uyo and the wider Akwa Ibom market.
            </p>

            <div className="bg-[#FFFFFF]/5 border border-[#DED7CA]/20 rounded-xl p-4 inline-flex items-center gap-3">
              <div className="flex text-[#B18A4A]">
                <Star className="w-4 h-4 fill-[#B18A4A]" />
              </div>
              <div className="text-xs">
                <strong className="text-[#FFFFFF] block">4.9 / 5.0 on Google</strong>
                <span className="text-[#DED7CA]/70">19 Verified Client Reviews</span>
              </div>
            </div>
          </div>

          {/* Col 6-8: Navigation & Services */}
          <div className="lg:col-span-3 space-y-4">
            <span className="text-[11px] uppercase letter-luxury font-semibold text-[#B18A4A] block">
              Discovery & Services
            </span>
            <ul className="space-y-2.5 text-sm text-[#DED7CA]/80">
              <li>
                <a href="#properties" className="hover:text-[#B18A4A] transition-colors">
                  Selected Properties
                </a>
              </li>
              <li>
                <a href="#locations" className="hover:text-[#B18A4A] transition-colors">
                  Locations in Uyo
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#B18A4A] transition-colors">
                  Property Sales & Costing
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#B18A4A] transition-colors">
                  Property Management
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-[#B18A4A] transition-colors">
                  Training of Marketers
                </a>
              </li>
              <li>
                <a href="#insights" className="hover:text-[#B18A4A] transition-colors">
                  Market Insights
                </a>
              </li>
            </ul>
          </div>

          {/* Col 9-12: Contact & Office Location */}
          <div className="lg:col-span-4 space-y-4">
            <span className="text-[11px] uppercase letter-luxury font-semibold text-[#B18A4A] block">
              Office & Direct Inquiries
            </span>
            
            <div className="space-y-3 text-sm text-[#DED7CA]/80">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#B18A4A] shrink-0 mt-0.5" />
                <span>{BUSINESS_INFO.address}</span>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#B18A4A] shrink-0 mt-0.5" />
                <a
                  href={`tel:${BUSINESS_INFO.phoneClean}`}
                  className="hover:text-[#B18A4A] font-semibold text-[#FFFFFF] transition-colors"
                >
                  {BUSINESS_INFO.phone}
                </a>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#65715D] shrink-0 mt-0.5" />
                <span>Operating Hours: {BUSINESS_INFO.operatingHours}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5 sm:gap-2">
              <button
                id="footer-list-btn"
                onClick={onOpenListPropertyModal}
                className="w-full sm:w-auto text-xs uppercase letter-luxury bg-[#FFFFFF]/10 hover:bg-[#FFFFFF]/20 text-[#FFFFFF] py-3 sm:py-2.5 px-4 rounded-full transition-colors text-center sm:text-left cursor-pointer border border-[#FFFFFF]/15"
              >
                List a Property →
              </button>
              <button
                id="footer-advisor-btn"
                onClick={() => onOpenAdvisorModal()}
                className="w-full sm:w-auto text-xs uppercase letter-luxury gold-gradient text-[#FFFFFF] font-semibold py-3 sm:py-2.5 px-4 rounded-full hover:opacity-90 transition-opacity text-center sm:text-left cursor-pointer"
              >
                Speak With an Advisor →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright & back to top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#DED7CA]/60">
          <div>
            © {new Date().getFullYear()} LandsandHousing. All rights reserved. 181 Aka Rd, Uyo 520001, Akwa Ibom, Nigeria.
          </div>

          <button
            id="back-to-top-btn"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 hover:text-[#FFFFFF] transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
