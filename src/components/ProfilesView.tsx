import React, { useState } from 'react';
import { 
  Users, 
  Store, 
  Plus, 
  Trash2, 
  Edit3, 
  Phone, 
  MapPin, 
  Tag, 
  LayoutGrid,
  List,
  ArrowUpDown,
  Search,
  Droplet,
  ExternalLink,
  X
} from 'lucide-react';
import { CustomerProfile, VendorProfile, SaleEntry, ClothItem, PaintItem, ExpenseEntry } from '../types';
import { ConfirmPopover } from './ConfirmPopover';
import { useToast } from '../context/ToastContext';
import { Modal } from './Modal';

interface ProfilesViewProps {
  customers: CustomerProfile[];
  vendors: VendorProfile[];
  sales: SaleEntry[];
  cloths?: ClothItem[];
  paints?: PaintItem[];
  expenses?: ExpenseEntry[];
  onAddOrUpdateCustomer: (customer: CustomerProfile) => void;
  onDeleteCustomer: (id: string) => void;
  onAddOrUpdateVendor: (vendor: VendorProfile) => void;
  onDeleteVendor: (id: string) => void;
}

export const ProfilesView: React.FC<ProfilesViewProps> = ({
  customers,
  vendors,
  sales,
  cloths = [],
  paints = [],
  expenses = [],
  onAddOrUpdateCustomer,
  onDeleteCustomer,
  onAddOrUpdateVendor,
  onDeleteVendor,
}) => {
  const { showToast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<'customers' | 'vendors'>('customers');

  // View Mode: Card Boxes vs Compact List Table
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  // Customer Sort Option: 1st Recent Sales, 2nd Most Sales (default)
  const [custSortOption, setCustSortOption] = useState<'recent_sales' | 'most_sales' | 'due_first' | 'alphabetical'>('recent_sales');
  const [custSearchTerm, setCustSearchTerm] = useState<string>('');

  // Vendor Sort & Search Option
  const [vendSearchTerm, setVendSearchTerm] = useState<string>('');

  // Order Ledger Box Modal State (Profile clicked opens list of orders table)
  const [selectedCustForLedger, setSelectedCustForLedger] = useState<CustomerProfile | null>(null);
  const [selectedVendForLedger, setSelectedVendForLedger] = useState<VendorProfile | null>(null);

  // Customer Modal Form State
  const [showCustModal, setShowCustModal] = useState<boolean>(false);
  const [editingCustId, setEditingCustId] = useState<string | null>(null);
  const [custName, setCustName] = useState<string>('');
  const [custPhone, setCustPhone] = useState<string>('');
  const [custCity, setCustCity] = useState<string>('');
  const [custAddress, setCustAddress] = useState<string>('');
  const [custNotes, setCustNotes] = useState<string>('');
  const [custNameError, setCustNameError] = useState<string>('');

  // Vendor Modal Form State
  const [showVendModal, setShowVendModal] = useState<boolean>(false);
  const [editingVendId, setEditingVendId] = useState<string | null>(null);
  const [vendShopName, setVendShopName] = useState<string>('');
  const [vendCategory, setVendCategory] = useState<'Cloth Wholesaler' | 'Paint Shop' | 'General Supplier'>('Paint Shop');
  const [vendContact, setVendContact] = useState<string>('');
  const [vendPhone, setVendPhone] = useState<string>('');
  const [vendCity, setVendCity] = useState<string>('');
  const [vendNotes, setVendNotes] = useState<string>('');
  const [vendShopError, setVendShopError] = useState<string>('');

  // Open Customer Form
  const openNewCustomer = () => {
    setEditingCustId(null);
    setCustName('');
    setCustPhone('');
    setCustCity('Local');
    setCustAddress('');
    setCustNotes('');
    setCustNameError('');
    setShowCustModal(true);
  };

  const openEditCustomer = (c: CustomerProfile, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingCustId(c.id);
    setCustName(c.name);
    setCustPhone(c.phone);
    setCustCity(c.city);
    setCustAddress(c.address || '');
    setCustNotes(c.notes || '');
    setCustNameError('');
    setShowCustModal(true);
  };

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim()) {
      setCustNameError('Please enter a customer name');
      return;
    }

    const newCust: CustomerProfile = {
      id: editingCustId || `cust-${Date.now()}`,
      name: custName.trim(),
      phone: custPhone.trim() || 'N/A',
      city: custCity.trim() || 'Local',
      address: custAddress.trim(),
      notes: custNotes.trim(),
      createdAt: new Date().toISOString(),
    };

    onAddOrUpdateCustomer(newCust);
    showToast(editingCustId ? 'Customer profile updated' : 'New customer added', 'success');
    setShowCustModal(false);
  };

  // Open Vendor Form
  const openNewVendor = () => {
    setEditingVendId(null);
    setVendShopName('');
    setVendCategory('Paint Shop');
    setVendContact('');
    setVendPhone('');
    setVendCity('Local Market');
    setVendNotes('');
    setVendShopError('');
    setShowVendModal(true);
  };

  const openEditVendor = (v: VendorProfile, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingVendId(v.id);
    setVendShopName(v.shopName);
    setVendCategory(v.category);
    setVendContact(v.contactPerson || '');
    setVendPhone(v.phone);
    setVendCity(v.city);
    setVendNotes(v.notes || '');
    setVendShopError('');
    setShowVendModal(true);
  };

  const handleVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendShopName.trim()) {
      setVendShopError('Please enter a shop or supplier name');
      return;
    }

    const newVend: VendorProfile = {
      id: editingVendId || `vend-${Date.now()}`,
      shopName: vendShopName.trim(),
      category: vendCategory,
      contactPerson: vendContact.trim() || undefined,
      phone: vendPhone.trim() || 'N/A',
      city: vendCity.trim() || 'Local Market',
      notes: vendNotes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onAddOrUpdateVendor(newVend);
    showToast(editingVendId ? 'Vendor profile updated' : 'New vendor profile added', 'success');
    setShowVendModal(false);
  };

  // Helper function to extract customer sales & calculated metrics
  const getCustomerMetrics = (c: CustomerProfile) => {
    const custSales = sales.filter(s => 
      s.customerId === c.id || s.customerName.toLowerCase() === c.name.toLowerCase()
    );
    const totalSpent = custSales.reduce((sum, s) => sum + s.sellingPrice, 0);
    const totalReceived = custSales.reduce((sum, s) => sum + (s.amountReceived || 0), 0);
    const pendingDue = custSales.reduce((sum, s) => {
      const due = s.sellingPrice - (s.amountReceived || 0);
      return sum + (due > 0 ? due : 0);
    }, 0);

    const timestamps = custSales.map(s => new Date(s.date).getTime()).filter(t => !isNaN(t));
    const mostRecentTimestamp = timestamps.length > 0 ? Math.max(...timestamps) : 0;
    const mostRecentDateStr = mostRecentTimestamp > 0 ? new Date(mostRecentTimestamp).toISOString().split('T')[0] : 'No Sales Yet';

    return {
      custSales,
      orderCount: custSales.length,
      totalSpent,
      totalReceived,
      pendingDue,
      mostRecentTimestamp,
      mostRecentDateStr
    };
  };

  // Helper function to extract shop / vendor purchase metrics
  const getVendorMetrics = (v: VendorProfile) => {
    const linkedCloths = cloths.filter(c => c.vendorId === v.id || (c.vendorName && c.vendorName.toLowerCase() === v.shopName.toLowerCase()));
    const linkedPaints = paints.filter(p => p.vendorId === v.id || (p.vendorName && p.vendorName.toLowerCase() === v.shopName.toLowerCase()));
    
    const clothSpend = linkedCloths.reduce((sum, c) => sum + c.purchaseCost, 0);
    const paintSpend = linkedPaints.reduce((sum, p) => sum + p.purchaseCost, 0);
    const totalVendorSpend = clothSpend + paintSpend;

    const timestamps = [
      ...linkedCloths.map(c => new Date(c.purchaseDate).getTime()),
      ...linkedPaints.map(p => new Date(p.purchaseDate).getTime())
    ].filter(t => !isNaN(t));

    const mostRecentTimestamp = timestamps.length > 0 ? Math.max(...timestamps) : 0;
    const mostRecentDateStr = mostRecentTimestamp > 0 ? new Date(mostRecentTimestamp).toISOString().split('T')[0] : 'No Purchases Yet';

    return {
      linkedCloths,
      linkedPaints,
      itemCount: linkedCloths.length + linkedPaints.length,
      totalVendorSpend,
      mostRecentTimestamp,
      mostRecentDateStr
    };
  };

  // Filtered & Sorted Customers
  const filteredAndSortedCustomers = customers
    .filter(c => {
      const query = custSearchTerm.toLowerCase();
      return (
        c.name.toLowerCase().includes(query) ||
        c.city.toLowerCase().includes(query) ||
        c.phone.includes(query) ||
        (c.notes && c.notes.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      const mA = getCustomerMetrics(a);
      const mB = getCustomerMetrics(b);

      if (custSortOption === 'recent_sales') {
        if (mB.mostRecentTimestamp !== mA.mostRecentTimestamp) {
          return mB.mostRecentTimestamp - mA.mostRecentTimestamp;
        }
        return mB.totalSpent - mA.totalSpent;
      } else if (custSortOption === 'most_sales') {
        if (mB.totalSpent !== mA.totalSpent) {
          return mB.totalSpent - mA.totalSpent;
        }
        return mB.orderCount - mA.orderCount;
      } else if (custSortOption === 'due_first') {
        return mB.pendingDue - mA.pendingDue;
      } else {
        return a.name.localeCompare(b.name);
      }
    });

  // Filtered & Sorted Vendors
  const filteredVendors = vendors
    .filter(v => {
      const query = vendSearchTerm.toLowerCase();
      return (
        v.shopName.toLowerCase().includes(query) ||
        v.city.toLowerCase().includes(query) ||
        v.phone.includes(query) ||
        v.category.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      const mA = getVendorMetrics(a);
      const mB = getVendorMetrics(b);
      if (mB.mostRecentTimestamp !== mA.mostRecentTimestamp) {
        return mB.mostRecentTimestamp - mA.mostRecentTimestamp;
      }
      return mB.totalVendorSpend - mA.totalVendorSpend;
    });

  return (
    <div className="space-y-6 text-[#1D1D1F]">
      {/* Header & View Switchers */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E5EA] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#2F8F6E] to-[#1E624A] flex items-center justify-center text-white shadow-xs">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-[#1D1D1F]">Customers & Vendors</h2>
          </div>
          <p className="text-xs text-[#6E6E73] mt-1">
            Linked profiles with order histories, purchase ledgers, and payment tracking
          </p>
        </div>

        {/* Subtabs + List/Box Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Subtabs Segmented Control */}
          <div className="flex items-center bg-[#F0F0F2] p-1 rounded-xl">
            <button
              onClick={() => setActiveSubTab('customers')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center space-x-1.5 ${
                activeSubTab === 'customers' ? 'bg-white text-[#1D1D1F] shadow-xs font-semibold' : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Customers ({customers.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('vendors')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center space-x-1.5 ${
                activeSubTab === 'vendors' ? 'bg-white text-[#1D1D1F] shadow-xs font-semibold' : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Vendors ({vendors.length})</span>
            </button>
          </div>

          {/* Cards vs List Mode Toggle */}
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
            onClick={activeSubTab === 'customers' ? openNewCustomer : openNewVendor}
            className="btn-primary font-medium rounded-xl text-xs sm:text-sm px-4 py-2 transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{activeSubTab === 'customers' ? 'Add Customer' : 'Add Vendor'}</span>
          </button>
        </div>
      </div>

      {/* CUSTOMERS TAB */}
      {activeSubTab === 'customers' && (
        <div className="space-y-4">
          {/* Options Bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#E5E5EA] shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="w-4 h-4 text-[#8E8E93] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={custSearchTerm}
                  onChange={(e) => setCustSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#F5F5F7] border border-[#D2D2D7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1553D] text-xs"
                />
              </div>

              <div className="flex items-center space-x-1.5 bg-[#F5F5F7] border border-[#D2D2D7] px-3 py-1.5 rounded-xl">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#8E8E93]" />
                <select
                  value={custSortOption}
                  onChange={(e) => setCustSortOption(e.target.value as any)}
                  className="bg-transparent font-medium text-[#1D1D1F] focus:outline-none text-xs cursor-pointer"
                >
                  <option value="recent_sales">1st: Recent Sales, 2nd: Most Sales</option>
                  <option value="most_sales">1st: Highest Sales Amount</option>
                  <option value="due_first">Pending Dues First</option>
                  <option value="alphabetical">Alphabetical A-Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Customer Cards or List */}
          {filteredAndSortedCustomers.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#E5E5EA] shadow-xs">
              <Users className="w-8 h-8 text-[#8E8E93] mx-auto mb-2" />
              <h3 className="font-semibold text-[#1D1D1F]">No customers found</h3>
              <p className="text-xs text-[#6E6E73] mt-1 max-w-sm mx-auto">
                Add your first customer to track order histories and dues.
              </p>
            </div>
          ) : viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedCustomers.map((cust) => {
                const metrics = getCustomerMetrics(cust);

                return (
                  <div
                    key={cust.id}
                    onClick={() => setSelectedCustForLedger(cust)}
                    className="apple-card p-5 cursor-pointer flex flex-col justify-between space-y-4 hover:border-[#2F8F6E] transition border-l-4 border-l-[#2F8F6E]"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-[#1D1D1F] text-base">{cust.name}</h3>
                          <div className="text-xs text-[#6E6E73] flex items-center space-x-3 mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#2F8F6E]" />
                              <span>{cust.city}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-[#8E8E93]" />
                              <span>{cust.phone}</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex space-x-1" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={(e) => openEditCustomer(cust, e)}
                            className="p-1.5 text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg border border-[#D2D2D7] transition cursor-pointer"
                            title="Edit Customer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <ConfirmPopover
                            title="Delete this customer profile?"
                            align="right"
                            onConfirm={() => {
                              onDeleteCustomer(cust.id);
                              showToast("Customer profile deleted", "success");
                            }}
                          >
                            <button
                              className="p-1.5 text-[#6E6E73] hover:text-[#D9552C] hover:bg-[#FDF0ED] rounded-lg border border-[#D2D2D7] transition cursor-pointer"
                              title="Delete Customer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </ConfirmPopover>
                        </div>
                      </div>

                      {/* Orders & Financial summary */}
                      <div className="mt-4 grid grid-cols-3 gap-2 p-3 bg-[#F5F5F7] rounded-xl text-center">
                        <div>
                          <div className="text-[10px] text-[#8E8E93] uppercase font-semibold">Orders</div>
                          <div className="text-sm font-semibold text-[#2F8F6E]">{metrics.orderCount}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-[#8E8E93] uppercase font-semibold">Total Spent</div>
                          <div className="text-sm font-semibold text-[#1D1D1F]">₹{metrics.totalSpent.toLocaleString('en-IN')}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-[#8E8E93] uppercase font-semibold">Pending Due</div>
                          <div className={`text-sm font-semibold ${metrics.pendingDue > 0 ? 'text-[#D9552C]' : 'text-[#136C3F]'}`}>
                            ₹{metrics.pendingDue.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E5E5EA] flex items-center justify-between text-xs text-[#6E6E73]">
                      <span>Latest: <span className="font-medium text-[#1D1D1F]">{metrics.mostRecentDateStr}</span></span>
                      <span className="text-[#2F8F6E] font-semibold flex items-center gap-1">
                        <span>View Orders</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E5E5EA] shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs text-[#1D1D1F]">
                <thead className="bg-[#F5F5F7] text-[#6E6E73] text-[11px] uppercase tracking-wider font-semibold border-b border-[#E5E5EA]">
                  <tr>
                    <th className="p-3.5">Customer Name</th>
                    <th className="p-3.5">City</th>
                    <th className="p-3.5">Phone</th>
                    <th className="p-3.5">Orders</th>
                    <th className="p-3.5">Total Spent</th>
                    <th className="p-3.5">Pending Due</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5EA]">
                  {filteredAndSortedCustomers.map((cust) => {
                    const metrics = getCustomerMetrics(cust);

                    return (
                      <tr 
                        key={cust.id} 
                        onClick={() => setSelectedCustForLedger(cust)}
                        className="hover:bg-[#F5F5F7] transition cursor-pointer"
                      >
                        <td className="p-3.5 font-semibold text-[#1D1D1F]">{cust.name}</td>
                        <td className="p-3.5 text-[#6E6E73]">{cust.city}</td>
                        <td className="p-3.5 text-[#6E6E73]">{cust.phone}</td>
                        <td className="p-3.5 font-medium">{metrics.orderCount}</td>
                        <td className="p-3.5 font-semibold text-[#1D1D1F]">₹{metrics.totalSpent.toLocaleString('en-IN')}</td>
                        <td className="p-3.5">
                          <span className={`font-semibold ${metrics.pendingDue > 0 ? 'text-[#C1553D]' : 'text-[#1D7A4C]'}`}>
                            ₹{metrics.pendingDue.toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="p-3.5 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={(e) => openEditCustomer(cust, e)}
                              className="p-1.5 text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg border border-[#D2D2D7] transition cursor-pointer"
                              title="Edit Customer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <ConfirmPopover
                              title="Delete this customer profile?"
                              align="right"
                              onConfirm={() => {
                                onDeleteCustomer(cust.id);
                                showToast("Customer profile deleted", "success");
                              }}
                            >
                              <button
                                className="p-1.5 text-[#6E6E73] hover:text-[#D9552C] hover:bg-[#FDF0ED] rounded-lg border border-[#D2D2D7] transition cursor-pointer"
                                title="Delete Customer"
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
          )}
        </div>
      )}

      {/* VENDORS TAB */}
      {activeSubTab === 'vendors' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-[#E5E5EA] shadow-xs">
            <div className="flex items-center justify-between gap-3 text-xs">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="w-4 h-4 text-[#8E8E93] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search vendors..."
                  value={vendSearchTerm}
                  onChange={(e) => setVendSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#F5F5F7] border border-[#D2D2D7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1553D] text-xs"
                />
              </div>
            </div>
          </div>

          {filteredVendors.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#E5E5EA] shadow-xs">
              <Store className="w-8 h-8 text-[#8E8E93] mx-auto mb-2" />
              <h3 className="font-semibold text-[#1D1D1F]">No vendors found</h3>
              <p className="text-xs text-[#6E6E73] mt-1 max-w-sm mx-auto">
                Add paint shops or wholesalers to link purchases.
              </p>
            </div>
          ) : viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVendors.map((vend) => {
                const metrics = getVendorMetrics(vend);

                return (
                  <div
                    key={vend.id}
                    onClick={() => setSelectedVendForLedger(vend)}
                    className="apple-card p-5 cursor-pointer flex flex-col justify-between space-y-4 hover:border-[#C1553D] transition"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-[#F0F0F2] text-[#6E6E73]">
                            {vend.category}
                          </span>
                          <h3 className="font-semibold text-[#1D1D1F] text-base mt-1.5">{vend.shopName}</h3>
                          <div className="text-xs text-[#6E6E73] flex items-center space-x-3 mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#8E8E93]" />
                              <span>{vend.city}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-[#8E8E93]" />
                              <span>{vend.phone}</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex space-x-1" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={(e) => openEditVendor(vend, e)}
                            className="p-1.5 text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg border border-[#D2D2D7] transition cursor-pointer"
                            title="Edit Vendor"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <ConfirmPopover
                            title="Delete this vendor profile?"
                            align="right"
                            onConfirm={() => {
                              onDeleteVendor(vend.id);
                              showToast("Vendor profile deleted", "success");
                            }}
                          >
                            <button
                              className="p-1.5 text-[#6E6E73] hover:text-[#D9552C] hover:bg-[#FDF0ED] rounded-lg border border-[#D2D2D7] transition cursor-pointer"
                              title="Delete Vendor"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </ConfirmPopover>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 p-3 bg-[#F5F5F7] rounded-xl text-center">
                        <div>
                          <div className="text-[10px] text-[#8E8E93] uppercase font-semibold">Items Sourced</div>
                          <div className="text-sm font-semibold text-[#1D1D1F]">{metrics.itemCount}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-[#8E8E93] uppercase font-semibold">Total Paid</div>
                          <div className="text-sm font-semibold text-[#1D1D1F]">₹{metrics.totalVendorSpend.toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E5E5EA] flex items-center justify-between text-xs text-[#6E6E73]">
                      <span>Latest: <span className="font-medium text-[#1D1D1F]">{metrics.mostRecentDateStr}</span></span>
                      <span className="text-[#C1553D] font-medium flex items-center gap-1">
                        <span>View Ledger</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E5E5EA] shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs text-[#1D1D1F]">
                <thead className="bg-[#F5F5F7] text-[#6E6E73] text-[11px] uppercase tracking-wider font-semibold border-b border-[#E5E5EA]">
                  <tr>
                    <th className="p-3.5">Shop Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">City</th>
                    <th className="p-3.5">Phone</th>
                    <th className="p-3.5">Total Paid</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5EA]">
                  {filteredVendors.map((vend) => {
                    const metrics = getVendorMetrics(vend);

                    return (
                      <tr 
                        key={vend.id} 
                        onClick={() => setSelectedVendForLedger(vend)}
                        className="hover:bg-[#F5F5F7] transition cursor-pointer"
                      >
                        <td className="p-3.5 font-semibold text-[#1D1D1F]">{vend.shopName}</td>
                        <td className="p-3.5">
                          <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-[#F0F0F2] text-[#6E6E73]">
                            {vend.category}
                          </span>
                        </td>
                        <td className="p-3.5 text-[#6E6E73]">{vend.city}</td>
                        <td className="p-3.5 text-[#6E6E73]">{vend.phone}</td>
                        <td className="p-3.5 font-semibold text-[#1D1D1F]">₹{metrics.totalVendorSpend.toLocaleString('en-IN')}</td>
                        <td className="p-3.5 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={(e) => openEditVendor(vend, e)}
                              className="p-1.5 text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg border border-[#D2D2D7] transition cursor-pointer"
                              title="Edit Vendor"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <ConfirmPopover
                              title="Delete this vendor profile?"
                              align="right"
                              onConfirm={() => {
                                onDeleteVendor(vend.id);
                                showToast("Vendor profile deleted", "success");
                              }}
                            >
                              <button
                                className="p-1.5 text-[#6E6E73] hover:text-[#D9552C] hover:bg-[#FDF0ED] rounded-lg border border-[#D2D2D7] transition cursor-pointer"
                                title="Delete Vendor"
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
          )}
        </div>
      )}

      {/* CUSTOMER LEDGER / ORDER HISTORY MODAL */}
      <Modal isOpen={!!selectedCustForLedger} onClose={() => setSelectedCustForLedger(null)} maxWidthClass="max-w-3xl">
        {selectedCustForLedger && (
          <>
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5EA] shrink-0 mb-4">
              <div>
                <h3 className="font-semibold text-[#1D1D1F] text-lg">
                  {selectedCustForLedger.name} — Order Ledger
                </h3>
                <p className="text-xs text-[#6E6E73]">{selectedCustForLedger.city} • {selectedCustForLedger.phone}</p>
              </div>
              <button
                onClick={() => setSelectedCustForLedger(null)}
                className="w-8 h-8 rounded-full bg-[#E5E5EA] text-[#1D1D1F] flex items-center justify-center hover:bg-[#D1D1D6] transition cursor-pointer"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4">
              {(() => {
                const metrics = getCustomerMetrics(selectedCustForLedger);
                if (metrics.custSales.length === 0) {
                  return (
                    <div className="text-center py-8 text-xs text-[#6E6E73]">
                      No recorded sales orders for this customer yet.
                    </div>
                  );
                }

                return (
                  <div className="border border-[#E5E5EA] rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs text-[#1D1D1F]">
                      <thead className="bg-[#F5F5F7] text-[#6E6E73] text-[11px] uppercase tracking-wider font-semibold border-b border-[#E5E5EA]">
                        <tr>
                          <th className="p-3">Date</th>
                          <th className="p-3">Cloth Type</th>
                          <th className="p-3">Total Fee</th>
                          <th className="p-3">Paid</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5EA]">
                        {metrics.custSales.map((sale) => (
                          <tr key={sale.id} className="hover:bg-[#F5F5F7] transition">
                            <td className="p-3 font-medium">{sale.date}</td>
                            <td className="p-3 font-semibold text-[#1D1D1F]">{sale.clothTypeSnapshot}</td>
                            <td className="p-3 font-semibold text-[#1D1D1F]">₹{sale.sellingPrice.toLocaleString('en-IN')}</td>
                            <td className="p-3 text-[#1D7A4C] font-semibold">₹{sale.amountReceived?.toLocaleString('en-IN') || 0}</td>
                            <td className="p-3">
                              <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full ${
                                sale.paymentStatus === 'Paid'
                                  ? 'bg-[#E3F5EA] text-[#1D7A4C]'
                                  : 'bg-[#FDF0ED] text-[#C1553D]'
                              }`}>
                                {sale.paymentStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </>
        )}
      </Modal>

      {/* VENDOR LEDGER MODAL */}
      <Modal isOpen={!!selectedVendForLedger} onClose={() => setSelectedVendForLedger(null)} maxWidthClass="max-w-3xl">
        {selectedVendForLedger && (
          <>
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5EA] shrink-0 mb-4">
              <div>
                <h3 className="font-semibold text-[#1D1D1F] text-lg">
                  {selectedVendForLedger.shopName} — Purchase Ledger
                </h3>
                <p className="text-xs text-[#6E6E73]">{selectedVendForLedger.city} • {selectedVendForLedger.phone}</p>
              </div>
              <button
                onClick={() => setSelectedVendForLedger(null)}
                className="w-8 h-8 rounded-full bg-[#E5E5EA] text-[#1D1D1F] flex items-center justify-center hover:bg-[#D1D1D6] transition cursor-pointer"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4">
              {(() => {
                const metrics = getVendorMetrics(selectedVendForLedger);
                const allItems = [
                  ...metrics.linkedCloths.map(c => ({ type: 'Cloth', name: c.clothType, cost: c.purchaseCost, date: c.purchaseDate, id: c.id })),
                  ...metrics.linkedPaints.map(p => ({ type: 'Paint', name: p.brandName, cost: p.purchaseCost, date: p.purchaseDate, id: p.id })),
                ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                if (allItems.length === 0) {
                  return (
                    <div className="text-center py-8 text-xs text-[#6E6E73]">
                      No purchases linked to this vendor yet.
                    </div>
                  );
                }

                return (
                  <div className="border border-[#E5E5EA] rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs text-[#1D1D1F]">
                      <thead className="bg-[#F5F5F7] text-[#6E6E73] text-[11px] uppercase tracking-wider font-semibold border-b border-[#E5E5EA]">
                        <tr>
                          <th className="p-3">Date</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Item Description</th>
                          <th className="p-3">Cost Paid</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5EA]">
                        {allItems.map((item) => (
                          <tr key={item.id} className="hover:bg-[#F5F5F7] transition">
                            <td className="p-3 font-medium">{item.date}</td>
                            <td className="p-3">
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F0F0F2] text-[#6E6E73]">
                                {item.type}
                              </span>
                            </td>
                            <td className="p-3 font-semibold text-[#1D1D1F]">{item.name}</td>
                            <td className="p-3 font-semibold text-[#1D1D1F]">₹{item.cost.toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </>
        )}
      </Modal>

      {/* Customer Form Modal */}
      <Modal isOpen={showCustModal} onClose={() => setShowCustModal(false)} maxWidthClass="max-w-md">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E5EA] shrink-0 mb-4">
          <h3 className="font-semibold text-[#1D1D1F] text-lg">
            {editingCustId ? 'Edit Customer Profile' : 'New Customer Profile'}
          </h3>
          <button
            onClick={() => setShowCustModal(false)}
            className="w-8 h-8 rounded-full bg-[#E5E5EA] text-[#1D1D1F] flex items-center justify-center hover:bg-[#D1D1D6] transition cursor-pointer"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleCustomerSubmit} className="space-y-4 text-xs sm:text-sm text-[#1D1D1F]">
          <div>
            <label className="text-[11px] font-semibold tracking-wider text-[#8E8E93] uppercase block mb-1">Customer Name *</label>
            <input
              type="text"
              placeholder="e.g. Radhika Patel"
              value={custName}
              onChange={(e) => {
                setCustName(e.target.value);
                if (e.target.value.trim()) setCustNameError('');
              }}
              className={`w-full bg-[#F2F2F7] border px-3.5 py-2.5 rounded-xl font-medium transition ${
                custNameError ? 'border-[#D9552C] focus:ring-[#D9552C]' : 'border-[#D2D2D7] focus:ring-[#C1553D]'
              }`}
            />
            {custNameError && (
              <p className="text-[12px] text-[#D9552C] mt-1 animate-fade-up">{custNameError}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold tracking-wider text-[#8E8E93] uppercase block mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="9876543210"
                value={custPhone}
                onChange={(e) => setCustPhone(e.target.value)}
                className="w-full bg-[#F2F2F7] border border-[#D2D2D7] px-3.5 py-2.5 rounded-xl font-medium focus:ring-2 focus:ring-[#C1553D] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold tracking-wider text-[#8E8E93] uppercase block mb-1">City / Location</label>
              <input
                type="text"
                placeholder="Ahmedabad"
                value={custCity}
                onChange={(e) => setCustCity(e.target.value)}
                className="w-full bg-[#F2F2F7] border border-[#D2D2D7] px-3.5 py-2.5 rounded-xl font-medium focus:ring-2 focus:ring-[#C1553D] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold tracking-wider text-[#8E8E93] uppercase block mb-1">Notes</label>
            <input
              type="text"
              placeholder="e.g. Regular client for raw silk sarees"
              value={custNotes}
              onChange={(e) => setCustNotes(e.target.value)}
              className="w-full bg-[#F2F2F7] border border-[#D2D2D7] px-3.5 py-2.5 rounded-xl focus:ring-2 focus:ring-[#C1553D] focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-[#E5E5EA] flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowCustModal(false)}
              className="btn-secondary px-5 py-2.5 text-xs sm:text-sm font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-6 py-2.5 text-xs sm:text-sm font-medium cursor-pointer"
            >
              Save Profile
            </button>
          </div>
        </form>
      </Modal>

      {/* Vendor Form Modal */}
      <Modal isOpen={showVendModal} onClose={() => setShowVendModal(false)} maxWidthClass="max-w-md">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E5EA] shrink-0 mb-4">
          <h3 className="font-semibold text-[#1D1D1F] text-lg">
            {editingVendId ? 'Edit Vendor Profile' : 'New Vendor Profile'}
          </h3>
          <button
            onClick={() => setShowVendModal(false)}
            className="w-8 h-8 rounded-full bg-[#E5E5EA] text-[#1D1D1F] flex items-center justify-center hover:bg-[#D1D1D6] transition cursor-pointer"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleVendorSubmit} className="space-y-4 text-xs sm:text-sm text-[#1D1D1F]">
          <div>
            <label className="text-[11px] font-semibold tracking-wider text-[#8E8E93] uppercase block mb-1">Shop / Wholesaler Name *</label>
            <input
              type="text"
              placeholder="e.g. Royal Silk Mills"
              value={vendShopName}
              onChange={(e) => {
                setVendShopName(e.target.value);
                if (e.target.value.trim()) setVendShopError('');
              }}
              className={`w-full bg-[#F2F2F7] border px-3.5 py-2.5 rounded-xl font-medium transition ${
                vendShopError ? 'border-[#D9552C] focus:ring-[#D9552C]' : 'border-[#D2D2D7] focus:ring-[#C1553D]'
              }`}
            />
            {vendShopError && (
              <p className="text-[12px] text-[#D9552C] mt-1 animate-fade-up">{vendShopError}</p>
            )}
          </div>

          <div>
            <label className="text-[11px] font-semibold tracking-wider text-[#8E8E93] uppercase block mb-1">Category</label>
            <select
              value={vendCategory}
              onChange={(e) => setVendCategory(e.target.value as any)}
              className="w-full bg-[#F2F2F7] border border-[#D2D2D7] px-3.5 py-2.5 rounded-xl font-medium focus:ring-2 focus:ring-[#C1553D] focus:outline-none"
            >
              <option value="Cloth Wholesaler">Cloth Wholesaler</option>
              <option value="Paint Shop">Paint Shop</option>
              <option value="General Supplier">General Supplier</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold tracking-wider text-[#8E8E93] uppercase block mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="9876543210"
                value={vendPhone}
                onChange={(e) => setVendPhone(e.target.value)}
                className="w-full bg-[#F2F2F7] border border-[#D2D2D7] px-3.5 py-2.5 rounded-xl font-medium focus:ring-2 focus:ring-[#C1553D] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold tracking-wider text-[#8E8E93] uppercase block mb-1">City</label>
              <input
                type="text"
                placeholder="Surat"
                value={vendCity}
                onChange={(e) => setVendCity(e.target.value)}
                className="w-full bg-[#F2F2F7] border border-[#D2D2D7] px-3.5 py-2.5 rounded-xl font-medium focus:ring-2 focus:ring-[#C1553D] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E5E5EA] flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowVendModal(false)}
              className="btn-secondary px-5 py-2.5 text-xs sm:text-sm font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-6 py-2.5 text-xs sm:text-sm font-medium cursor-pointer"
            >
              Save Profile
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
