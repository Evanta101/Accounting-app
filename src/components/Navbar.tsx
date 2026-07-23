import React from 'react';
import { 
  Palette, 
  ShoppingBag, 
  Tag, 
  Droplet, 
  Receipt, 
  Users, 
  TrendingUp, 
  PlusCircle, 
  RotateCcw,
  FileSpreadsheet
} from 'lucide-react';
import { BusinessSummary } from '../types';
import { ConfirmPopover } from './ConfirmPopover';
import { useToast } from '../context/ToastContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  summary: BusinessSummary | null;
  onOpenNewSale: () => void;
  onOpenNewCloth: () => void;
  onOpenNewPaint: () => void;
  onOpenBackupModal: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  summary,
  onOpenNewSale,
  onOpenNewCloth,
  onOpenNewPaint,
  onOpenBackupModal,
  onResetData,
}) => {
  const { showToast } = useToast();
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'cloths', label: 'Cloth Stock', icon: ShoppingBag },
    { id: 'sales', label: 'Sales Register', icon: Tag },
    { id: 'paints', label: 'Paints & Tools', icon: Droplet },
    { id: 'expenses', label: 'Misc Expenses', icon: Receipt },
    { id: 'profiles', label: 'Customers & Shops', icon: Users },
    { id: 'reports', label: 'Profit & Reports', icon: Palette },
  ];

  return (
    <header className="woven-header-bg border-b border-[#E5E5EA] sticky top-0 z-30 shadow-xs">
      {/* Top Banner & Quick Metrics */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E8A93B] to-[#C97D1F] flex items-center justify-center text-white shadow-xs">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-lg leading-tight tracking-tight text-[#1D1D1F]">
              Kalam Kaari
            </h1>
            <p className="text-xs text-[#6E6E73]">Artisan Cloth Painting Ledger</p>
          </div>
        </div>

        {/* Quick In-Stock & Dues Pill */}
        {summary && (
          <div className="flex items-center space-x-3 text-xs sm:text-sm bg-white/80 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-[#E5E5EA] shadow-xs">
            <button 
              onClick={() => setActiveTab('cloths')} 
              className="flex items-center space-x-1.5 hover:text-[#C97D1F] transition cursor-pointer"
              title="Click to view Cloth Stock"
            >
              <span className="w-2 h-2 rounded-full bg-[#E8A93B]"></span>
              <span className="text-[#6E6E73]">In Stock:</span>
              <span className="font-semibold text-[#9E5D00]">
                {summary.inStockClothCount} pcs (₹{summary.inStockClothValue.toLocaleString('en-IN')})
              </span>
            </button>
            <span className="text-[#D2D2D7]">|</span>
            <button 
              onClick={() => setActiveTab('sales')} 
              className="flex items-center space-x-1.5 hover:text-[#D9552C] transition cursor-pointer"
              title="Click to view Sales Register & Dues"
            >
              <span className="w-2 h-2 rounded-full bg-[#D9552C]"></span>
              <span className="text-[#6E6E73]">Dues:</span>
              <span className="font-semibold text-[#D9552C]">
                ₹{summary.totalPendingCustomerDues.toLocaleString('en-IN')} ({summary.pendingDuesCount || 0} sarees)
              </span>
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenBackupModal}
            className="flex items-center space-x-1.5 text-[#1D1D1F] bg-[#FAF9F6] hover:bg-[#F5F3EE] px-3 py-2 rounded-xl border border-[#D2D2D7] text-xs font-medium transition cursor-pointer"
            title="Excel Backups & Data Safety"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#2F8F6E]" />
            <span className="hidden sm:inline">Excel Backups</span>
          </button>

          <button
            onClick={onOpenNewSale}
            className="btn-primary font-medium text-xs sm:text-sm px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Sale</span>
          </button>

          <ConfirmPopover
            title="Reset all ledger data back to sample values?"
            confirmText="Reset Data"
            confirmVariant="danger"
            align="right"
            position="bottom"
            onConfirm={() => {
              onResetData();
              showToast("Ledger data reset to sample values", "info");
            }}
          >
            <button
              className="text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] p-2 rounded-xl border border-[#D2D2D7] transition cursor-pointer"
              title="Reset to Sample Data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </ConfirmPopover>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-t border-[#E5E5EA] px-4 bg-white/70 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto flex space-x-1 sm:space-x-2 overflow-x-auto py-1.5 scrollbar-none">
          {navItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            // Color mapping per tab
            let activeStyle = 'bg-[#FDF0ED] text-[#C1553D] font-semibold';
            let iconColor = 'text-[#C1553D]';
            if (tab.id === 'cloths') {
              activeStyle = 'bg-[#FFF8E7] text-[#9E5D00] font-semibold border border-[#F5E2B3]';
              iconColor = 'text-[#C97D1F]';
            } else if (tab.id === 'sales') {
              activeStyle = 'bg-[#FDF0ED] text-[#C1553D] font-semibold border border-[#F8D4CC]';
              iconColor = 'text-[#C1553D]';
            } else if (tab.id === 'paints') {
              activeStyle = 'bg-[#F9EBF2] text-[#802552] font-semibold border border-[#F0C2D8]';
              iconColor = 'text-[#9B3D6B]';
            } else if (tab.id === 'expenses') {
              activeStyle = 'bg-[#FDF0ED] text-[#D9552C] font-semibold border border-[#F8D4CC]';
              iconColor = 'text-[#D9552C]';
            } else if (tab.id === 'profiles') {
              activeStyle = 'bg-[#EAF5F1] text-[#1D6C51] font-semibold border border-[#BDE3D5]';
              iconColor = 'text-[#2F8F6E]';
            } else if (tab.id === 'reports') {
              activeStyle = 'bg-[#EAF4F6] text-[#1B4B56] font-semibold border border-[#C5E1E6]';
              iconColor = 'text-[#2B6E7A]';
            }

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? activeStyle
                    : 'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? iconColor : 'text-[#8E8E93]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
