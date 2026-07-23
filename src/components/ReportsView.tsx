import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  ShoppingBag, 
  Droplet, 
  Receipt, 
  Tag,
  CreditCard,
  Banknote,
  Landmark,
  Clock,
  Search,
  Filter,
  ArrowUpDown,
  MapPin
} from 'lucide-react';
import { SaleEntry, ExpenseEntry, BusinessSummary, ClothItem, PaintItem } from '../types';

interface ReportsViewProps {
  sales: SaleEntry[];
  expenses: ExpenseEntry[];
  cloths: ClothItem[];
  paints: PaintItem[];
  summary: BusinessSummary | null;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  sales,
  expenses,
  cloths,
  paints,
  summary,
}) => {
  // Period filter: 'All' | 'Today' | 'ThisMonth' | 'Custom'
  const [period, setPeriod] = useState<'All' | 'Today' | 'ThisMonth' | 'Custom'>('All');
  const [startDate, setStartDate] = useState<string>('2026-07-01');
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Itemised Ledger Filter & Sort Controls
  const [ledgerSearch, setLedgerSearch] = useState<string>('');
  const [ledgerPaymentMode, setLedgerPaymentMode] = useState<string>('All');
  const [ledgerClothType, setLedgerClothType] = useState<string>('All');
  const [ledgerCity, setLedgerCity] = useState<string>('All');
  const [ledgerSortBy, setLedgerSortBy] = useState<string>('date_desc');

  // Filter sales & expenses by date range/period
  const filteredSales = sales.filter((s) => {
    if (period === 'All') return true;
    const todayStr = new Date().toISOString().split('T')[0];
    if (period === 'Today') return s.date === todayStr;
    if (period === 'ThisMonth') {
      const sMonth = s.date.substring(0, 7);
      const currentMonth = todayStr.substring(0, 7);
      return sMonth === currentMonth;
    }
    if (period === 'Custom') {
      return s.date >= startDate && s.date <= endDate;
    }
    return true;
  });

  const filteredExpenses = expenses.filter((e) => {
    if (period === 'All') return true;
    const todayStr = new Date().toISOString().split('T')[0];
    if (period === 'Today') return e.date === todayStr;
    if (period === 'ThisMonth') {
      const eMonth = e.date.substring(0, 7);
      const currentMonth = todayStr.substring(0, 7);
      return eMonth === currentMonth;
    }
    if (period === 'Custom') {
      return e.date >= startDate && e.date <= endDate;
    }
    return true;
  });

  // Calculate Periodwise Income Statement
  const periodRevenue = filteredSales.reduce((acc, s) => acc + s.sellingPrice, 0);
  const periodClothCost = filteredSales.reduce((acc, s) => acc + s.clothPurchaseCost, 0);
  const periodPaintCost = filteredSales.reduce((acc, s) => acc + s.paintCostAllocated, 0);
  const periodMiscExpense = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

  const periodNetProfit = periodRevenue - periodClothCost - periodPaintCost - periodMiscExpense;
  const periodMarginPct = periodRevenue > 0 ? (periodNetProfit / periodRevenue) * 100 : 0;

  // Payment Modes Breakdown Calculations
  const upiSales = filteredSales.filter(s => s.paymentMode === 'UPI' && s.paymentStatus !== 'Pending');
  const upiTotal = upiSales.reduce((acc, s) => acc + (s.amountReceived || s.sellingPrice), 0);

  const cashSales = filteredSales.filter(s => s.paymentMode === 'Cash' && s.paymentStatus !== 'Pending');
  const cashTotal = cashSales.reduce((acc, s) => acc + (s.amountReceived || s.sellingPrice), 0);

  const bankSales = filteredSales.filter(s => s.paymentMode === 'Bank Transfer' && s.paymentStatus !== 'Pending');
  const bankTotal = bankSales.reduce((acc, s) => acc + (s.amountReceived || s.sellingPrice), 0);

  const otherSales = filteredSales.filter(s => s.paymentMode === 'Other' && s.paymentStatus !== 'Pending');
  const otherTotal = otherSales.reduce((acc, s) => acc + (s.amountReceived || s.sellingPrice), 0);

  const pendingSales = filteredSales.filter(s => s.sellingPrice > (s.amountReceived || 0));
  const pendingTotal = pendingSales.reduce((acc, s) => acc + (s.sellingPrice - (s.amountReceived || 0)), 0);

  // Extract unique cities (deduplicated case-insensitively) and cloth types for drop-downs
  const cityMap = new Map<string, string>();
  sales.forEach((s) => {
    if (!s.location) return;
    const rawCity = s.location.split(',').pop()?.trim() || s.location.trim();
    if (!rawCity) return;
    const lowerKey = rawCity.toLowerCase();
    if (!cityMap.has(lowerKey)) {
      cityMap.set(lowerKey, rawCity);
    } else {
      const existing = cityMap.get(lowerKey)!;
      if (existing === existing.toLowerCase() && rawCity !== rawCity.toLowerCase()) {
        cityMap.set(lowerKey, rawCity);
      }
    }
  });

  const uniqueCities = Array.from(cityMap.values()).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  );

  const uniqueClothTypes = Array.from(
    new Set(sales.map(s => s.clothTypeSnapshot).filter(Boolean))
  ).sort();

  // Apply Ledger Filters & Sorting
  let ledgerSales = filteredSales.filter(s => {
    // Search match
    const searchMatch = !ledgerSearch.trim() || 
      s.customerName.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      s.location.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      s.clothTypeSnapshot.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      (s.notes && s.notes.toLowerCase().includes(ledgerSearch.toLowerCase()));

    // Payment Mode
    const modeMatch = ledgerPaymentMode === 'All' || 
      (ledgerPaymentMode === 'Pending' ? s.paymentStatus === 'Pending' : s.paymentMode === ledgerPaymentMode);

    // Cloth Type
    const clothMatch = ledgerClothType === 'All' || s.clothTypeSnapshot.includes(ledgerClothType);

    // City
    const cityMatch = ledgerCity === 'All' || s.location.toLowerCase().includes(ledgerCity.toLowerCase());

    return searchMatch && modeMatch && clothMatch && cityMatch;
  });

  // Sort
  ledgerSales = [...ledgerSales].sort((a, b) => {
    const profitA = a.sellingPrice - a.clothPurchaseCost - a.paintCostAllocated;
    const profitB = b.sellingPrice - b.clothPurchaseCost - b.paintCostAllocated;

    if (ledgerSortBy === 'date_desc') return b.date.localeCompare(a.date);
    if (ledgerSortBy === 'date_asc') return a.date.localeCompare(b.date);
    if (ledgerSortBy === 'profit_desc') return profitB - profitA;
    if (ledgerSortBy === 'profit_asc') return profitA - profitB;
    if (ledgerSortBy === 'price_desc') return b.sellingPrice - a.sellingPrice;
    if (ledgerSortBy === 'customer_asc') return a.customerName.localeCompare(b.customerName);
    return 0;
  });

  // Totals across filtered ledger
  const ledgerTotalRevenue = ledgerSales.reduce((acc, s) => acc + s.sellingPrice, 0);
  const ledgerTotalClothCost = ledgerSales.reduce((acc, s) => acc + s.clothPurchaseCost, 0);
  const ledgerTotalPaintCost = ledgerSales.reduce((acc, s) => acc + s.paintCostAllocated, 0);
  const ledgerTotalProfit = ledgerTotalRevenue - ledgerTotalClothCost - ledgerTotalPaintCost;

  // CSV Export Handler
  const exportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Sale Date,Customer,Location,Cloth Type,Fabric,Selling Price (INR),Cloth Cost (INR),Paint Alloc Cost (INR),Net Profit (INR),Payment Mode,Payment Status\n';

    ledgerSales.forEach((s) => {
      const profit = s.sellingPrice - s.clothPurchaseCost - s.paintCostAllocated;
      csvContent += `"${s.date}","${s.customerName}","${s.location}","${s.clothTypeSnapshot}","${s.fabricCategorySnapshot || 'N/A'}",${s.sellingPrice},${s.clothPurchaseCost},${s.paintCostAllocated},${profit},"${s.paymentMode}","${s.paymentStatus}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Filtered_Sales_Report_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-[#1D1D1F]">
      {/* Top Controls & Print / CSV */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E5EA] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[#1D1D1F]">Profit & Reports</h2>
          <p className="text-xs text-[#6E6E73] mt-1">
            Income statements, payment mode breakdowns, and itemized profit ledgers
          </p>
        </div>

        {/* Period Selector & Export */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#F0F0F2] p-1 rounded-xl flex items-center space-x-1 text-xs">
            {(['All', 'Today', 'ThisMonth', 'Custom'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  period === p ? 'bg-white text-[#1D1D1F] shadow-xs font-semibold' : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                }`}
              >
                {p === 'ThisMonth' ? 'This Month' : p}
              </button>
            ))}
          </div>

          {period === 'Custom' && (
            <div className="flex items-center space-x-1 text-xs">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-[#F5F5F7] border border-[#D2D2D7] px-2.5 py-1.5 rounded-xl text-xs"
              />
              <span className="text-[#8E8E93]">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-[#F5F5F7] border border-[#D2D2D7] px-2.5 py-1.5 rounded-xl text-xs"
              />
            </div>
          )}

          <div className="flex items-center space-x-2 border-l border-[#E5E5EA] pl-3">
            <button
              onClick={() => {
                window.open('/api/export-excel', '_blank');
              }}
              className="bg-[#2F8F6E] hover:bg-[#237055] text-white font-medium text-xs px-3.5 py-1.5 rounded-xl transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
              title="Download 7-Sheet Complete Excel Ledger (.xlsx)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Full Excel (.xlsx)</span>
            </button>
            <button
              onClick={exportCSV}
              className="btn-primary font-medium text-xs px-3.5 py-1.5 rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="btn-secondary font-medium text-xs px-3.5 py-1.5 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>

      {/* Income Statement Light Apple-Style Summary Card */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5E5EA] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E5E5EA] pb-4 gap-2">
          <div>
            <div className="text-[11px] text-[#C1553D] font-semibold uppercase tracking-wider">Income Statement ({period})</div>
            <h3 className="text-2xl font-semibold tracking-tight text-[#1D1D1F]">Financial Summary</h3>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-xs text-[#6E6E73]">Net Period Profit</div>
            <div className={`text-3xl font-semibold tracking-tight ${periodNetProfit >= 0 ? 'text-[#136C3F]' : 'text-[#D9552C]'}`}>
              ₹{periodNetProfit.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-[#136C3F] font-semibold">{periodMarginPct.toFixed(1)}% Net Margin</div>
          </div>
        </div>

        {/* Detailed Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Revenue */}
          <div className="wash-terracotta p-4 rounded-2xl border border-[#E5E5EA] space-y-1">
            <div className="text-[#6E6E73] font-medium flex items-center justify-between">
              <span>Gross Sales Revenue</span>
              <Tag className="w-4 h-4 text-[#C1553D]" />
            </div>
            <div className="text-xl font-semibold text-[#C1553D]">₹{periodRevenue.toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-[#6E6E73]">{filteredSales.length} saree sales</div>
          </div>

          {/* Cloth COGS */}
          <div className="wash-gold p-4 rounded-2xl border border-[#E5E5EA] space-y-1">
            <div className="text-[#6E6E73] font-medium flex items-center justify-between">
              <span>(-) Cloth Purchase COGS</span>
              <ShoppingBag className="w-4 h-4 text-[#E8A93B]" />
            </div>
            <div className="text-xl font-semibold text-[#C97D1F]">-₹{periodClothCost.toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-[#6E6E73]">Direct inventory cost</div>
          </div>

          {/* Paint Cost */}
          <div className="wash-plum p-4 rounded-2xl border border-[#E5E5EA] space-y-1">
            <div className="text-[#6E6E73] font-medium flex items-center justify-between">
              <span>(-) Paint Allocation</span>
              <Droplet className="w-4 h-4 text-[#9B3D6B]" />
            </div>
            <div className="text-xl font-semibold text-[#9B3D6B]">-₹{periodPaintCost.toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-[#6E6E73]">Pro-rated paint usage</div>
          </div>

          {/* Misc Expenses */}
          <div className="wash-coral p-4 rounded-2xl border border-[#E5E5EA] space-y-1">
            <div className="text-[#6E6E73] font-medium flex items-center justify-between">
              <span>(-) Misc Expenses</span>
              <Receipt className="w-4 h-4 text-[#D9552C]" />
            </div>
            <div className="text-xl font-semibold text-[#D9552C]">-₹{periodMiscExpense.toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-[#6E6E73]">Travel, courier, shipping</div>
          </div>
        </div>
      </div>

      {/* Payment Modes Breakdown Section (Cash, UPI, Bank Transfer, Pending Dues) */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5E5EA] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E5EA] pb-3">
          <div>
            <h3 className="font-semibold text-[#1D1D1F] text-base">Payment Mode Breakdown</h3>
            <p className="text-xs text-[#6E6E73]">Separate collection reports for UPI, Cash, Bank Transfer & Pending Customer Dues</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#F0F0F2] text-[#1D1D1F]">
            ₹{periodRevenue.toLocaleString('en-IN')} Gross Total
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* UPI Card */}
          <div 
            onClick={() => setLedgerPaymentMode(ledgerPaymentMode === 'UPI' ? 'All' : 'UPI')}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              ledgerPaymentMode === 'UPI' ? 'bg-[#EEF4FF] border-[#2563EB] shadow-xs' : 'bg-[#F8FAFC] border-[#E2E8F0] hover:bg-[#F1F5F9]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-[#1E3A8A]">UPI Payment</span>
              <CreditCard className="w-4 h-4 text-[#2563EB]" />
            </div>
            <div className="text-xl font-bold text-[#1E40AF]">₹{upiTotal.toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-[#475569] mt-1 flex justify-between items-center">
              <span>{upiSales.length} Transactions</span>
              <span className="font-semibold">{periodRevenue > 0 ? ((upiTotal / periodRevenue) * 100).toFixed(0) : 0}%</span>
            </div>
          </div>

          {/* Cash Card */}
          <div 
            onClick={() => setLedgerPaymentMode(ledgerPaymentMode === 'Cash' ? 'All' : 'Cash')}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              ledgerPaymentMode === 'Cash' ? 'bg-[#ECFDF5] border-[#059669] shadow-xs' : 'bg-[#F8FAFC] border-[#E2E8F0] hover:bg-[#F1F5F9]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-[#065F46]">Cash Payment</span>
              <Banknote className="w-4 h-4 text-[#059669]" />
            </div>
            <div className="text-xl font-bold text-[#047857]">₹{cashTotal.toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-[#475569] mt-1 flex justify-between items-center">
              <span>{cashSales.length} Transactions</span>
              <span className="font-semibold">{periodRevenue > 0 ? ((cashTotal / periodRevenue) * 100).toFixed(0) : 0}%</span>
            </div>
          </div>

          {/* Bank Transfer Card */}
          <div 
            onClick={() => setLedgerPaymentMode(ledgerPaymentMode === 'Bank Transfer' ? 'All' : 'Bank Transfer')}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              ledgerPaymentMode === 'Bank Transfer' ? 'bg-[#F5F3FF] border-[#7C3AED] shadow-xs' : 'bg-[#F8FAFC] border-[#E2E8F0] hover:bg-[#F1F5F9]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-[#5B21B6]">Bank Transfer</span>
              <Landmark className="w-4 h-4 text-[#7C3AED]" />
            </div>
            <div className="text-xl font-bold text-[#6D28D9]">₹{bankTotal.toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-[#475569] mt-1 flex justify-between items-center">
              <span>{bankSales.length} Transactions</span>
              <span className="font-semibold">{periodRevenue > 0 ? ((bankTotal / periodRevenue) * 100).toFixed(0) : 0}%</span>
            </div>
          </div>

          {/* Other / Cheque */}
          <div 
            onClick={() => setLedgerPaymentMode(ledgerPaymentMode === 'Other' ? 'All' : 'Other')}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              ledgerPaymentMode === 'Other' ? 'bg-[#FFF7ED] border-[#EA580C] shadow-xs' : 'bg-[#F8FAFC] border-[#E2E8F0] hover:bg-[#F1F5F9]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-[#9A3412]">Other / Cheque</span>
              <Tag className="w-4 h-4 text-[#EA580C]" />
            </div>
            <div className="text-xl font-bold text-[#C2410C]">₹{otherTotal.toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-[#475569] mt-1 flex justify-between items-center">
              <span>{otherSales.length} Transactions</span>
              <span className="font-semibold">{periodRevenue > 0 ? ((otherTotal / periodRevenue) * 100).toFixed(0) : 0}%</span>
            </div>
          </div>

          {/* Outstanding Pending Dues Card */}
          <div 
            onClick={() => setLedgerPaymentMode(ledgerPaymentMode === 'Pending' ? 'All' : 'Pending')}
            className={`p-4 rounded-2xl border cursor-pointer transition ${
              ledgerPaymentMode === 'Pending' ? 'bg-[#FEF2F2] border-[#DC2626] shadow-xs' : 'bg-[#FFF5F5] border-[#FCA5A5] hover:bg-[#FEE2E2]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-[#991B1B]">Pending Dues</span>
              <Clock className="w-4 h-4 text-[#DC2626]" />
            </div>
            <div className="text-xl font-bold text-[#B91C1C]">₹{pendingTotal.toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-[#991B1B] mt-1 flex justify-between items-center">
              <span>{pendingSales.length} Pending Sales</span>
              <span className="font-bold">UNPAID</span>
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Saree Profit Ledger with Integrated Sort & Multi-Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] shadow-xs p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-[#1D1D1F] text-base">Itemized Saree Profit Ledger</h3>
            <p className="text-xs text-[#6E6E73]">Per-saree profitability with integrated date, payment mode, fabric, and city sorting</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold bg-[#F0F0F2] text-[#1D1D1F] px-3 py-1 rounded-full">
              {ledgerSales.length} Matching Orders
            </span>
            {(ledgerPaymentMode !== 'All' || ledgerClothType !== 'All' || ledgerCity !== 'All' || ledgerSearch) && (
              <button
                onClick={() => {
                  setLedgerSearch('');
                  setLedgerPaymentMode('All');
                  setLedgerClothType('All');
                  setLedgerCity('All');
                  setLedgerSortBy('date_desc');
                }}
                className="text-xs font-medium text-[#C1553D] hover:underline cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Sophisticated & Simple Integrated Filter Controls Bar */}
        <div className="bg-[#F5F5F7] p-3.5 rounded-2xl border border-[#E5E5EA] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8E8E93] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search customer, item, city..."
              value={ledgerSearch}
              onChange={(e) => setLedgerSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#D2D2D7] rounded-xl text-xs focus:ring-2 focus:ring-[#C1553D] focus:outline-none"
            />
          </div>

          {/* Sort By Select */}
          <div className="flex items-center space-x-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#8E8E93] shrink-0" />
            <select
              value={ledgerSortBy}
              onChange={(e) => setLedgerSortBy(e.target.value)}
              className="w-full bg-white border border-[#D2D2D7] px-2.5 py-1.5 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#C1553D] focus:outline-none"
            >
              <option value="date_desc">Date (Newest First)</option>
              <option value="date_asc">Date (Oldest First)</option>
              <option value="profit_desc">Net Profit (High to Low)</option>
              <option value="profit_asc">Net Profit (Low to High)</option>
              <option value="price_desc">Selling Price (High to Low)</option>
              <option value="customer_asc">Customer Name (A-Z)</option>
            </select>
          </div>

          {/* Payment Mode Filter */}
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-[#8E8E93] shrink-0" />
            <select
              value={ledgerPaymentMode}
              onChange={(e) => setLedgerPaymentMode(e.target.value)}
              className="w-full bg-white border border-[#D2D2D7] px-2.5 py-1.5 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#C1553D] focus:outline-none"
            >
              <option value="All">All Payment Modes</option>
              <option value="UPI">UPI Payment</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Other">Other / Cheque</option>
              <option value="Pending">Pending Dues</option>
            </select>
          </div>

          {/* Cloth / Fabric Type Filter */}
          <div>
            <select
              value={ledgerClothType}
              onChange={(e) => setLedgerClothType(e.target.value)}
              className="w-full bg-white border border-[#D2D2D7] px-2.5 py-1.5 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#C1553D] focus:outline-none"
            >
              <option value="All">All Cloth / Fabrics</option>
              {uniqueClothTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* City / Location Filter */}
          <div className="flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#8E8E93] shrink-0" />
            <select
              value={ledgerCity}
              onChange={(e) => setLedgerCity(e.target.value)}
              className="w-full bg-white border border-[#D2D2D7] px-2.5 py-1.5 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#C1553D] focus:outline-none"
            >
              <option value="All">All Cities / Locations</option>
              {uniqueCities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Itemized Table */}
        {ledgerSales.length === 0 ? (
          <div className="p-8 text-center bg-[#F5F5F7] rounded-2xl border border-[#E5E5EA]">
            <p className="font-semibold text-[#1D1D1F] text-sm">No sales entries match the selected filters</p>
            <p className="text-xs text-[#6E6E73] mt-1">Try resetting the payment mode, city, or date filters above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs text-[#1D1D1F]">
              <thead>
                <tr className="border-b border-[#E5E5EA] bg-[#F5F5F7] text-[#6E6E73] text-[11px] uppercase tracking-wider font-semibold">
                  <th className="p-3">Date & Customer</th>
                  <th className="p-3">Cloth Type & Source</th>
                  <th className="p-3 text-center">Payment Mode</th>
                  <th className="p-3 text-right">Selling Price</th>
                  <th className="p-3 text-right">Cloth Cost</th>
                  <th className="p-3 text-right">Paint Cost</th>
                  <th className="p-3 text-right">Net Profit</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5EA]">
                {ledgerSales.map((sale) => {
                  const profit = sale.sellingPrice - sale.clothPurchaseCost - sale.paintCostAllocated;
                  const margin = sale.sellingPrice > 0 ? (profit / sale.sellingPrice) * 100 : 0;

                  return (
                    <tr key={sale.id} className="hover:bg-[#F5F5F7] transition">
                      <td className="p-3">
                        <div className="font-semibold text-[#1D1D1F]">{sale.customerName}</div>
                        <div className="text-[11px] text-[#6E6E73]">{sale.date} • {sale.location}</div>
                      </td>

                      <td className="p-3">
                        <div className="font-medium text-[#1D1D1F]">{sale.clothTypeSnapshot}</div>
                        {sale.isCustomerCloth ? (
                          <span className="text-[10px] text-[#6E6E73]">Customer's Fabric</span>
                        ) : (
                          <span className="text-[10px] text-[#C1553D]">Studio Inventory</span>
                        )}
                      </td>

                      <td className="p-3 text-center">
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full inline-block ${
                          sale.paymentMode === 'UPI' ? 'bg-[#EEF4FF] text-[#2563EB]' :
                          sale.paymentMode === 'Cash' ? 'bg-[#ECFDF5] text-[#059669]' :
                          sale.paymentMode === 'Bank Transfer' ? 'bg-[#F5F3FF] text-[#7C3AED]' :
                          'bg-[#FFF7ED] text-[#EA580C]'
                        }`}>
                          {sale.paymentMode}
                        </span>
                      </td>

                      <td className="p-3 text-right font-semibold text-[#1D1D1F]">
                        ₹{sale.sellingPrice.toLocaleString('en-IN')}
                      </td>

                      <td className="p-3 text-right text-[#6E6E73]">
                        ₹{sale.clothPurchaseCost}
                      </td>

                      <td className="p-3 text-right text-[#6E6E73]">
                        ₹{sale.paintCostAllocated}
                      </td>

                      <td className="p-3 text-right">
                        <div className="font-semibold text-[#136C3F]">+₹{profit.toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-[#8E8E93]">{margin.toFixed(1)}% margin</div>
                      </td>

                      <td className="p-3 text-center">
                        <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full inline-block ${
                          sale.paymentStatus === 'Paid'
                            ? 'bg-[#E3F5EA] text-[#1D7A4C]'
                            : 'bg-[#FDF0ED] text-[#C1553D]'
                        }`}>
                          {sale.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Table Summary Footer */}
              <tfoot>
                <tr className="border-t-2 border-[#E5E5EA] bg-[#F8FAFC] font-semibold text-xs">
                  <td colSpan={3} className="p-3 text-[#1D1D1F]">
                    Ledger Total ({ledgerSales.length} items)
                  </td>
                  <td className="p-3 text-right text-[#C1553D]">
                    ₹{ledgerTotalRevenue.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right text-[#C97D1F]">
                    -₹{ledgerTotalClothCost.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right text-[#9B3D6B]">
                    -₹{ledgerTotalPaintCost.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 text-right text-[#136C3F]">
                    +₹{ledgerTotalProfit.toLocaleString('en-IN')}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
