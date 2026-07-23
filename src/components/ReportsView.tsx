import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  ShoppingBag, 
  Droplet, 
  Receipt, 
  Tag
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

  // Filter sales & expenses by date
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

  // CSV Export Handler
  const exportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Sale Date,Customer,Location,Cloth Type,Fabric,Selling Price (INR),Cloth Cost (INR),Paint Alloc Cost (INR),Net Profit (INR),Payment Status\n';

    filteredSales.forEach((s) => {
      const profit = s.sellingPrice - s.clothPurchaseCost - s.paintCostAllocated;
      csvContent += `"${s.date}","${s.customerName}","${s.location}","${s.clothTypeSnapshot}","${s.fabricCategorySnapshot || 'N/A'}",${s.sellingPrice},${s.clothPurchaseCost},${s.paintCostAllocated},${profit},"${s.paymentStatus}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Profit_Report_${period}.csv`);
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
            Income statements, profit breakdown, and exportable financial summaries
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
              <span>Sales CSV</span>
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

      {/* Itemized Per-Saree Profit Register */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[#1D1D1F] text-base">Itemized Saree Profit Ledger</h3>
            <p className="text-xs text-[#6E6E73]">Sales breakdown with cloth cost, paint allocation & net margin</p>
          </div>
          <span className="text-xs font-medium bg-[#F0F0F2] text-[#1D1D1F] px-3 py-1 rounded-full">
            {filteredSales.length} Entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs text-[#1D1D1F]">
            <thead>
              <tr className="border-b border-[#E5E5EA] bg-[#F5F5F7] text-[#6E6E73] text-[11px] uppercase tracking-wider font-semibold">
                <th className="p-3">Date & Customer</th>
                <th className="p-3">Cloth Type & Source</th>
                <th className="p-3 text-right">Selling Price</th>
                <th className="p-3 text-right">Cloth Cost</th>
                <th className="p-3 text-right">Paint Cost</th>
                <th className="p-3 text-right">Net Profit</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5EA]">
              {filteredSales.map((sale) => {
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
                      <div className="font-semibold text-[#1D7A4C]">+₹{profit.toLocaleString('en-IN')}</div>
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
          </table>
        </div>
      </div>
    </div>
  );
};
