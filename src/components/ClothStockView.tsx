import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  Trash2, 
  Edit3,
  LayoutGrid,
  List,
  X
} from 'lucide-react';
import { ClothItem, ClothType, FabricCategory, VendorProfile } from '../types';
import { ConfirmPopover } from './ConfirmPopover';
import { useToast } from '../context/ToastContext';
import { Modal } from './Modal';

interface ClothStockViewProps {
  cloths: ClothItem[];
  vendors: VendorProfile[];
  onAddOrUpdateCloth: (cloth: ClothItem) => void;
  onDeleteCloth: (id: string) => void;
  onSellCloth: (cloth: ClothItem) => void;
}

export const ClothStockView: React.FC<ClothStockViewProps> = ({
  cloths,
  vendors,
  onAddOrUpdateCloth,
  onDeleteCloth,
  onSellCloth,
}) => {
  const { showToast } = useToast();
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // View Mode: Cards vs Compact List
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [fabricFilter, setFabricFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Form Fields
  const [clothType, setClothType] = useState<ClothType>('Saree');
  const [customTypeLabel, setCustomTypeLabel] = useState<string>('');
  const [fabricCategory, setFabricCategory] = useState<FabricCategory>('Silk');
  const [purchaseCost, setPurchaseCost] = useState<number | ''>(2500);
  const [quantity, setQuantity] = useState<number>(1);
  const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [purchaseLocation, setPurchaseLocation] = useState<string>('Surat Wholesale Market');
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Inline Validation Errors
  const [costError, setCostError] = useState<string>('');
  const [customTypeError, setCustomTypeError] = useState<string>('');

  const openNewForm = () => {
    setEditingId(null);
    setClothType('Saree');
    setCustomTypeLabel('');
    setFabricCategory('Silk');
    setPurchaseCost(2500);
    setQuantity(1);
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setPurchaseLocation('Surat Wholesale Market');
    setSelectedVendorId('');
    setNotes('');
    setCostError('');
    setCustomTypeError('');
    setShowAddModal(true);
  };

  const openEditForm = (item: ClothItem) => {
    setEditingId(item.id);
    setClothType(item.clothType);
    setCustomTypeLabel(item.customTypeLabel || '');
    setFabricCategory(item.fabricCategory);
    setPurchaseCost(item.purchaseCost);
    setQuantity(item.quantity !== undefined ? item.quantity : 1);
    setPurchaseDate(item.purchaseDate);
    setPurchaseLocation(item.purchaseLocation);
    setSelectedVendorId(item.vendorId || '');
    setNotes(item.notes || '');
    setCostError('');
    setCustomTypeError('');
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    if (!purchaseCost || Number(purchaseCost) <= 0) {
      setCostError('Please enter a valid purchase cost (greater than 0)');
      hasError = true;
    } else {
      setCostError('');
    }

    if (clothType === 'Other' && !customTypeLabel.trim()) {
      setCustomTypeError('Please enter a custom cloth type name');
      hasError = true;
    } else {
      setCustomTypeError('');
    }

    if (hasError) return;

    const vendor = vendors.find(v => v.id === selectedVendorId);
    const qty = Math.max(0, quantity || 1);

    const newItem: ClothItem = {
      id: editingId || `cloth-${Date.now()}`,
      clothType,
      customTypeLabel: clothType === 'Other' ? customTypeLabel : undefined,
      fabricCategory,
      purchaseCost: Number(purchaseCost),
      purchaseDate,
      purchaseLocation,
      vendorId: selectedVendorId || undefined,
      vendorName: vendor ? vendor.shopName : undefined,
      quantity: qty,
      status: qty > 0 ? 'In Stock' : 'Sold',
      notes,
      createdAt: new Date().toISOString(),
    };

    onAddOrUpdateCloth(newItem);
    showToast(editingId ? 'Cloth purchase updated' : 'New cloth purchase logged', 'success');
    setShowAddModal(false);
  };

  // Filter & Sort logic
  const filteredCloths = cloths
    .filter(c => {
      const matchesSearch = 
        c.clothType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.fabricCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.purchaseLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.notes && c.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = typeFilter === 'All' || c.clothType === typeFilter;
      const matchesFabric = fabricFilter === 'All' || c.fabricCategory === fabricFilter;
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;

      return matchesSearch && matchesType && matchesFabric && matchesStatus;
    })
    .sort((a, b) => {
      if (a.status === 'In Stock' && b.status !== 'In Stock') return -1;
      if (a.status !== 'In Stock' && b.status === 'In Stock') return 1;
      return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
    });

  const totalInStockValue = cloths
    .filter(c => c.status === 'In Stock')
    .reduce((sum, c) => sum + c.purchaseCost, 0);

  return (
    <div className="space-y-6 text-[#1D1D1F]">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E5E5EA] shadow-xs">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#E8A93B] to-[#C97D1F] flex items-center justify-center text-white shadow-xs">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-[#1D1D1F]">Cloth Inventory</h2>
          </div>
          <p className="text-xs text-[#6E6E73] mt-1">
            Track advance saree & fabric purchases for artisan painting
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right pr-4 border-r border-[#E5E5EA]">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-[#8E8E93]">In-Stock Valuation</div>
            <div className="text-xl font-semibold tracking-tight text-[#C97D1F]">₹{totalInStockValue.toLocaleString('en-IN')}</div>
          </div>
          <button
            onClick={openNewForm}
            className="btn-primary font-medium rounded-xl text-xs sm:text-sm px-4 py-2.5 transition flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cloth Purchase</span>
          </button>
        </div>
      </div>

      {/* Filter & View Mode Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E5EA] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-[#8E8E93] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search cloth stock..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#F5F5F7] border border-[#D2D2D7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1553D] text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#F5F5F7] border border-[#D2D2D7] px-3 py-1.5 rounded-xl text-xs text-[#1D1D1F] focus:outline-none font-medium"
          >
            <option value="All">All Types</option>
            <option value="Saree">Saree</option>
            <option value="Frock">Frock</option>
            <option value="T-Shirt">T-Shirt</option>
            <option value="Salwar Suit">Salwar Suit</option>
            <option value="Co-ord Set">Co-ord Set</option>
            <option value="Dupatta / Stole">Dupatta / Stole</option>
            <option value="Other">Other</option>
          </select>

          {/* Fabric Filter */}
          <select
            value={fabricFilter}
            onChange={(e) => setFabricFilter(e.target.value)}
            className="bg-[#F5F5F7] border border-[#D2D2D7] px-3 py-1.5 rounded-xl text-xs text-[#1D1D1F] focus:outline-none font-medium"
          >
            <option value="All">All Fabrics</option>
            <option value="Silk">Silk</option>
            <option value="Fabric / Cotton">Fabric / Cotton</option>
            <option value="Georgette">Georgette</option>
            <option value="Organza">Organza</option>
            <option value="Chiffon">Chiffon</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F5F5F7] border border-[#D2D2D7] px-3 py-1.5 rounded-xl text-xs text-[#1D1D1F] focus:outline-none font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="In Stock">In Stock Only</option>
            <option value="Sold">Sold Items</option>
          </select>

          {/* Card vs Compact List Toggle */}
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
        </div>
      </div>

      {/* Cloth Items Display */}
      {filteredCloths.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E5E5EA] shadow-xs">
          <ShoppingBag className="w-8 h-8 text-[#8E8E93] mx-auto mb-2" />
          <h3 className="font-semibold text-[#1D1D1F]">No cloth items found</h3>
          <p className="text-xs text-[#6E6E73] mt-1 max-w-sm mx-auto">
            Adjust search filters or click "Cloth Purchase" to add items.
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCloths.map((cloth) => {
            const isSilk = cloth.fabricCategory === 'Silk';
            const isCotton = cloth.fabricCategory === 'Fabric / Cotton';
            const isInStock = cloth.status === 'In Stock';

            // Left accent bar color
            const accentBorder = isSilk 
              ? 'border-l-4 border-l-[#E8A93B]' 
              : isCotton 
                ? 'border-l-4 border-l-[#2B6E7A]' 
                : 'border-l-4 border-l-[#9B3D6B]';

            const chipClass = isSilk ? 'chip-silk' : isCotton ? 'chip-cotton' : 'chip-plum';

            return (
              <div
                key={cloth.id}
                className={`apple-card p-5 flex flex-col justify-between space-y-3 ${accentBorder}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full ${chipClass}`}>
                      {cloth.fabricCategory}
                    </span>

                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full ${
                      isInStock ? 'pill-success' : 'pill-neutral'
                    }`}>
                      {isInStock ? `In Stock (${cloth.quantity !== undefined ? cloth.quantity : 1})` : 'Sold (0 left)'}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <h3 className="font-semibold text-[#1D1D1F] text-sm leading-tight">
                        {cloth.clothType === 'Other' && cloth.customTypeLabel ? cloth.customTypeLabel : cloth.clothType}
                      </h3>
                      <p className="text-xs text-[#6E6E73] mt-0.5">
                        {cloth.purchaseLocation}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold text-[#C97D1F]">₹{cloth.purchaseCost.toLocaleString('en-IN')}</div>
                    </div>
                  </div>

                  <div className="mt-3 text-[11px] text-[#6E6E73] flex items-center justify-between bg-[#F5F5F7] px-2.5 py-1.5 rounded-lg">
                    <span>Bought: {cloth.purchaseDate}</span>
                    {cloth.vendorName && <span className="font-medium truncate max-w-[100px]">{cloth.vendorName}</span>}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#E5E5EA]">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => openEditForm(cloth)}
                      className="p-1.5 text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg border border-[#D2D2D7] transition cursor-pointer"
                      title="Edit Entry"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <ConfirmPopover
                      title="Delete this cloth entry?"
                      onConfirm={() => {
                        onDeleteCloth(cloth.id);
                        showToast("Cloth purchase deleted", "success");
                      }}
                    >
                      <button
                        className="p-1.5 text-[#6E6E73] hover:text-[#D9552C] hover:bg-[#FDF0ED] rounded-lg border border-[#D2D2D7] transition cursor-pointer"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </ConfirmPopover>
                  </div>

                  {isInStock ? (
                    <button
                      onClick={() => onSellCloth(cloth)}
                      className="btn-primary font-medium text-xs px-3 py-1.5 rounded-xl transition cursor-pointer"
                    >
                      Sell Now
                    </button>
                  ) : (
                    <span className="text-xs text-[#8E8E93]">Sold</span>
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
                  <th className="p-3.5">Cloth Item</th>
                  <th className="p-3.5">Fabric</th>
                  <th className="p-3.5">Location / Vendor</th>
                  <th className="p-3.5">Purchase Date</th>
                  <th className="p-3.5">Cost Price</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5EA]">
                {filteredCloths.map((cloth) => {
                  const isSilk = cloth.fabricCategory === 'Silk';
                  const isCotton = cloth.fabricCategory === 'Fabric / Cotton';
                  const isInStock = cloth.status === 'In Stock';
                  const chipClass = isSilk ? 'chip-silk' : isCotton ? 'chip-cotton' : 'chip-plum';

                  return (
                    <tr key={cloth.id} className="hover:bg-[#F5F5F7] transition">
                      <td className="p-3.5 font-semibold text-[#1D1D1F]">
                        {cloth.clothType === 'Other' && cloth.customTypeLabel ? cloth.customTypeLabel : cloth.clothType}
                      </td>
                      <td className="p-3.5">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full ${chipClass}`}>
                          {cloth.fabricCategory}
                        </span>
                      </td>
                      <td className="p-3.5 text-[#6E6E73]">
                        {cloth.purchaseLocation} {cloth.vendorName ? `(${cloth.vendorName})` : ''}
                      </td>
                      <td className="p-3.5 text-[#6E6E73]">{cloth.purchaseDate}</td>
                      <td className="p-3.5 font-semibold text-[#C97D1F]">₹{cloth.purchaseCost.toLocaleString('en-IN')}</td>
                      <td className="p-3.5">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full ${
                          isInStock ? 'pill-success' : 'pill-neutral'
                        }`}>
                          {cloth.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => openEditForm(cloth)}
                            className="p-1.5 text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg border border-[#D2D2D7] transition cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <ConfirmPopover
                            title="Delete this cloth entry?"
                            align="right"
                            onConfirm={() => {
                              onDeleteCloth(cloth.id);
                              showToast("Cloth purchase deleted", "success");
                            }}
                          >
                            <button
                              className="p-1.5 text-[#6E6E73] hover:text-[#D9552C] hover:bg-[#FDF0ED] rounded-lg border border-[#D2D2D7] transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </ConfirmPopover>
                          {isInStock && (
                            <button
                              onClick={() => onSellCloth(cloth)}
                              className="btn-primary text-white font-medium text-xs px-3 py-1 rounded-xl transition cursor-pointer ml-1"
                            >
                              Sell
                            </button>
                          )}
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

      {/* Add / Edit Cloth Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} maxWidthClass="max-w-lg">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E5EA] shrink-0 mb-4">
          <h3 className="font-semibold text-[#1D1D1F] text-lg">
            {editingId ? 'Edit Cloth Purchase' : 'New Cloth Purchase Entry'}
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
                  Cloth Type *
                </label>
                <select
                  value={clothType}
                  onChange={(e) => setClothType(e.target.value as ClothType)}
                  className="w-full bg-[#F2F2F7] border border-[#D2D2D7] px-3.5 py-2.5 rounded-xl font-medium focus:ring-2 focus:ring-[#C1553D] focus:outline-none"
                >
                  <option value="Saree">Saree</option>
                  <option value="Frock">Frock</option>
                  <option value="T-Shirt">T-Shirt</option>
                  <option value="Salwar Suit">Salwar Suit</option>
                  <option value="Co-ord Set">Co-ord Set</option>
                  <option value="Dupatta / Stole">Dupatta / Stole</option>
                  <option value="Lehenga">Lehenga</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {clothType === 'Other' && (
                <div>
                  <label className="text-[11px] font-semibold tracking-wider text-[#8E8E93] uppercase block mb-1">Custom Cloth Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Table Runner"
                    value={customTypeLabel}
                    onChange={(e) => {
                      setCustomTypeLabel(e.target.value);
                      if (e.target.value.trim()) setCustomTypeError('');
                    }}
                    className={`w-full bg-[#F2F2F7] border px-3.5 py-2.5 rounded-xl transition ${
                      customTypeError ? 'border-[#D9552C] focus:ring-[#D9552C]' : 'border-[#D2D2D7] focus:ring-[#C1553D]'
                    }`}
                  />
                  {customTypeError && (
                    <p className="text-[12px] text-[#D9552C] mt-1 animate-fade-up">{customTypeError}</p>
                  )}
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold tracking-wider text-[#8E8E93] uppercase block mb-1">
                  Fabric Category *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'Silk', label: 'Silk (Special Silk Paints)' },
                    { id: 'Fabric / Cotton', label: 'Fabric / Cotton' },
                    { id: 'Organza', label: 'Organza' },
                    { id: 'Georgette', label: 'Georgette' },
                    { id: 'Chiffon', label: 'Chiffon' },
                    { id: 'Crepe', label: 'Crepe' },
                  ].map((fab) => (
                    <button
                      key={fab.id}
                      type="button"
                      onClick={() => setFabricCategory(fab.id as FabricCategory)}
                      className={`p-2.5 rounded-xl text-left border font-medium text-xs transition cursor-pointer ${
                        fabricCategory === fab.id
                          ? 'bg-white text-[#C1553D] border-[#C1553D] shadow-xs'
                          : 'bg-[#F2F2F7] text-[#6E6E73] border-[#E5E5EA] hover:bg-[#E5E5EA]'
                      }`}
                    >
                      {fab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold tracking-wider text-[#8E8E93] uppercase block mb-1">
                    Purchase Cost (₹) *
                  </label>
                  <input
                    type="number"
                    placeholder="2500"
                    value={purchaseCost}
                    onChange={(e) => {
                      setPurchaseCost(e.target.value ? Number(e.target.value) : '');
                      if (e.target.value && Number(e.target.value) > 0) setCostError('');
                    }}
                    className={`w-full bg-[#F2F2F7] border px-3.5 py-2.5 rounded-xl font-semibold text-[#1D1D1F] transition ${
                      costError ? 'border-[#D9552C] focus:ring-[#D9552C]' : 'border-[#D2D2D7] focus:ring-[#C1553D]'
                    }`}
                  />
                  {costError && (
                    <p className="text-[12px] text-[#D9552C] mt-1 animate-fade-up">{costError}</p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-semibold tracking-wider text-[#8E8E93] uppercase block mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value ? Math.max(1, parseInt(e.target.value, 10)) : 1)}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold tracking-wider text-[#8E8E93] uppercase block mb-1">Location / Market</label>
                  <input
                    type="text"
                    placeholder="Surat Wholesale"
                    value={purchaseLocation}
                    onChange={(e) => setPurchaseLocation(e.target.value)}
                    className="w-full bg-[#F2F2F7] border border-[#D2D2D7] px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-[#C1553D] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold tracking-wider text-[#8E8E93] uppercase block mb-1">Shop / Vendor</label>
                  <select
                    value={selectedVendorId}
                    onChange={(e) => setSelectedVendorId(e.target.value)}
                    className="w-full bg-[#F2F2F7] border border-[#D2D2D7] px-3.5 py-2.5 rounded-xl font-medium focus:ring-2 focus:ring-[#C1553D] focus:outline-none"
                  >
                    <option value="">-- Direct Purchase --</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.shopName} ({v.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold tracking-wider text-[#8E8E93] uppercase block mb-1">Design / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Design notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
