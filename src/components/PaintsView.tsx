import React, { useState } from 'react';
import { 
  Droplet, 
  Plus, 
  Trash2, 
  Edit3, 
  LayoutGrid,
  List,
  X
} from 'lucide-react';
import { PaintItem, PaintCategory, VendorProfile, SaleEntry } from '../types';
import { ConfirmPopover } from './ConfirmPopover';
import { useToast } from '../context/ToastContext';
import { Modal } from './Modal';

interface PaintsViewProps {
  paints: PaintItem[];
  vendors: VendorProfile[];
  sales: SaleEntry[];
  onAddOrUpdatePaint: (paint: PaintItem) => void;
  onDeletePaint: (id: string) => void;
}

export const PaintsView: React.FC<PaintsViewProps> = ({
  paints,
  vendors,
  sales,
  onAddOrUpdatePaint,
  onDeletePaint,
}) => {
  const { showToast } = useToast();
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // View Mode: Cards vs Compact List
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  // Interactive Status Filter
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'empty'>('all');

  // Form Fields
  const [brandName, setBrandName] = useState<string>('');
  const [category, setCategory] = useState<PaintCategory>('Silk Paint');
  const [description, setDescription] = useState<string>('');
  const [purchaseCost, setPurchaseCost] = useState<number | ''>(650);
  const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');
  const [isFullyUtilized, setIsFullyUtilized] = useState<boolean>(false);

  // Inline validation errors
  const [brandError, setBrandError] = useState<string>('');
  const [costError, setCostError] = useState<string>('');

  const openNewForm = () => {
    setEditingId(null);
    setBrandName('Fevicryl Silk Color - Royal Blue');
    setCategory('Silk Paint');
    setDescription('Vibrant fluid silk paint');
    setPurchaseCost(650);
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setSelectedVendorId('');
    setIsFullyUtilized(false);
    setBrandError('');
    setCostError('');
    setShowAddModal(true);
  };

  const openEditForm = (item: PaintItem) => {
    setEditingId(item.id);
    setBrandName(item.brandName);
    setCategory(item.category);
    setDescription(item.description || '');
    setPurchaseCost(item.purchaseCost);
    setPurchaseDate(item.purchaseDate);
    setSelectedVendorId(item.vendorId || '');
    setIsFullyUtilized(item.isFullyUtilized);
    setBrandError('');
    setCostError('');
    setShowAddModal(true);
  };

  const toggleFullyUtilized = (item: PaintItem) => {
    const updated: PaintItem = {
      ...item,
      isFullyUtilized: !item.isFullyUtilized,
      fullyUtilizedDate: !item.isFullyUtilized ? new Date().toISOString().split('T')[0] : undefined,
    };
    onAddOrUpdatePaint(updated);
    showToast(
      updated.isFullyUtilized ? `${item.brandName} marked as empty` : `${item.brandName} marked as active`,
      'info'
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    if (!brandName.trim()) {
      setBrandError('Please enter a paint brand or color name');
      hasError = true;
    } else {
      setBrandError('');
    }

    if (!purchaseCost || Number(purchaseCost) <= 0) {
      setCostError('Please enter a valid purchase cost');
      hasError = true;
    } else {
      setCostError('');
    }

    if (hasError) return;

    const vendor = vendors.find(v => v.id === selectedVendorId);

    const newItem: PaintItem = {
      id: editingId || `paint-${Date.now()}`,
      brandName: brandName.trim(),
      category,
      description,
      purchaseCost: Number(purchaseCost),
      purchaseDate,
      vendorId: selectedVendorId || undefined,
      vendorName: vendor ? vendor.shopName : undefined,
      isFullyUtilized,
      fullyUtilizedDate: isFullyUtilized ? new Date().toISOString().split('T')[0] : undefined,
      timesUsedCount: editingId ? (paints.find(p => p.id === editingId)?.timesUsedCount || 0) : 0,
      linkedSaleIds: editingId ? (paints.find(p => p.id === editingId)?.linkedSaleIds || []) : [],
      createdAt: new Date().toISOString(),
    };

    onAddOrUpdatePaint(newItem);
    showToast(editingId ? 'Paint bottle updated' : 'New paint bottle logged', 'success');
    setShowAddModal(false);
  };

  const activePaints = paints.filter(p => !p.isFullyUtilized);
  const finishedPaints = paints.filter(p => p.isFullyUtilized);

  const displayedPaints = paints.filter(p => {
    if (statusFilter === 'active') return !p.isFullyUtilized;
    if (statusFilter === 'empty') return p.isFullyUtilized;
    return true;
  });

  return (
    <div className="space-y-6 text-[#1D1D1F]">
      {/* Top Banner & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E5E5EA] shadow-xs">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#9B3D6B] to-[#7B2D53] flex items-center justify-center text-white shadow-xs">
              <Droplet className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-[#1D1D1F]">Paints & Supplies</h2>
          </div>
          <p className="text-xs text-[#6E6E73] mt-1">
            Track paint usage across saree orders and expense allocation
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Card vs List View Toggle */}
          <div className="flex items-center bg-[#F0F0F2] p-1 rounded-xl">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-[#1D1D1F] shadow-xs font-semibold' : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-[#1D1D1F] shadow-xs font-semibold' : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={openNewForm}
            className="btn-primary font-medium rounded-xl text-xs sm:text-sm px-4 py-2.5 transition flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Purchase Paint</span>
          </button>
        </div>
      </div>

      {/* Filter Switcher */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-3 rounded-2xl border border-[#E5E5EA] shadow-xs">
          <div className="text-xs font-medium text-[#1D1D1F] px-2 flex items-center gap-1.5">
            <Droplet className="w-4 h-4 text-[#C1553D]" />
            <span>Filter Bottles:</span>
          </div>
          
          <div className="flex items-center space-x-1 bg-[#F0F0F2] p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-[#1D1D1F] shadow-xs font-semibold'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              All Bottles ({paints.length})
            </button>

            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-[#E3F5EA] text-[#1D7A4C] font-semibold'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              Active ({activePaints.length})
            </button>

            <button
              onClick={() => setStatusFilter('empty')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                statusFilter === 'empty'
                  ? 'bg-[#FDF0ED] text-[#C1553D] font-semibold'
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              Empty ({finishedPaints.length})
            </button>
          </div>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            onClick={() => setStatusFilter('active')}
            className={`apple-card p-5 cursor-pointer transition-all flex items-center justify-between ${
              statusFilter === 'active' ? 'ring-2 ring-[#1D7A4C]' : ''
            }`}
          >
            <div>
              <span className="font-semibold text-sm block text-[#1D1D1F]">Active In-Use Bottles ({activePaints.length})</span>
              <span className="text-xs text-[#6E6E73] mt-0.5 block">Currently being used on active orders</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#E3F5EA] text-[#1D7A4C] flex items-center justify-center">
              <Droplet className="w-5 h-5" />
            </div>
          </div>

          <div 
            onClick={() => setStatusFilter('empty')}
            className={`apple-card p-5 cursor-pointer transition-all flex items-center justify-between ${
              statusFilter === 'empty' ? 'ring-2 ring-[#C1553D]' : ''
            }`}
          >
            <div>
              <span className="font-semibold text-sm block text-[#1D1D1F]">Fully Empty Bottles ({finishedPaints.length})</span>
              <span className="text-xs text-[#6E6E73] mt-0.5 block">Cost distributed across completed sales</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#FDF0ED] text-[#C1553D] flex items-center justify-center">
              <Droplet className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Paints Grid / List */}
      {displayedPaints.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E5E5EA] shadow-xs">
          <Droplet className="w-8 h-8 text-[#8E8E93] mx-auto mb-2" />
          <h3 className="font-semibold text-[#1D1D1F]">No paint items found</h3>
          <p className="text-xs text-[#6E6E73] mt-1 max-w-sm mx-auto">
            Click "All Bottles" above or add a new bottle entry.
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayedPaints.map((paint) => {
            const isSilkCategory = paint.category === 'Silk Paint';
            const isFabricCategory = paint.category === 'Fabric Paint';
            const usages = paint.timesUsedCount || 0;
            const costPerSaree = usages > 0 ? Math.round(paint.purchaseCost / usages) : paint.purchaseCost;
            const chipClass = isSilkCategory ? 'chip-silk' : isFabricCategory ? 'chip-cotton' : 'chip-plum';

            return (
              <div
                key={paint.id}
                className="apple-card p-5 flex flex-col justify-between space-y-3 border-l-4 border-l-[#9B3D6B]"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full ${chipClass}`}>
                      {paint.category}
                    </span>

                    <button
                      onClick={() => toggleFullyUtilized(paint)}
                      className={`text-[10px] px-2.5 py-0.5 rounded-full transition cursor-pointer ${
                        paint.isFullyUtilized
                          ? 'pill-neutral'
                          : 'pill-success'
                      }`}
                    >
                      {paint.isFullyUtilized ? 'Empty' : 'Active'}
                    </button>
                  </div>

                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <h3 className="font-semibold text-[#1D1D1F] text-sm leading-tight">
                        {paint.brandName}
                      </h3>
                      {paint.description && (
                        <p className="text-xs text-[#6E6E73] mt-0.5 line-clamp-1">{paint.description}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold text-[#9B3D6B]">₹{paint.purchaseCost}</div>
                    </div>
                  </div>

                  <div className="mt-3 text-[11px] text-[#6E6E73] flex items-center justify-between bg-[#F5F5F7] px-2.5 py-1.5 rounded-lg">
                    <span>Used on: <span className="font-semibold text-[#1D1D1F]">{usages} sarees</span></span>
                    <span>Cost/Saree: <span className="font-semibold text-[#9B3D6B]">₹{costPerSaree}</span></span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#E5E5EA]">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => openEditForm(paint)}
                      className="p-1.5 text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg border border-[#D2D2D7] transition cursor-pointer"
                      title="Edit Paint"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <ConfirmPopover
                      title="Delete this paint bottle?"
                      onConfirm={() => {
                        onDeletePaint(paint.id);
                        showToast("Paint bottle deleted", "success");
                      }}
                    >
                      <button
                        className="p-1.5 text-[#6E6E73] hover:text-[#D9552C] hover:bg-[#FDF0ED] rounded-lg border border-[#D2D2D7] transition cursor-pointer"
                        title="Delete Paint"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </ConfirmPopover>
                  </div>

                  {!paint.isFullyUtilized ? (
                    <ConfirmPopover
                      title="Mark this paint bottle as fully empty/utilized?"
                      confirmText="Mark Empty"
                      confirmVariant="danger"
                      align="right"
                      onConfirm={() => toggleFullyUtilized(paint)}
                    >
                      <button className="text-xs font-medium text-[#9B3D6B] hover:underline cursor-pointer">
                        Mark Empty
                      </button>
                    </ConfirmPopover>
                  ) : (
                    <button
                      onClick={() => toggleFullyUtilized(paint)}
                      className="text-xs font-medium text-[#6E6E73] hover:underline cursor-pointer"
                    >
                      Reactivate
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E5EA] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#1D1D1F]">
              <thead className="bg-[#F5F5F7] text-[#6E6E73] text-[11px] uppercase tracking-wider font-semibold border-b border-[#E5E5EA]">
                <tr>
                  <th className="p-3.5">Brand / Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Cost</th>
                  <th className="p-3.5">Usages</th>
                  <th className="p-3.5">Cost/Saree</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5EA]">
                {displayedPaints.map((paint) => {
                  const usages = paint.timesUsedCount || 0;
                  const costPerSaree = usages > 0 ? Math.round(paint.purchaseCost / usages) : paint.purchaseCost;
                  const isSilkCategory = paint.category === 'Silk Paint';
                  const isFabricCategory = paint.category === 'Fabric Paint';
                  const chipClass = isSilkCategory ? 'chip-silk' : isFabricCategory ? 'chip-cotton' : 'chip-plum';

                  return (
                    <tr key={paint.id} className="hover:bg-[#F5F5F7] transition">
                      <td className="p-3.5 font-semibold text-[#1D1D1F]">{paint.brandName}</td>
                      <td className="p-3.5">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full ${chipClass}`}>
                          {paint.category}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-[#9B3D6B]">₹{paint.purchaseCost}</td>
                      <td className="p-3.5 text-[#6E6E73]">{usages} sarees</td>
                      <td className="p-3.5 text-[#9B3D6B]">₹{costPerSaree}</td>
                      <td className="p-3.5">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full ${
                          paint.isFullyUtilized ? 'pill-neutral' : 'pill-success'
                        }`}>
                          {paint.isFullyUtilized ? 'Empty' : 'Active'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => openEditForm(paint)}
                            className="p-1.5 text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg border border-[#D2D2D7] transition cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <ConfirmPopover
                            title="Delete this paint bottle?"
                            align="right"
                            onConfirm={() => {
                              onDeletePaint(paint.id);
                              showToast("Paint bottle deleted", "success");
                            }}
                          >
                            <button
                              className="p-1.5 text-[#6E6E73] hover:text-[#D9552C] hover:bg-[#FDF0ED] rounded-lg border border-[#D2D2D7] transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </ConfirmPopover>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} maxWidthClass="max-w-lg">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E5EA] shrink-0 mb-4">
          <h3 className="font-semibold text-[#1D1D1F] text-lg">
            {editingId ? 'Edit Paint Entry' : 'Purchase Paint Bottle'}
          </h3>
          <button
            onClick={() => setShowAddModal(false)}
            className="w-8 h-8 rounded-full bg-[#E5E5EA] text-[#1D1D1F] flex items-center justify-center hover:bg-[#D1D1D6] transition cursor-pointer"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm overflow-y-auto pr-1 text-[#1D1D1F]">
              <div>
                <label className="text-[11px] font-semibold tracking-wider text-[#8E8E93] uppercase block mb-1">
                  Brand & Shade Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fevicryl Silk Color - Royal Blue"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full bg-[#F2F2F7] border border-[#D2D2D7] px-3.5 py-2.5 rounded-xl font-medium focus:ring-2 focus:ring-[#C1553D] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold tracking-wider text-[#8E8E93] uppercase block mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PaintCategory)}
                  className="w-full bg-[#F2F2F7] border border-[#D2D2D7] px-3.5 py-2.5 rounded-xl font-medium focus:ring-2 focus:ring-[#C1553D] focus:outline-none"
                >
                  <option value="Silk Paint">Silk Paint</option>
                  <option value="Fabric Paint">Fabric Paint</option>
                  <option value="Outliner">Outliner</option>
                  <option value="Medium / Binder">Medium / Binder</option>
                  <option value="Brush / Tool">Brush / Tool</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold tracking-wider text-[#8E8E93] uppercase block mb-1">Cost (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="650"
                    value={purchaseCost}
                    onChange={(e) => setPurchaseCost(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-[#F2F2F7] border border-[#D2D2D7] px-3.5 py-2.5 rounded-xl font-semibold text-[#1D1D1F] focus:ring-2 focus:ring-[#C1553D] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold tracking-wider text-[#8E8E93] uppercase block mb-1">Purchase Date</label>
                  <input
                    type="date"
                    required
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full bg-[#F2F2F7] border border-[#D2D2D7] px-3.5 py-2.5 rounded-xl font-medium focus:ring-2 focus:ring-[#C1553D] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold tracking-wider text-[#8E8E93] uppercase block mb-1">Description / Shade Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Fluid silk paint"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#F2F2F7] border border-[#D2D2D7] px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-[#C1553D] focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-[#E5E5EA] flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary px-5 py-2.5 text-xs sm:text-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-6 py-2.5 text-xs sm:text-sm font-medium cursor-pointer"
                >
                  Save Entry
                </button>
              </div>
            </form>
      </Modal>
    </div>
  );
};
