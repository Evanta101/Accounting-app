import React from 'react';
import { HelpCircle, MessageSquare, Sparkles, Shield, Share2, Globe, X } from 'lucide-react';
import { Modal } from './Modal';

interface QuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuestionsModal: React.FC<QuestionsModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidthClass="max-w-2xl">
      <div className="space-y-6 relative">
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-[#E5E5EA] text-[#1D1D1F] flex items-center justify-center hover:bg-[#D1D1D6] transition cursor-pointer absolute top-0 right-0"
        >
          <X className="w-4 h-4" strokeWidth={1.5} />
        </button>

        {/* Header */}
        <div className="flex items-start space-x-3 pr-8">
          <div className="w-10 h-10 rounded-2xl bg-[#FDF0ED] flex items-center justify-center text-[#C1553D] shrink-0">
            <HelpCircle className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#F0F0F2] text-[#1D1D1F] text-[11px] font-semibold mb-1">
              <Sparkles className="w-3 h-3 text-[#C1553D]" strokeWidth={1.5} />
              <span>Tailoring System for Mummy</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1D1D1F]">
              Key Consultation Questions for First Draft
            </h3>
            <p className="text-xs text-[#6E6E73] mt-1">
              We have built this working first draft! Here are key choices we can refine together:
            </p>
          </div>
        </div>

        {/* Questions Grid */}
        <div className="space-y-3 text-xs sm:text-sm">
          {/* Question 1 */}
          <div className="p-4 bg-[#F5F5F7] rounded-2xl border border-[#E5E5EA] space-y-1">
            <div className="font-semibold text-[#1D1D1F] flex items-center gap-2 text-sm">
              <Globe className="w-4 h-4 text-[#C1553D]" strokeWidth={1.5} />
              <span>1. Language & Display Terms (Hindi / English / Gujarati)</span>
            </div>
            <p className="text-[#6E6E73] leading-relaxed">
              Would Mummy prefer simple Hindi/Hinglish labels (e.g., <strong className="text-[#1D1D1F]">"Saree Purchases / Khareedi"</strong>, <strong className="text-[#1D1D1F]">"Selling / Bikri"</strong>, <strong className="text-[#1D1D1F]">"Paints Bottles / Rang"</strong>, <strong className="text-[#1D1D1F]">"Profit / Munafa"</strong>)?
            </p>
          </div>

          {/* Question 2 */}
          <div className="p-4 bg-[#F5F5F7] rounded-2xl border border-[#E5E5EA] space-y-1">
            <div className="font-semibold text-[#1D1D1F] flex items-center gap-2 text-sm">
              <Share2 className="w-4 h-4 text-[#1D7A4C]" strokeWidth={1.5} />
              <span>2. WhatsApp Receipts for Relatives & Clients</span>
            </div>
            <p className="text-[#6E6E73] leading-relaxed">
              Would she like a 1-click button on each sale entry to generate a clean WhatsApp order receipt (showing total price, received amount, pending balance, and delivery status) to send to her friends & relatives directly?
            </p>
          </div>

          {/* Question 3 */}
          <div className="p-4 bg-[#F5F5F7] rounded-2xl border border-[#E5E5EA] space-y-1">
            <div className="font-semibold text-[#1D1D1F] flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-[#2B6E7A]" strokeWidth={1.5} />
              <span>3. Cloud Database & Mobile Access</span>
            </div>
            <p className="text-[#6E6E73] leading-relaxed">
              Currently, data is automatically saved full-stack locally. Should we set up persistent Firebase Cloud Firestore so she can use this app on her phone while travelling to markets in nearby cities?
            </p>
          </div>

          {/* Question 4 */}
          <div className="p-4 bg-[#F5F5F7] rounded-2xl border border-[#E5E5EA] space-y-1">
            <div className="font-semibold text-[#1D1D1F] flex items-center gap-2 text-sm">
              <MessageSquare className="w-4 h-4 text-[#9B3D6B]" strokeWidth={1.5} />
              <span>4. Custom Painting Technique Quick Tags</span>
            </div>
            <p className="text-[#6E6E73] leading-relaxed">
              What are her main painting styles (e.g. Peacock motif, Gold Zari borders, Floral spray, Madhubani, Block painting)? We can add quick design presets!
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end border-t border-[#E5E5EA]">
          <button
            onClick={onClose}
            className="btn-primary font-medium text-xs sm:text-sm px-6 py-2.5 cursor-pointer"
          >
            Got it! Explore First Draft
          </button>
        </div>
      </div>
    </Modal>
  );
};
