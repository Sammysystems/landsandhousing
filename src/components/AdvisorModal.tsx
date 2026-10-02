import React, { useState } from 'react';
import { X, Phone, MessageCircle, Send, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';
import { BUSINESS_INFO } from '../data/mockData';

interface AdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
}

export const AdvisorModal: React.FC<AdvisorModalProps> = ({
  isOpen,
  onClose,
  initialTopic,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [advisoryTopic, setAdvisoryTopic] = useState(initialTopic || 'Property Acquisition / Buying in Uyo');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setIsSubmitted(true);
  };

  return (
    <div
      id="advisor-consultation-modal"
      className="fixed inset-0 z-50 bg-[#171716]/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#F7F4EE] rounded-3xl border border-[#DED7CA] max-w-2xl w-full p-6 sm:p-10 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-advisor-modal-btn"
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
              Consultation Scheduled
            </h3>
            <p className="text-sm text-[#625F58] max-w-md mx-auto leading-relaxed">
              Thank you, {name}. A senior LandsandHousing property advisor will reach out to you at <strong>{phone}</strong> to discuss your real estate requirements.
            </p>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="bg-[#171716] text-[#F7F4EE] px-8 py-3 rounded-full text-xs font-medium uppercase tracking-wider"
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] text-[#65715D] font-semibold uppercase letter-luxury mb-2">
                <ShieldCheck className="w-4 h-4 text-[#B18A4A]" />
                <span>CONFIDENTIAL PROPERTY ADVISORY</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-[#171716] leading-tight">
                Speak With an Advisor
              </h2>
              <p className="text-xs sm:text-sm text-[#625F58] mt-1 font-sans-ui">
                Discuss acquisitions, property management, costing, or marketing training directly with our Uyo team.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-[#625F58] uppercase letter-luxury mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Mr. Obong Emmanuel"
                    className="w-full bg-[#FFFFFF] border border-[#DED7CA] rounded-xl px-3.5 py-2.5 text-sm text-[#171716] focus:outline-none focus:border-[#B18A4A]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[#625F58] uppercase letter-luxury mb-1">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0805 632 1856"
                    className="w-full bg-[#FFFFFF] border border-[#DED7CA] rounded-xl px-3.5 py-2.5 text-sm text-[#171716] focus:outline-none focus:border-[#B18A4A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#625F58] uppercase letter-luxury mb-1">
                  Advisory Focus Area
                </label>
                <select
                  value={advisoryTopic}
                  onChange={(e) => setAdvisoryTopic(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#DED7CA] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-[#171716] focus:outline-none focus:border-[#B18A4A]"
                >
                  <option value="Property Acquisition / Buying in Uyo">Property Acquisition / Buying in Uyo</option>
                  <option value="Property Sales / Listing a Property">Property Sales / Listing a Property</option>
                  <option value="Property Management Services">Property Management & Tenancy Oversight</option>
                  <option value="Property Costing & Valuation">Property Costing & Valuation Feasibility</option>
                  <option value="Training of Marketers">Training of Real Estate Marketers</option>
                  <option value="Commercial Leasing on Aka/Abak Corridor">Commercial Leasing on Aka/Abak Corridor</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#625F58] uppercase letter-luxury mb-1">
                  Brief Context / Specific Location (Optional)
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share details on your target location, budget, or property requirements..."
                  className="w-full bg-[#FFFFFF] border border-[#DED7CA] rounded-xl p-3 text-xs sm:text-sm text-[#171716] focus:outline-none focus:border-[#B18A4A]"
                />
              </div>

              <button
                type="submit"
                id="submit-advisor-request-btn"
                className="w-full gold-gradient gold-gradient-hover text-[#FFFFFF] py-3.5 rounded-full text-xs font-semibold uppercase letter-luxury transition-all duration-300 flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Send className="w-4 h-4 text-[#FFFFFF]" />
                <span>Request Advisory Consultation</span>
              </button>
            </form>

            {/* Quick Contact Alternatives */}
            <div className="pt-4 border-t border-[#DED7CA] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#625F58]">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#65715D]" />
                <span>Immediate Assistance: <strong>Open 24 Hours</strong></span>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href={`tel:${BUSINESS_INFO.phoneClean}`}
                  className="text-[#171716] font-semibold hover:text-[#B18A4A]"
                >
                  Call {BUSINESS_INFO.phone}
                </a>
                <a
                  href={`https://wa.me/2348056321856?text=${encodeURIComponent('Hello LandsandHousing, I would like to speak with a property advisor.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#65715D] font-semibold hover:underline"
                >
                  WhatsApp Now
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
