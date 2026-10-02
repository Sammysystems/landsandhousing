import React, { useState } from 'react';
import { X, MapPin, Bed, Bath, Maximize2, Check, Phone, MessageCircle, Send, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Property } from '../types';
import { BUSINESS_INFO } from '../data/mockData';

interface PropertyDetailModalProps {
  property: Property | null;
  onClose: () => void;
  onOpenAdvisorModal: (propertyTitle: string) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  onOpenAdvisorModal,
}) => {
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryType, setInquiryType] = useState('Schedule Physical Viewing');
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  if (!property) return null;

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || !inquiryPhone) return;
    setInquirySubmitted(true);
    setTimeout(() => {
      // Allow user to see confirmation
    }, 4000);
  };

  return (
    <div
      id="property-detail-modal"
      className="fixed inset-0 z-50 bg-[#171716]/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#F7F4EE] rounded-3xl border border-[#DED7CA] max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-property-modal-btn"
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FFFFFF]/90 backdrop-blur-xs border border-[#DED7CA] flex items-center justify-center text-[#171716] hover:bg-[#EEE8DD] transition-colors"
          aria-label="Close property detail"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gallery Image Display */}
        <div className="relative aspect-[16/10] sm:aspect-[21/9] bg-[#EEE8DD] overflow-hidden">
          <img
            src={property.galleryImages[selectedImage] || property.imageUrl}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#171716]/60 via-transparent to-transparent" />
          
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-wrap gap-1.5 sm:gap-2">
            <span className="bg-[#171716]/90 text-[#F7F4EE] text-[10px] sm:text-xs font-semibold uppercase tracking-wider px-2.5 sm:px-3 py-1 rounded-full">
              {property.type}
            </span>
            <span className="bg-[#B18A4A] text-[#F7F4EE] text-[10px] sm:text-xs font-semibold uppercase tracking-wider px-2.5 sm:px-3 py-1 rounded-full">
              {property.purpose}
            </span>
            <span className="bg-[#65715D] text-[#F7F4EE] text-[10px] sm:text-xs font-semibold uppercase tracking-wider px-2.5 sm:px-3 py-1 rounded-full">
              {property.status}
            </span>
          </div>

          {/* Thumbnail Selector */}
          {property.galleryImages.length > 1 && (
            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 flex gap-1.5 sm:gap-2 overflow-x-auto max-w-[80%] pb-1 scrollbar-none">
              {property.galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-11 h-7 sm:w-12 sm:h-8 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === idx ? 'border-[#B18A4A] scale-105' : 'border-[#FFFFFF]/80 opacity-70'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Container */}
        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
          {/* Header Info */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 sm:gap-6 pb-5 sm:pb-6 border-b border-[#DED7CA]">
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-[#625F58] font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#B18A4A]" />
                <span>{property.location}</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-[#171716] leading-tight">
                {property.title}
              </h2>
              <div className="text-xs text-[#65715D] font-medium flex items-center gap-1.5 pt-1">
                <ShieldCheck className="w-4 h-4 text-[#B18A4A] shrink-0" />
                <span>Title & Document Scrutiny Verified by LandsandHousing Advisory</span>
              </div>
            </div>

            <div className="bg-[#FFFFFF] p-3.5 sm:p-5 rounded-2xl border border-[#DED7CA] shrink-0 text-left md:text-right">
              <span className="text-[10px] uppercase letter-luxury text-[#625F58] block font-medium">
                Guide Price / Valuation
              </span>
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#B18A4A] block mt-0.5">
                {property.priceFormatted}
              </span>
              <span className="text-[11px] text-[#625F58] mt-1 block">
                Transactional terms negotiable upon formal inquiry
              </span>
            </div>
          </div>

          {/* Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 bg-[#FFFFFF] p-3.5 sm:p-4 rounded-2xl border border-[#DED7CA]">
            <div>
              <span className="text-[10px] text-[#625F58] uppercase letter-luxury block">Property Class</span>
              <span className="text-sm font-semibold text-[#171716] block mt-1">{property.type}</span>
            </div>
            {property.beds && (
              <div>
                <span className="text-[10px] text-[#625F58] uppercase letter-luxury block">Bedrooms</span>
                <span className="text-sm font-semibold text-[#171716] block mt-1">{property.beds} Luxury En-suites</span>
              </div>
            )}
            {property.sizeSqFt && (
              <div>
                <span className="text-[10px] text-[#625F58] uppercase letter-luxury block">Built Area</span>
                <span className="text-sm font-semibold text-[#171716] block mt-1">{property.sizeSqFt}</span>
              </div>
            )}
            {property.plotSize && (
              <div>
                <span className="text-[10px] text-[#625F58] uppercase letter-luxury block">Parcel Size</span>
                <span className="text-sm font-semibold text-[#171716] block mt-1">{property.plotSize}</span>
              </div>
            )}
          </div>

          {/* Description & Key Deliverables */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h3 className="font-serif text-xl font-semibold text-[#171716] mb-3">
                  Advisory Overview
                </h3>
                <p className="text-sm sm:text-base text-[#625F58] leading-relaxed font-sans-ui">
                  {property.description}
                </p>
              </div>

              <div>
                <h3 className="font-serif text-lg font-semibold text-[#171716] mb-3">
                  Key Property Highlights
                </h3>
                <ul className="space-y-2.5">
                  {property.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#625F58]">
                      <Check className="w-4 h-4 text-[#65715D] shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Inquire / Viewing Booking Form */}
            <div className="lg:col-span-5 bg-[#FFFFFF] p-6 rounded-2xl border border-[#DED7CA] space-y-4">
              <h3 className="font-serif text-lg font-semibold text-[#171716]">
                Direct Inquiries & Viewing
              </h3>
              <p className="text-xs text-[#625F58]">
                Contact our Uyo advisory desk to request documented survey records, arrange private inspection, or register interest.
              </p>

              {inquirySubmitted ? (
                <div className="bg-[#EEE8DD] p-5 rounded-xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-[#65715D] mx-auto" />
                  <div className="font-serif text-lg font-semibold text-[#171716]">
                    Inquiry Received
                  </div>
                  <p className="text-xs text-[#625F58]">
                    A LandsandHousing advisor will contact you at <strong>{inquiryPhone}</strong> shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-[#625F58] uppercase letter-luxury mb-1">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      placeholder="e.g. Arc. Nsikak Bassey"
                      className="w-full bg-[#F7F4EE] border border-[#DED7CA] rounded-xl px-3.5 py-2.5 text-sm text-[#171716] focus:outline-none focus:border-[#B18A4A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-[#625F58] uppercase letter-luxury mb-1">
                      Phone / WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={inquiryPhone}
                      onChange={(e) => setInquiryPhone(e.target.value)}
                      placeholder="080... or +234..."
                      className="w-full bg-[#F7F4EE] border border-[#DED7CA] rounded-xl px-3.5 py-2.5 text-sm text-[#171716] focus:outline-none focus:border-[#B18A4A]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-[#625F58] uppercase letter-luxury mb-1">
                      Request Type
                    </label>
                    <select
                      value={inquiryType}
                      onChange={(e) => setInquiryType(e.target.value)}
                      className="w-full bg-[#F7F4EE] border border-[#DED7CA] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#171716] focus:outline-none focus:border-[#B18A4A]"
                    >
                      <option value="Schedule Physical Viewing">Schedule Physical Viewing</option>
                      <option value="Request Title Documents & Survey">Request Title Documents & Survey</option>
                      <option value="Make an Offer / Term Negotiation">Make an Offer / Term Negotiation</option>
                      <option value="Commercial Leasing Inquiry">Commercial Leasing Inquiry</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full gold-gradient gold-gradient-hover text-[#FFFFFF] py-3 rounded-full text-xs font-semibold uppercase letter-luxury transition-all duration-300 flex items-center justify-center gap-2 mt-2 shadow-md cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-[#FFFFFF]" />
                    <span>Submit Inquiry</span>
                  </button>
                </form>
              )}

              {/* Fast Direct Links */}
              <div className="pt-2 border-t border-[#DED7CA]/70 flex items-center justify-between text-xs">
                <a
                  href={`tel:${BUSINESS_INFO.phoneClean}`}
                  className="flex items-center gap-1.5 font-medium text-[#171716] hover:text-[#B18A4A]"
                >
                  <Phone className="w-3.5 h-3.5 text-[#B18A4A]" />
                  <span>0805 632 1856</span>
                </a>

                <a
                  href={`https://wa.me/2348056321856?text=${encodeURIComponent(`Hello LandsandHousing, I am inquiring about: ${property.title} (${property.location})`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 font-medium text-[#65715D] hover:underline"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Desk</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
