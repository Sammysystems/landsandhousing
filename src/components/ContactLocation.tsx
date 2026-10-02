import React from 'react';
import { Phone, MapPin, Clock, Navigation, ArrowUpRight, MessageCircle } from 'lucide-react';
import { BUSINESS_INFO } from '../data/mockData';

export const ContactLocation: React.FC = () => {
  return (
    <section
      id="contact"
      className="py-20 md:py-28 px-5 sm:px-7 md:px-10 bg-[#EEE8DD]/40 border-t border-[#DED7CA]"
    >
      <div className="max-w-[1280px] mx-auto">
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#DED7CA] overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          {/* Left: Contact Credentials (Col 1-5) */}
          <div className="lg:col-span-5 p-5 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6 sm:space-y-8 border-b lg:border-b-0 lg:border-r border-[#DED7CA]">
            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-semibold text-[#B18A4A] letter-luxury uppercase font-sans-ui block mb-2">
                  DIRECT ADVISORY & VISITS
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#171716] leading-tight">
                  LandsandHousing
                </h2>
                <p className="text-sm text-[#625F58] mt-2 font-sans-ui">
                  Commercial & Residential Real Estate Advisory
                </p>
              </div>

              {/* Detail Blocks */}
              <div className="space-y-5 pt-2">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#F7F4EE] border border-[#DED7CA] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-[#B18A4A]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase letter-luxury text-[#625F58] block">
                      Physical Office Address
                    </span>
                    <span className="text-sm sm:text-base font-medium text-[#171716] block mt-0.5">
                      {BUSINESS_INFO.address}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#F7F4EE] border border-[#DED7CA] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-[#B18A4A]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase letter-luxury text-[#625F58] block">
                      Direct Telephone Line
                    </span>
                    <a
                      href={`tel:${BUSINESS_INFO.phoneClean}`}
                      className="text-base sm:text-lg font-serif font-bold text-[#171716] hover:text-[#B18A4A] transition-colors block mt-0.5"
                    >
                      {BUSINESS_INFO.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#F7F4EE] border border-[#DED7CA] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-[#65715D]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase letter-luxury text-[#625F58] block">
                      Business Hours
                    </span>
                    <span className="text-sm font-medium text-[#171716] block mt-0.5">
                      {BUSINESS_INFO.operatingHours} · Continuous Client Support
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-4 border-t border-[#DED7CA] flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <a
                id="contact-call-btn"
                href={`tel:${BUSINESS_INFO.phoneClean}`}
                className="flex-1 gold-gradient gold-gradient-hover text-[#FFFFFF] py-3.5 px-5 rounded-full text-xs font-semibold uppercase letter-luxury transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#B18A4A33]"
              >
                <Phone className="w-4 h-4" />
                <span>Call LandsandHousing</span>
              </a>

              <a
                id="contact-directions-btn"
                href="https://www.google.com/maps/search/?api=1&query=181+Aka+Rd+Uyo+Akwa+Ibom+Nigeria"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#FFFFFF] hover:bg-[#F7F4EE] text-[#171716] border border-[#171716] py-3.5 px-5 rounded-full text-xs font-semibold uppercase letter-luxury transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4 text-[#625F58]" />
                <span>Get Directions</span>
              </a>
            </div>
          </div>

          {/* Right: Restrained Map / Location Visualization (Col 6-12) */}
          <div className="lg:col-span-7 relative min-h-[340px] lg:min-h-full bg-[#EEE8DD] p-4 sm:p-8 flex flex-col justify-between">
            {/* Stylized Architectural Map Background */}
            <div className="absolute inset-0 overflow-hidden opacity-30">
              <div className="w-full h-full bg-[radial-gradient(#171716_1px,transparent_1px)] [background-size:16px_16px]" />
            </div>

            {/* Map Card Mock with Live Coordinate Details */}
            <div className="relative z-10 bg-[#FFFFFF]/95 backdrop-blur-xs rounded-xl border border-[#DED7CA] p-4 sm:p-6 shadow-sm max-w-md">
              <div className="flex items-center justify-between pb-3 border-b border-[#DED7CA]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#B18A4A] animate-pulse" />
                  <span className="font-editorial text-lg font-semibold text-[#171716]">
                    181 Aka Road, Uyo
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-[#65715D] uppercase tracking-wider bg-[#EEE8DD] px-2 py-0.5 rounded-sm">
                  Active Agency
                </span>
              </div>

              <p className="text-xs text-[#625F58] mt-3 leading-relaxed">
                Situated along the central Aka Road commercial artery connecting Uyo’s major business districts, banking halls, and prime residential developments.
              </p>

              <div className="mt-4 pt-3 border-t border-[#DED7CA]/60 flex items-center justify-between text-xs text-[#625F58]">
                <span>State: Akwa Ibom</span>
                <span>Postal: 520001</span>
                <span>Country: Nigeria</span>
              </div>
            </div>

            {/* Visual Route Indicator Bottom */}
            <div className="relative z-10 pt-6">
              <div className="bg-[#FFFFFF]/90 backdrop-blur-xs rounded-xl border border-[#DED7CA] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[#171716] font-medium block">
                    Visiting Our Uyo Office
                  </span>
                  <span className="text-[#625F58]">
                    In-person advisory consultations available 24/7 by appointment or walk-in.
                  </span>
                </div>
                <a
                  href={`https://wa.me/2348056321856?text=${encodeURIComponent('Hello LandsandHousing, I would like to inquire about real estate advisory in Uyo.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#65715D] text-[#FFFFFF] px-4 py-2 rounded-full font-medium flex items-center gap-1.5 shrink-0 hover:bg-[#525d4a] transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Message</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
