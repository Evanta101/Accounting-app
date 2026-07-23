import React, { useState, useEffect } from 'react';
import { 
  Tag, 
  Plus, 
  Search, 
  Droplet, 
  User, 
  MapPin, 
  Trash2, 
  ShoppingBag,
  Check,
  Edit3,
  X
} from 'lucide-react';
import { 
  SaleEntry, 
  ClothItem, 
  PaintItem, 
  CustomerProfile, 
  PaymentStatus 
} from '../types';
import { ConfirmPopover } from './ConfirmPopover';
import { useToast } from '../context/ToastContext';
import { Modal } from './Modal';

interface SalesRegisterViewProps {
  sales: SaleEntry[];
  cloths: ClothItem[];
  paints: PaintItem[];
  customers: CustomerProfile[];
  onAddSale: (sale: SaleEntry) => void;
  onDeleteSale: (id: string) => void;
  onAddCustomer: (customer: CustomerProfile) => void;
  preselectedCloth?: ClothItem | null;
  onClearPreselectedCloth?: () => void;
  isModalOpenExternal?: boolean;
  onCloseExternalModal?: () => void;
}

export const SalesRegisterView: React.FC<SalesRegisterViewProps> = ({
  sales,
  cloths,
  paints,
  customers,
  onAddSale,
  onDeleteSale,
  onAddCustomer,
  preselectedCloth,
  onClearPreselectedCloth,
  isModalOpenExternal = false,
  onCloseExternalModal,
}) => {
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState<boolean>(isModalOpenExternal);

  // Sync external modal triggers
  useEffect(() => {
    if (isModalOpenExternal || preselectedCloth) {
      setShowModal(true);
      if (preselectedCloth) {
        setIsCustomerCloth(false);
        setSelectedClothId(preselectedCloth.id);
      }
    }
  }, [isModalOpenExternal, preselectedCloth]);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [clothFilter, setClothFilter] = useState<string>('All');
  const [paintFilter, setPaintFilter] = useState<string>('All');
  const [customerFilter, setCustomerFilter] = useState<string>('All');
  const [paymentFilter, setPaymentFilter] = useState<string>('All');

  // New Sale Form State
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [isCustomerCloth, setIsCustomerCloth] = useState<boolean>(false);
  const [selectedClothId, setSelectedClothId] = useState<string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerNameInput, setCustomerNameInput] = useState<string>('');
  const [locationInput, setLocationInput] = useState<string>('Ahmedabad');
  const [sellingPrice, setSellingPrice] = useState<number | ''>(4500);
  const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Paints Selection
  const [selectedPaintIds, setSelectedPaintIds] = useState<string[]>([]);
  const [paintsToMarkFinished, setPaintsToMarkFinished] = useState<string[]>([]);

  // Payment Tracking
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Paid');
  const [amountReceived, setAmountReceived] = useState<number | ''>(4500);
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'Cash' | 'Bank Transfer' | 'Other'>('UPI');
  const [notes, setNotes] = useState<string>('');

  // Quick Customer Create inline
  const [showInlineNewCustomer, setShowInlineNewCustomer] = useState<boolean>(false);
  const [newCustPhone, setNewCustPhone] = useState<string>('');
  const [newCustCity, setNewCustCity] = useState<string>('');
  const [newCustAddress, setNewCustAddress] = useState<string>('');

  // Inline validation errors
  const [priceError, setPriceError] = useState<string>('');
  const [customerError, setCustomerError] = useState<string>('');

  const inStockCloths = cloths.filter(c => (c.status === 'In Stock' && (c.quantity === undefined || c.quantity > 0)) || c.id === selectedClothId);

  const openFormModal = () => {
    setEditingSaleId(null);
    setIsCustomerCloth(false);
    const availableCloths = cloths.filter(c => c.status === 'In Stock' && (c.quantity === undefined || c.quantity > 0));
    setSelectedClothId(availableCloths[0]?.id || '');
    
    // Default customer selection or blank
    if (customers.length > 0) {
      const initialCust = customers[0];
      setSelectedCustomerId(initialCust.id);
      setCustomerNameInput(initialCust.name);
      const locStr = [initialCust.address, initialCust.city].filter(Boolean).join(', ') || initialCust.city || '';
      setLocationInput(locStr);
    } else {
      setSelectedCustomerId('');
      setCustomerNameInput('');
      setLocationInput('');
    }

    setShowInlineNewCustomer(false);
    setNewCustPhone('');
    setNewCustCity('');
    setNewCustAddress('');

    setSellingPrice(4500);
    setSaleDate(new Date().toISOString().split('T')[0]);
    setSelectedPaintIds([]);
    setPaintsToMarkFinished([]);
    setPaymentStatus('Paid');
    setAmountReceived(4500); // Defaults to selling price when Fully Paid
    setPaymentMode('UPI');
    setNotes('');
    setPriceError('');
    setCustomerError('');
    setShowModal(true);
  };

  const openEditModal = (sale: SaleEntry) => {
    setEditingSaleId(sale.id);
    setIsCustomerCloth(sale.isCustomerCloth);
    setSelectedClothId(sale.linkedClothId || '');
    setSelectedCustomerId(sale.customerId || '');
    setCustomerNameInput(sale.customerName || '');
    setLocationInput(sale.location || '');
    setSellingPrice(sale.sellingPrice);
    setSaleDate(sale.date || new Date().toISOString().split('T')[0]);
    setSelectedPaintIds(sale.paintIdsUsed || []);
    setPaintsToMarkFinished(sale.markPaintsFinished || []);
    setPaymentStatus(sale.paymentStatus || 'Paid');
    setAmountReceived(sale.amountReceived !== undefined ? sale.amountReceived : sale.sellingPrice);
    setPaymentMode(sale.paymentMode || 'UPI');
    setNotes(sale.notes || '');
    setPriceError('');
    setCustomerError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (onClearPreselectedCloth) onClearPreselectedCloth();
    if (onCloseExternalModal) onCloseExternalModal();
  };

  // Sync customer details when selecting existing customer
  const handleCustomerSelect = (id: string) => {
    if (id === 'NEW') {
      // Clear fields completely for brand new customer entry
      setSelectedCustomerId('');
      setCustomerNameInput('');
      setNewCustPhone('');
      setNewCustCity('');
      setNewCustAddress('');
      setLocationInput('');
      setShowInlineNewCustomer(true);
      return;
    }

    setSelectedCustomerId(id);
    setShowInlineNewCustomer(false);
    const cust = customers.find(c => c.id === id);
    if (cust) {
      setCustomerNameInput(cust.name);
      // Auto-fill address & city into locationInput
      const locStr = [cust.address, cust.city].filter(Boolean).join(', ') || cust.city || cust.address || '';
      setLocationInput(locStr);
    } else {
      setCustomerNameInput('');
      setLocationInput('');
    }
  };

  // Auto-amount for selling price changes
  const handleSellingPriceChange = (val: number | '') => {
    setSellingPrice(val);
    if (val !== '' && Number(val) > 0) setPriceError('');
    if (paymentStatus === 'Paid') {
      setAmountReceived(val);
    }
  };

  // Auto-amount for payment status changes
  const handlePaymentStatusChange = (status: PaymentStatus) => {
    setPaymentStatus(status);
    if (status === 'Paid') {
      setAmountReceived(sellingPrice !== '' ? sellingPrice : 0);
    } else if (status === 'Pending') {
      setAmountReceived(0);
    }
  };

  const handleSaveInlineCustomer = () => {
    if (!customerNameInput.trim()) {
      setCustomerError('Please enter customer name');
      return;
    }
    const finalCity = newCustCity.trim() || 'Local';
    const finalAddress = newCustAddress.trim();
    const newCust: CustomerProfile = {
      id: `cust-${Date.now()}`,
      name: customerNameInput.trim(),
      phone: newCustPhone.trim() || 'N/A',
      city: finalCity,
      address: finalAddress,
      createdAt: new Date().toISOString(),
    };
    onAddCustomer(newCust);
    setSelectedCustomerId(newCust.id);
    
    // Auto-fill location with newly saved address & city
    const locStr = [finalAddress, finalCity].filter(Boolean).join(', ') || finalCity;
    setLocationInput(locStr);
    setShowInlineNewCustomer(false);
    showToast(`Saved new profile for ${newCust.name} with address`, 'success');
  };

  const togglePaintSelection = (pId: string) => {
    if (selectedPaintIds.includes(pId)) {
      setSelectedPaintIds(selectedPaintIds.filter(id => id !== pId));
      setPaintsToMarkFinished(paintsToMarkFinished.filter(id => id !== pId));
    } else {
      setSelectedPaintIds([...selectedPaintIds, pId]);
    }
  };

  const toggleMarkPaintFinished = (pId: string) => {
    if (paintsToMarkFinished.includes(pId)) {
      setPaintsToMarkFinished(paintsToMarkFinished.filter(id => id !== pId));
    } else {
      setPaintsToMarkFinished([...paintsToMarkFinished, pId]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    if (!sellingPrice || Number(sellingPrice) <= 0) {
      setPriceError('Please enter a valid selling price (greater than 0)');
      hasError = true;
    } else {
      setPriceError('');
    }

    if (!customerNameInput.trim()) {
      setCustomerError('Please enter or select a customer name');
      hasError = true;
    } else {
      setCustomerError('');
    }

    if (hasError) return;

    let finalClothId = selectedClothId;
    let clothCost = 0;
    let clothTypeSnap = "Customer's Own Cloth";
    let fabricSnap = "Custom";

    if (!isCustomerCloth) {
      if (inStockCloths.length === 0) {
        showToast("No in-stock studio cloths available in inventory. Please switch to Customer's Own Fabric or add cloth purchase stock first.", "error");
        return;
      }
      if (!finalClothId || !cloths.some(c => c.id === finalClothId)) {
        finalClothId = inStockCloths[0].id;
        setSelectedClothId(finalClothId);
      }
      const cloth = cloths.find(c => c.id === finalClothId);
      if (cloth) {
        clothCost = cloth.purchaseCost;
        clothTypeSnap = `${cloth.clothType} (${cloth.fabricCategory})`;
        fabricSnap = cloth.fabricCategory;
      }
    }

    const saleToSave: SaleEntry = {
      id: editingSaleId || `sale-${Date.now()}`,
      date: saleDate,
      isCustomerCloth,
      linkedClothId: !isCustomerCloth ? finalClothId : undefined,
      clothTypeSnapshot: clothTypeSnap,
      fabricCategorySnapshot: fabricSnap,
      customerId: selectedCustomerId || 'cust-direct',
      customerName: customerNameInput.trim(),
      location: locationInput.trim(),
      sellingPrice: Number(sellingPrice),
      clothPurchaseCost: clothCost,
      paintIdsUsed: selectedPaintIds,
      markPaintsFinished: paintsToMarkFinished,
      paintCostAllocated: 0,
      paymentStatus,
      amountReceived: Number(amountReceived) || 0,
      paymentMode,
      notes,
      createdAt: new Date().toISOString(),
    };

    onAddSale(saleToSave);
    showToast(editingSaleId ? "Sale entry updated" : "New sale entry recorded", "success");
    handleCloseModal();
  };

  // Filter Sales Register Entries
  const filteredSales = sales.filter(s => {
    const matchesSearch = 
      s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.clothTypeSnapshot.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.notes && s.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCloth = clothFilter === 'All' || s.clothTypeSnapshot.includes(clothFilter);
    const matchesCustomer = customerFilter === 'All' || s.customerId === customerFilter;
    const matchesPayment = paymentFilter === 'All' || s.paymentStatus === paymentFilter;
    const matchesPaint = paintFilter === 'All' || (s.paintIdsUsed && s.paintIdsUsed.includes(paintFilter));

    return matchesSearch && matchesCloth && matchesCustomer && matchesPayment && matchesPaint;
  });

  return (
    <div className="space-y-6 text-[#1D1D1F]">
      {/* Top Banner & Quick Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E5E5EA] shadow-xs">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#C1553D] flex items-center justify-center text-white shadow-xs">
              <Tag className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-[#1D1D1F]">Sales Register</h2>
          </div>
          <p className="text-xs text-[#6E6E73] mt-1">
            Customer orders, paint consumption, and net margin tracking
          </p>
        </div>

        <button
          onClick={openFormModal}
          className="btn-primary font-medium rounded-xl text-xs sm:text-sm px-4 py-2.5 transition flex items-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Sale</span>
        </button>
      </div>

      {/* Filter & Sort Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E5EA] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 text-[#8E8E93] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search sales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#F5F5F7] border border-[#D2D2D7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1553D] text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Customer Filter */}
            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="bg-[#F5F5F7] border border-[#D2D2D7] px-3 py-1.5 rounded-xl text-xs text-[#1D1D1F] focus:outline-none font-medium"
            >
              <option value="All">All Customers</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-[#F5F5F7] border border-[#D2D2D7] px-3 py-1.5 rounded-xl text-xs text-[#1D1D1F] focus:outline-none font-medium"
            >
              <option value="All">All Payment Statuses</option>
              <option value="Paid">Fully Paid</option>
              <option value="Partial">Partial Dues</option>
              <option value="Pending">Pending Dues</option>
            </select>

            {/* Paint Bottle Filter */}
            <select
              value={paintFilter}
              onChange={(e) => setPaintFilter(e.target.value)}
              className="bg-[#F5F5F7] border border-[#D2D2D7] px-3 py-1.5 rounded-xl text-xs text-[#1D1D1F] focus:outline-none font-medium"
            >
              <option value="All">All Paint Bottles</option>
              {paints.map(p => (
                <option key={p.id} value={p.id}>{p.brandName}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Sales Register Entries List */}
      {filteredSales.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E5E5EA] shadow-xs">
          <Tag className="w-8 h-8 text-[#8E8E93] mx-auto mb-2" />
          <h3 className="font-semibold text-[#1D1D1F]">No sales entries found</h3>
          <p className="text-xs text-[#6E6E73] mt-1 max-w-sm mx-auto">
            Click "Record New Sale" to enter a customer order.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSales.map((sale) => {
            const netProfit = sale.sellingPrice - sale.clothPurchaseCost - sale.paintCostAllocated;
            const pendingAmount = sale.sellingPrice - (sale.amountReceived || 0);

            return (
              <div
                key={sale.id}
                className="apple-card p-5 space-y-3"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Item & Customer Header */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-[#1D1D1F] text-base">
                        {sale.clothTypeSnapshot}
                      </span>

                      {sale.isCustomerCloth ? (
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full chip-cotton">
                          Customer's Cloth
                        </span>
                      ) : (
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full chip-terracotta">
                          Studio Inventory (Cost: ₹{sale.clothPurchaseCost})
                        </span>
                      )}

                      {sale.fabricCategorySnapshot === 'Silk' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full chip-silk">
                          SILK
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-[#6E6E73] flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[#2F8F6E]" />
                        <span className="font-medium text-[#1D1D1F]">{sale.customerName}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#8E8E93]" />
                        <span>{sale.location}</span>
                      </span>
                      <span>Date: <span className="font-medium text-[#1D1D1F]">{sale.date}</span></span>
                    </div>

                    {/* Used Paints */}
                    {sale.paintNamesSnapshot && sale.paintNamesSnapshot.length > 0 && (
                      <div className="text-xs text-[#6E6E73] flex items-center space-x-1 pt-0.5">
                        <Droplet className="w-3.5 h-3.5 text-[#9B3D6B]" />
                        <span>Paints: <span className="font-medium text-[#9B3D6B]">{sale.paintNamesSnapshot.join(', ')}</span></span>
                      </div>
                    )}

                    {sale.notes && (
                      <div className="text-xs text-[#6E6E73] italic bg-[#F5F5F7] p-2 rounded-lg border border-[#E5E5EA]">
                        "{sale.notes}"
                      </div>
                    )}
                  </div>

                  {/* Financial Breakdown & Profit */}
                  <div className="flex flex-wrap items-center justify-between md:justify-end gap-6 bg-[#F5F5F7] md:bg-transparent p-3 md:p-0 rounded-xl border md:border-0 border-[#E5E5EA]">
                    {/* Itemized Cost Breakdown */}
                    <div className="text-left md:text-right text-xs space-y-0.5">
                      <div className="text-[#6E6E73]">
                        Price: <span className="font-bold text-[#C1553D]">₹{sale.sellingPrice.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="text-[#6E6E73]">
                        Cloth: <span className="font-medium text-[#1D1D1F]">-₹{sale.clothPurchaseCost}</span>
                      </div>
                      <div className="text-[#6E6E73]">
                        Paints: <span className="font-medium text-[#9B3D6B]">-₹{sale.paintCostAllocated}</span>
                      </div>
                    </div>

                    {/* Net Profit */}
                    <div className="text-right pl-4 border-l border-[#E5E5EA]">
                      <div className="text-[10px] text-[#8E8E93] font-semibold uppercase tracking-wider">Net Margin</div>
                      <div className="text-lg font-semibold text-[#136C3F]">
                        +₹{netProfit.toLocaleString('en-IN')}
                      </div>
                      <span className={`inline-block text-[10px] px-2.5 py-0.5 rounded-full mt-1 ${
                        sale.paymentStatus === 'Paid'
                          ? 'pill-success'
                          : 'chip-coral'
                      }`}>
                        {sale.paymentStatus} ({sale.paymentMode})
                        {pendingAmount > 0 && ` • Due: ₹${pendingAmount}`}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openEditModal(sale)}
                        className="p-1.5 text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg border border-[#D2D2D7] transition cursor-pointer"
                        title="Edit Sale Entry"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <ConfirmPopover
                        title="Delete this sale entry?"
                        align="right"
                        onConfirm={() => {
                          onDeleteSale(sale.id);
                          showToast("Sale entry deleted", "success");
                        }}
                      >
                        <button
                          className="p-1.5 text-[#6E6E73] hover:text-[#D9552C] hover:bg-[#FDF0ED] rounded-lg border border-[#D2D2D7] transition cursor-pointer"
                          title="Delete Sale Entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </ConfirmPopover>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selling Entry Modal Sheet */}
      <Modal isOpen={showModal} onClose={handleCloseModal} maxWidthClass="max-w-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E5EA] shrink-0 mb-4">
          <h3 className="font-semibold text-[#1D1D1F] text-lg">
            {editingSaleId ? "Edit Selling Entry" : "Record Selling Entry"}
          </h3>
          <button
            onClick={handleCloseModal}
            className="w-8 h-8 rounded-full bg-[#E5E5EA] text-[#1D1D1F] flex items-center justify-center hover:bg-[#D1D1D6] transition cursor-pointer"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-5 text-xs sm:text-sm overflow-y-auto pr-1 text-[#1D1D1F]">
              {/* Step 1: Cloth Origin iOS Segmented Control */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold tracking-wider text-[#8E8E93] uppercase block">
                  Cloth Origin
                </label>

                <div className="bg-[#F0F0F2] p-1 rounded-full flex gap-1 border border-[#E5E5EA]">
                  <button
                    type="button"
                    onClick={() => setIsCustomerCloth(false)}
                    className={`py-2 px-4 rounded-full text-xs transition-all flex-1 text-center flex items-center justify-center gap-2 cursor-pointer ${
                      !isCustomerCloth
                        ? 'bg-white text-[#1D1D1F] font-semibold shadow-xs'
                        : 'text-[#6E6E73] font-medium hover:text-[#1D1D1F]'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
                    <span>In-Stock Studio Cloth</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCustomerCloth(true)}
                    className={`py-2 px-4 rounded-full text-xs transition-all flex-1 text-center flex items-center justify-center gap-2 cursor-pointer ${
                      isCustomerCloth
                        ? 'bg-white text-[#1D1D1F] font-semibold shadow-xs'
                        : 'text-[#6E6E73] font-medium hover:text-[#1D1D1F]'
                    }`}
                  >
                    <User className="w-4 h-4" strokeWidth={1.5} />
                    <span>Customer's Own Fabric</span>
                  </button>
                </div>

                {!isCustomerCloth && (
                  <div className="pt-2">
                    <label className="text-[11px] font-semibold tracking-wider text-[#8E8E93] uppercase block mb-1">
                      Select Cloth from Inventory
                    </label>
                    {inStockCloths.length === 0 ? (
                      <div className="p-3 bg-white rounded-xl border border-[#E5E5EA] text-[#C1553D] text-xs font-medium">
                        No in-stock cloths available in inventory!
                      </div>
                    ) : (
                      <select
                        value={selectedClothId}
                        onChange={(e) => setSelectedClothId(e.target.value)}
                        className="w-full bg-[#F2F2F7] border border-[#D2D2D7] px-3.5 py-2.5 rounded-xl font-medium text-[#1D1D1F] focus:ring-2 focus:ring-[#C1553D] focus:outline-none"
                      >
                        {inStockCloths.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.clothType} ({c.fabricCategory}) — Cost: ₹{c.purchaseCost} [Stock Qty: {c.quantity !== undefined ? c.quantity : 1}]
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </div>

              {/* Step 2: Customer Selection Grouped Table Style */}
              <div className="space-y-2 pt-2 border-t border-[#E5E5EA]">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold tracking-wider text-[#8E8E93] uppercase">Customer Details</label>
                  <button
                    type="button"
                    onClick={() => {
                      if (!showInlineNewCustomer) {
                        handleCustomerSelect('NEW');
                      } else {
                        setShowInlineNewCustomer(false);
                      }
                    }}
                    className="text-xs font-semibold text-[#C1553D] hover:underline cursor-pointer flex items-center space-x-1"
                  >
                    <span>{showInlineNewCustomer ? 'Select Existing Customer' : '+ New Blank Customer'}</span>
                  </button>
                </div>

                {!showInlineNewCustomer ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <select
                        value={selectedCustomerId}
                        onChange={(e) => handleCustomerSelect(e.target.value)}
                        className="w-full bg-[#F2F2F7] border border-[#D2D2D7] px-3.5 py-2.5 rounded-xl font-medium focus:ring-2 focus:ring-[#C1553D] focus:outline-none"
                      >
                        <option value="">-- Choose Customer --</option>
                        <option value="NEW" className="font-bold text-[#C1553D]">+ Enter New Customer Profile...</option>
                        {customers.map((cust) => (
                          <option key={cust.id} value={cust.id}>
                            {cust.name} ({cust.city})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Address / City"
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        className="w-full bg-[#F2F2F7] border border-[#D2D2D7] px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-[#C1553D] focus:outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-[#F2F2F7] rounded-2xl border border-[#E5E5EA] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-semibold tracking-wider text-[#C1553D] uppercase">New Customer Profile</div>
                      <span className="text-[11px] text-[#6E6E73]">Fields are cleared automatically</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Customer Name *"
                        value={customerNameInput}
                        onChange={(e) => {
                          setCustomerNameInput(e.target.value);
                          if (e.target.value) setCustomerError('');
                        }}
                        className="bg-white border border-[#D2D2D7] px-3 py-2 rounded-xl focus:ring-2 focus:ring-[#C1553D] focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Phone Number"
                        value={newCustPhone}
                        onChange={(e) => setNewCustPhone(e.target.value)}
                        className="bg-white border border-[#D2D2D7] px-3 py-2 rounded-xl focus:ring-2 focus:ring-[#C1553D] focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Street / Area Address"
                        value={newCustAddress}
                        onChange={(e) => setNewCustAddress(e.target.value)}
                        className="bg-white border border-[#D2D2D7] px-3 py-2 rounded-xl focus:ring-2 focus:ring-[#C1553D] focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="City"
                        value={newCustCity}
                        onChange={(e) => setNewCustCity(e.target.value)}
                        className="bg-white border border-[#D2D2D7] px-3 py-2 rounded-xl focus:ring-2 focus:ring-[#C1553D] focus:outline-none"
                      />
                    </div>
                    {customerError && (
                      <p className="text-[12px] text-[#D9552C]">{customerError}</p>
                    )}
                    <button
                      type="button"
                      onClick={handleSaveInlineCustomer}
                      className="btn-primary text-xs font-medium px-4 py-2 rounded-xl cursor-pointer"
                    >
                      Save Profile & Auto-fill Address
                    </button>
                  </div>
                )}
              </div>

              {/* Step 3: Selling Price & Date */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E5E5EA]">
                <div>
                  <label className="text-[11px] font-semibold tracking-wider text-[#8E8E93] uppercase block mb-1">
                    Selling Price / Fee (₹) *
                  </label>
                  <input
                    type="number"
                    placeholder="4500"
                    value={sellingPrice}
                    onChange={(e) => handleSellingPriceChange(e.target.value ? Number(e.target.value) : '')}
                    className={`w-full bg-[#F2F2F7] border px-3.5 py-2.5 rounded-xl font-semibold text-[#1D1D1F] transition ${
                      priceError ? 'border-[#D9552C] focus:ring-[#D9552C]' : 'border-[#D2D2D7] focus:ring-[#C1553D]'
                    }`}
                  />
                  {priceError && (
                    <p className="text-[12px] text-[#D9552C] mt-1 animate-fade-up">{priceError}</p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-semibold tracking-wider text-[#8E8E93] uppercase block mb-1">Sale Date</label>
                  <input
                    type="date"
                    required
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    className="w-full bg-[#F2F2F7] border border-[#D2D2D7] px-3.5 py-2.5 rounded-xl font-medium focus:ring-2 focus:ring-[#C1553D] focus:outline-none"
                  />
                </div>
              </div>

              {/* Step 4: Paint Bottle Usage */}
              <div className="space-y-2 pt-2 border-t border-[#E5E5EA]">
                <label className="text-[11px] font-semibold tracking-wider text-[#8E8E93] uppercase flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-[#9B3D6B]" strokeWidth={1.5} />
                  <span>Which paints were used?</span>
                </label>

                {paints.length === 0 ? (
                  <div className="text-xs text-[#6E6E73]">No paint bottles recorded.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {paints.map((paint) => {
                      const isSelected = selectedPaintIds.includes(paint.id);
                      const isFinished = paintsToMarkFinished.includes(paint.id);

                      return (
                        <div
                          key={paint.id}
                          className={`p-3 rounded-xl border transition flex flex-col justify-between ${
                            isSelected ? 'bg-white border-[#C1553D] shadow-xs' : 'bg-[#F2F2F7] border-[#E5E5EA]'
                          }`}
                        >
                          <div className="flex items-start justify-between cursor-pointer" onClick={() => togglePaintSelection(paint.id)}>
                            <div className="pr-2">
                              <span className="font-medium text-[#1D1D1F] text-xs block">{paint.brandName}</span>
                              <span className="text-[10px] text-[#6E6E73]">Cost: ₹{paint.purchaseCost}</span>
                            </div>
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                              isSelected ? 'bg-[#C1553D] border-[#C1553D] text-white' : 'border-[#D2D2D7]'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>

                          {isSelected && (
                            <div className="mt-2 pt-2 border-t border-[#E5E5EA] flex items-center justify-between text-[11px]">
                              <label className="text-[#1D1D1F] font-medium cursor-pointer flex items-center gap-1.5">
                                <input
                                  type="checkbox"
                                  checked={isFinished}
                                  onChange={() => toggleMarkPaintFinished(paint.id)}
                                  className="w-3.5 h-3.5 text-[#C1553D] rounded"
                                />
                                <span>Bottle finished with this order</span>
                              </label>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Step 5: Payment & Dues */}
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[#E5E5EA]">
                <div>
                  <label className="text-[11px] font-semibold tracking-wider text-[#8E8E93] uppercase block mb-1">Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => handlePaymentStatusChange(e.target.value as PaymentStatus)}
                    className="w-full bg-[#F2F2F7] border border-[#D2D2D7] px-3.5 py-2.5 rounded-xl font-medium focus:ring-2 focus:ring-[#C1553D] focus:outline-none"
                  >
                    <option value="Paid">Fully Paid</option>
                    <option value="Partial">Partial Payment</option>
                    <option value="Pending">Pending Payment</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold tracking-wider text-[#8E8E93] uppercase block mb-1">Amount Recd (₹)</label>
                  <input
                    type="number"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-[#F2F2F7] border border-[#D2D2D7] px-3.5 py-2.5 rounded-xl font-semibold text-[#1D1D1F] focus:ring-2 focus:ring-[#C1553D] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold tracking-wider text-[#8E8E93] uppercase block mb-1">Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full bg-[#F2F2F7] border border-[#D2D2D7] px-3.5 py-2.5 rounded-xl font-medium focus:ring-2 focus:ring-[#C1553D] focus:outline-none"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold tracking-wider text-[#8E8E93] uppercase block mb-1">Order Notes</label>
                <input
                  type="text"
                  placeholder="Design details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#F2F2F7] border border-[#D2D2D7] px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-[#C1553D] focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-[#E5E5EA] flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
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
