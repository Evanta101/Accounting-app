import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Tag, 
  Droplet, 
  Clock, 
  Plus, 
  ChevronRight,
  X,
  Check,
  Search
} from 'lucide-react';
import { BusinessSummary, SaleEntry, ClothItem, PaintItem } from '../types';

interface DashboardViewProps {
  summary: BusinessSummary | null;
  sales: SaleEntry[];
  cloths: ClothItem[];
  paints: PaintItem[];
  onNavigate: (tab: string) => void;
  onOpenNewSale: () => void;
  onOpenNewCloth: () => void;
  onOpenNewPaint: () => void;
  onSellCloth: (cloth: ClothItem) => void;
  onMarkPaintFinished: (paint: PaintItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  sales,
  cloths,
  paints,
  onNavigate,
  onOpenNewSale,
  onOpenNewCloth,
  onOpenNewPaint,
  onSellCloth,
  onMarkPaintFinished,
}) => {
  // State for Box Overlay Modals
  const [activeBoxModal, setActiveBoxModal] = useState<'cloths' | 'paints' | 'sales' | 'dues' | null>(null);
  const [boxSearchTerm, setBoxSearchTerm] = useState<string>('');

  const inStockCloths = cloths.filter(c => c.status === 'In Stock');
  const activePaints = paints.filter(p => !p.isFullyUtilized);
  const pendingSales = sales.filter(s => (s.sellingPrice - (s.amountReceived || 0)) > 0);

  // Breakdown counts
  const silkClothCount = inStockCloths.filter(c => c.fabricCategory === 'Silk').length;
  const cottonClothCount = inStockCloths.filter(c => c.fabricCategory === 'Fabric / Cotton').length;

  const silkPaintCount = activePaints.filter(p => p.category === 'Silk Paint').length;
  const fabricPaintCount = activePaints.filter(p => p.category === 'Fabric Paint').length;

  const paidSalesCount = sales.filter(s => s.paymentStatus === 'Paid').length;
  const partialSalesCount = sales.filter(s => s.paymentStatus === 'Partial').length;

  return (
    <div className="space-y-8 text-[#1D1D1F]">
      {/* Top Header Bar with Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E5EA]">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">Studio Overview</h2>
          <p className="text-xs text-[#6E6E73] mt-0.5">Real-time inventory valuation and order vault metrics</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenNewSale}
            className="btn-primary font-medium rounded-xl text-xs sm:text-sm px-4 py-2 transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            <span>Record New Sale</span>
          </button>
          <button
            onClick={onOpenNewCloth}
            className="btn-secondary font-medium text-xs sm:text-sm px-4 py-2 transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#6E6E73]" strokeWidth={1.5} />
            <span>Cloth Purchase</span>
          </button>
        </div>
      </div>

      {/* 4 Apple-Style Card Vaults Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Cloths in Stock */}
        <div 
          onClick={() => { setActiveBoxModal('cloths'); setBoxSearchTerm(''); }}
          className="apple-card card-gold p-6 cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8E8E93]">Cloths in Stock</span>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E8A93B] to-[#C97D1F] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5 text-white fill-white" strokeWidth={1.5} />
            </div>
          </div>

          <div className="my-2">
            <div className="text-3xl font-semibold tracking-tight text-[#C97D1F]">
              ₹{summary?.inStockClothValue.toLocaleString('en-IN')}
            </div>
            <div className="text-xs font-medium text-[#6E6E73] mt-1">
              {inStockCloths.length} sarees available
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#E5E5EA] flex items-center justify-between text-xs text-[#6E6E73]">
            <div className="flex items-center gap-2 text-xs">
              <span className="chip-silk px-2.5 py-1 rounded-md text-xs">
                {silkClothCount} Silk
              </span>
              <span className="chip-cotton px-2.5 py-1 rounded-md text-xs">
                {cottonClothCount} Cotton
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#C97D1F] group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
          </div>
        </div>

        {/* Card 2: Active Paint Bottles */}
        <div 
          onClick={() => { setActiveBoxModal('paints'); setBoxSearchTerm(''); }}
          className="apple-card card-plum p-6 cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8E8E93]">Active Paints & Consumables</span>
            <div className="w-10 h-10 rounded-2xl bg-[#9B3D6B] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Droplet className="w-5 h-5 text-white fill-white" strokeWidth={1.5} />
            </div>
          </div>

          <div className="my-2">
            <div className="text-3xl font-semibold tracking-tight text-[#9B3D6B]">
              {activePaints.length} <span className="text-base font-normal text-[#6E6E73]">Bottles</span>
            </div>
            <div className="text-xs font-medium text-[#6E6E73] mt-1">
              Currently in use for ongoing painting
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#E5E5EA] flex items-center justify-between text-xs text-[#6E6E73]">
            <div className="flex items-center gap-2 text-xs">
              <span className="chip-plum px-2.5 py-1 rounded-md text-xs">
                {silkPaintCount} Silk Paints
              </span>
              <span className="chip-cotton px-2.5 py-1 rounded-md text-xs">
                {fabricPaintCount} Fabric Paints
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#9B3D6B] group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
          </div>
        </div>

        {/* Card 3: Sales Orders */}
        <div 
          onClick={() => { setActiveBoxModal('sales'); setBoxSearchTerm(''); }}
          className="apple-card card-terracotta p-6 cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8E8E93]">Total Sales Revenue</span>
            <div className="w-10 h-10 rounded-2xl bg-[#C1553D] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Tag className="w-5 h-5 text-white fill-white" strokeWidth={1.5} />
            </div>
          </div>

          <div className="my-2">
            <div className="text-3xl font-semibold tracking-tight text-[#C1553D]">
              ₹{summary?.totalRevenue.toLocaleString('en-IN')}
            </div>
            <div className="text-xs font-medium text-[#6E6E73] mt-1">
              {sales.length} order entries recorded
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#E5E5EA] flex items-center justify-between text-xs text-[#6E6E73]">
            <div className="flex items-center gap-2 text-xs">
              <span className="pill-success px-2.5 py-1 rounded-md text-xs">
                {paidSalesCount} Fully Paid
              </span>
              {partialSalesCount > 0 && (
                <span className="chip-coral px-2.5 py-1 rounded-md text-xs">
                  {partialSalesCount} Partial Dues
                </span>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-[#C1553D] group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
          </div>
        </div>

        {/* Card 4: Uncollected Dues */}
        <div 
          onClick={() => { setActiveBoxModal('dues'); setBoxSearchTerm(''); }}
          className="apple-card card-coral p-6 cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8E8E93]">Pending Customer Dues</span>
            <div className="w-10 h-10 rounded-2xl bg-[#D9552C] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5 text-white fill-white" strokeWidth={1.5} />
            </div>
          </div>

          <div className="my-2">
            <div className="text-3xl font-semibold tracking-tight text-[#D9552C]">
              ₹{summary?.totalPendingCustomerDues.toLocaleString('en-IN')}
            </div>
            <div className="text-xs font-medium text-[#6E6E73] mt-1">
              {pendingSales.length} orders pending balance payment
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#E5E5EA] flex items-center justify-between text-xs text-[#6E6E73]">
            <span className="text-xs font-semibold text-[#D9552C]">Click to view pending invoices</span>
            <ChevronRight className="w-4 h-4 text-[#D9552C] group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* EXPANDED BOX OVERLAY MODAL */}
      {activeBoxModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-[#E5E5EA] my-auto overflow-hidden text-[#1D1D1F]">
            {/* Box Header */}
            <div className="bg-white p-5 sm:p-6 flex items-center justify-between border-b border-[#E5E5EA] shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[#F0F0F2] flex items-center justify-center text-[#C1553D]">
                  {activeBoxModal === 'cloths' && <ShoppingBag className="w-5 h-5" />}
                  {activeBoxModal === 'paints' && <Droplet className="w-5 h-5" />}
                  {activeBoxModal === 'sales' && <Tag className="w-5 h-5" />}
                  {activeBoxModal === 'dues' && <Clock className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#1D1D1F]">
                    {activeBoxModal === 'cloths' && 'In-Stock Cloth Inventory'}
                    {activeBoxModal === 'paints' && 'Active Paint Bottles'}
                    {activeBoxModal === 'sales' && 'Sales Register Entries'}
                    {activeBoxModal === 'dues' && 'Uncollected Dues Details'}
                  </h3>
                  <p className="text-xs text-[#6E6E73]">Expanded vault view</p>
                </div>
              </div>

              <button
                onClick={() => setActiveBoxModal(null)}
                className="w-8 h-8 rounded-full bg-[#E5E5EA] text-[#1D1D1F] flex items-center justify-center hover:bg-[#D1D1D6] transition cursor-pointer"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Search Filter Bar inside Expanded Box */}
            <div className="bg-[#F5F5F7] p-4 border-b border-[#E5E5EA] flex items-center justify-between gap-3 text-xs shrink-0">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#8E8E93] absolute left-3 top-2.5" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Filter items..."
                  value={boxSearchTerm}
                  onChange={(e) => setBoxSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#D2D2D7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1553D] text-xs"
                />
              </div>

              {activeBoxModal === 'cloths' && (
                <button
                  onClick={() => { setActiveBoxModal(null); onOpenNewCloth(); }}
                  className="btn-primary font-medium text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" strokeWidth={1.5} />
                  <span>New Cloth</span>
                </button>
              )}

              {activeBoxModal === 'paints' && (
                <button
                  onClick={() => { setActiveBoxModal(null); onOpenNewPaint(); }}
                  className="btn-primary font-medium text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" strokeWidth={1.5} />
                  <span>New Paint</span>
                </button>
              )}
            </div>

            {/* Box Contents Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* 1. CLOTHS BOX CONTENTS */}
              {activeBoxModal === 'cloths' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inStockCloths
                    .filter(c => c.clothType.toLowerCase().includes(boxSearchTerm.toLowerCase()) || c.purchaseLocation.toLowerCase().includes(boxSearchTerm.toLowerCase()))
                    .map((cloth) => (
                      <div key={cloth.id} className="bg-white p-4 rounded-2xl border border-[#E5E5EA] shadow-xs flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[#1D1D1F] text-sm">{cloth.clothType}</span>
                            <span className="text-[10px] bg-[#E3F5EA] text-[#1D7A4C] font-semibold px-2 py-0.5 rounded-full">
                              {cloth.fabricCategory}
                            </span>
                          </div>
                          <div className="text-xs text-[#6E6E73] mt-1">{cloth.purchaseLocation} • {cloth.purchaseDate}</div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-[#E5E5EA]">
                          <span className="font-bold text-sm text-[#1D1D1F]">₹{cloth.purchaseCost.toLocaleString('en-IN')}</span>
                          <button
                            onClick={() => { setActiveBoxModal(null); onSellCloth(cloth); }}
                            className="px-3 py-1.5 bg-[#C1553D] hover:bg-[#A84732] text-white font-medium text-xs rounded-xl transition cursor-pointer"
                          >
                            Sell Now
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* 2. PAINTS BOX CONTENTS */}
              {activeBoxModal === 'paints' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activePaints
                    .filter(p => p.brandName.toLowerCase().includes(boxSearchTerm.toLowerCase()) || p.category.toLowerCase().includes(boxSearchTerm.toLowerCase()))
                    .map((paint) => (
                      <div key={paint.id} className="bg-white p-4 rounded-2xl border border-[#E5E5EA] shadow-xs flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[#1D1D1F] text-sm">{paint.brandName}</span>
                            <span className="text-[10px] bg-[#E3F5EA] text-[#1D7A4C] font-semibold px-2 py-0.5 rounded-full">
                              Active
                            </span>
                          </div>
                          <div className="text-xs text-[#6E6E73] mt-1 flex items-center justify-between">
                            <span>{paint.category}</span>
                            <span>Used: {paint.timesUsedCount} times</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-[#E5E5EA]">
                          <span className="font-semibold text-xs text-[#1D1D1F]">Cost: ₹{paint.purchaseCost}</span>
                          <button
                            onClick={() => onMarkPaintFinished(paint)}
                            className="px-3 py-1.5 bg-white hover:bg-[#F5F5F7] text-[#1D1D1F] border border-[#D2D2D7] font-medium text-xs rounded-xl transition flex items-center space-x-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5 text-[#C1553D]" />
                            <span>Mark Empty</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* 3. SALES BOX CONTENTS */}
              {activeBoxModal === 'sales' && (
                <div className="space-y-3">
                  {sales
                    .filter(s => s.customerName.toLowerCase().includes(boxSearchTerm.toLowerCase()) || s.clothTypeSnapshot.toLowerCase().includes(boxSearchTerm.toLowerCase()))
                    .map((sale) => (
                      <div key={sale.id} className="bg-white p-4 rounded-2xl border border-[#E5E5EA] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold text-[#1D1D1F] text-sm">{sale.clothTypeSnapshot}</div>
                          <div className="text-xs text-[#6E6E73] mt-0.5">
                            Customer: {sale.customerName} • {sale.date}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-bold text-base text-[#1D1D1F]">₹{sale.sellingPrice.toLocaleString('en-IN')}</div>
                          <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full inline-block ${
                            sale.paymentStatus === 'Paid' ? 'bg-[#E3F5EA] text-[#1D7A4C]' : 'bg-[#FDF0ED] text-[#C1553D]'
                          }`}>
                            {sale.paymentStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* 4. DUES BOX CONTENTS */}
              {activeBoxModal === 'dues' && (
                <div className="space-y-3">
                  {pendingSales
                    .filter(s => s.customerName.toLowerCase().includes(boxSearchTerm.toLowerCase()))
                    .map((sale) => {
                      const pendingAmt = sale.sellingPrice - (sale.amountReceived || 0);
                      return (
                        <div key={sale.id} className="bg-white p-4 rounded-2xl border border-[#E5E5EA] shadow-xs flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-[#1D1D1F] text-sm">{sale.customerName}</div>
                            <div className="text-xs text-[#6E6E73]">
                              {sale.clothTypeSnapshot} • Price: ₹{sale.sellingPrice}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xs text-[#8E8E93]">Unpaid Balance</div>
                            <div className="font-semibold text-lg text-[#C1553D]">₹{pendingAmt.toLocaleString('en-IN')}</div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            <div className="p-4 bg-[#F5F5F7] border-t border-[#E5E5EA] text-center text-xs text-[#6E6E73] shrink-0">
              Kalam Kaari Inventory Vault
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
