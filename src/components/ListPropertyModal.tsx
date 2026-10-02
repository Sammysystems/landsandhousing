import React, { useState } from 'react';
import { X, Building, CheckCircle2, ShieldCheck, Upload, Send } from 'lucide-react';
import { BUSINESS_INFO } from '../data/mockData';

interface ListPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ListPropertyModal: React.FC<ListPropertyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [propertyType, setPropertyType] = useState('Commercial Building');
  const [propertyLocation, setPropertyLocation] = useState('Aka Road Corridor');
  const [purpose, setPurpose] = useState('Outright Sale');
  const [askingPrice, setAskingPrice] = useState('');
  const [titleType, setTitleType] = useState('Certificate of Occupancy (C of O)');
  const [propertyNotes, setPropertyNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName || !ownerPhone) return;
    setIsSubmitted(true);
  };

  return (
    <div
      id="list-property-modal"
      className="fixed inset-0 z-50 bg-[#171716]/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#F7F4EE] rounded-3xl border border-[#DED7CA] max-w-2xl w-full p-6 sm:p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="close-list-modal-btn"
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#FFFFFF] border border-[#DED7CA] flex items-center justify-center text-[#171716] hover:bg-[#EEE8DD] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#EEE8DD] border border-[#DED7CA] flex items-center justify-center mx-auto text-[#65715D]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#171716]">
              Property Submitted for Advisory Review
            </h3>
            <p className="text-sm text-[#625F58] max-w-md mx-auto leading-relaxed">
              Thank you, {ownerName}. Our Uyo property team will review your property details and contact you at <strong>{ownerPhone}</strong> to schedule physical verification and valuation onboarding.
            </p>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="bg-[#171716] text-[#F7F4EE] px-8 py-3 rounded-full text-xs font-medium uppercase tracking-wider"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] text-[#65715D] font-semibold uppercase letter-luxury mb-2">
                <ShieldCheck className="w-4 h-4 text-[#B18A4A]" />
                <span>OWNER & DEVELOPER REGISTRATION</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#171716] leading-tight">
                List a Property for Sale or Management
              </h2>
              <p className="text-xs sm:text-sm text-[#625F58] mt-1 font-sans-ui">
                Present your asset to verified commercial buyers and discerning private investors across Uyo and Nigeria.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-[#625F58] uppercase letter-luxury mb-1">
                    Owner / Representative Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-[#FFFFFF] border border-[#DED7CA] rounded-xl px-3.5 py-2.5 text-sm text-[#171716] focus:outline-none focus:border-[#B18A4A]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[#625F58] uppercase letter-luxury mb-1">
                    Direct Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    placeholder="080... or +234..."
                    className="w-full bg-[#FFFFFF] border border-[#DED7CA] rounded-xl px-3.5 py-2.5 text-sm text-[#171716] focus:outline-none focus:border-[#B18A4A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-[#625F58] uppercase letter-luxury mb-1">
                    Property Category
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#DED7CA] rounded-xl px-3 py-2.5 text-xs font-medium text-[#171716] focus:outline-none focus:border-[#B18A4A]"
                  >
                    <option value="Commercial Building">Commercial Building</option>
                    <option value="Residential Villa / Detached">Residential Villa / Detached</option>
                    <option value="Prime Parcel / Land Bank">Prime Parcel / Land Bank</option>
                    <option value="Mixed-Use / Retail Plaza">Mixed-Use / Retail Plaza</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[#625F58] uppercase letter-luxury mb-1">
                    Location in Uyo
                  </label>
                  <select
                    value={propertyLocation}
                    onChange={(e) => setPropertyLocation(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#DED7CA] rounded-xl px-3 py-2.5 text-xs font-medium text-[#171716] focus:outline-none focus:border-[#B18A4A]"
                  >
                    <option value="Aka Road Corridor">Aka Road Corridor</option>
                    <option value="Ewet Housing Estate">Ewet Housing Estate</option>
                    <option value="Shelter Afrique">Shelter Afrique</option>
                    <option value="Osongama Estate">Osongama Estate</option>
                    <option value="Abak Road Hub">Abak Road Hub</option>
                    <option value="Uyo City Centre">Uyo City Centre</option>
                    <option value="Other Akwa Ibom Axis">Other Akwa Ibom Axis</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[#625F58] uppercase letter-luxury mb-1">
                    Service Required
                  </label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#DED7CA] rounded-xl px-3 py-2.5 text-xs font-medium text-[#171716] focus:outline-none focus:border-[#B18A4A]"
                  >
                    <option value="Outright Sale">Outright Sale</option>
                    <option value="Property Management">Property Management</option>
                    <option value="Costing & Valuation">Costing & Valuation</option>
                    <option value="Commercial Lease">Commercial Lease</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-[#625F58] uppercase letter-luxury mb-1">
                    Title Document Status
                  </label>
                  <select
                    value={titleType}
                    onChange={(e) => setTitleType(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#DED7CA] rounded-xl px-3 py-2.5 text-xs font-medium text-[#171716] focus:outline-none focus:border-[#B18A4A]"
                  >
                    <option value="Certificate of Occupancy (C of O)">Certificate of Occupancy (C of O)</option>
                    <option value="Governor's Consent">Governor's Consent</option>
                    <option value="Registered Survey & Deed">Registered Survey & Deed</option>
                    <option value="Customary / Gazette Title">Customary / Gazette Title</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[#625F58] uppercase letter-luxury mb-1">
                    Estimated Target Value (NGN)
                  </label>
                  <input
                    type="text"
                    value={askingPrice}
                    onChange={(e) => setAskingPrice(e.target.value)}
                    placeholder="e.g. ₦120,000,000"
                    className="w-full bg-[#FFFFFF] border border-[#DED7CA] rounded-xl px-3.5 py-2.5 text-sm text-[#171716] focus:outline-none focus:border-[#B18A4A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#625F58] uppercase letter-luxury mb-1">
                  Property Description & Dimensions
                </label>
                <textarea
                  rows={3}
                  value={propertyNotes}
                  onChange={(e) => setPropertyNotes(e.target.value)}
                  placeholder="Provide details on plot size, number of units, road access, and current condition..."
                  className="w-full bg-[#FFFFFF] border border-[#DED7CA] rounded-xl p-3 text-xs sm:text-sm text-[#171716] focus:outline-none focus:border-[#B18A4A]"
                />
              </div>

              <button
                type="submit"
                id="submit-list-property-btn"
                className="w-full gold-gradient gold-gradient-hover text-[#FFFFFF] py-3.5 rounded-full text-xs font-semibold uppercase letter-luxury transition-all duration-300 flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Send className="w-4 h-4 text-[#FFFFFF]" />
                <span>Submit Property for Advisory Review</span>
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-[#625F58]">
              LandsandHousing Advisory verifies all documents through official Akwa Ibom State land registries.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
