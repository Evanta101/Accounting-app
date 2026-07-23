import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ClothStockView } from './components/ClothStockView';
import { SalesRegisterView } from './components/SalesRegisterView';
import { PaintsView } from './components/PaintsView';
import { ExpensesView } from './components/ExpensesView';
import { ProfilesView } from './components/ProfilesView';
import { ReportsView } from './components/ReportsView';
import { QuestionsModal } from './components/QuestionsModal';
import { ToastProvider } from './context/ToastContext';
import { 
  ClothItem, 
  PaintItem, 
  CustomerProfile, 
  VendorProfile, 
  SaleEntry, 
  ExpenseEntry, 
  BusinessSummary 
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Studio Data States
  const [cloths, setCloths] = useState<ClothItem[]>([]);
  const [paints, setPaints] = useState<PaintItem[]>([]);
  const [sales, setSales] = useState<SaleEntry[]>([]);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [summary, setSummary] = useState<BusinessSummary | null>(null);

  // Modals & Direct Triggers
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState<boolean>(false);
  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState<boolean>(false);
  const [preselectedClothForSale, setPreselectedClothForSale] = useState<ClothItem | null>(null);

  // Fetch initial data from server
  const fetchStudioData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/initial-data');
      if (!res.ok) {
        throw new Error(`Failed to load data: ${res.statusText}`);
      }
      const data = await res.json();
      setCloths(data.cloths || []);
      setPaints(data.paints || []);
      setSales(data.sales || []);
      setExpenses(data.expenses || []);
      setCustomers(data.customers || []);
      setVendors(data.vendors || []);
      setSummary(data.summary || null);
    } catch (err: any) {
      console.error('Error fetching studio data:', err);
      setError('Could not connect to backend server. Retrying...');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudioData();
  }, []);

  // Handlers for Cloth Purchases
  const handleAddOrUpdateCloth = async (item: ClothItem) => {
    try {
      const res = await fetch('/api/cloths', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const data = await res.json();
      if (data.cloths) setCloths(data.cloths);
      if (data.summary) setSummary(data.summary);
    } catch (err) {
      console.error('Failed to save cloth entry:', err);
    }
  };

  const handleDeleteCloth = async (id: string) => {
    try {
      const res = await fetch(`/api/cloths/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.cloths) setCloths(data.cloths);
      if (data.summary) setSummary(data.summary);
    } catch (err) {
      console.error('Failed to delete cloth entry:', err);
    }
  };

  // Handlers for Paints
  const handleAddOrUpdatePaint = async (item: PaintItem) => {
    try {
      const res = await fetch('/api/paints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const data = await res.json();
      if (data.paints) setPaints(data.paints);
      if (data.summary) setSummary(data.summary);
    } catch (err) {
      console.error('Failed to save paint entry:', err);
    }
  };

  const handleDeletePaint = async (id: string) => {
    try {
      const res = await fetch(`/api/paints/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.paints) setPaints(data.paints);
      if (data.summary) setSummary(data.summary);
    } catch (err) {
      console.error('Failed to delete paint entry:', err);
    }
  };

  // Handlers for Sales Register
  const handleAddSale = async (sale: SaleEntry) => {
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sale),
      });
      const data = await res.json();
      if (data.sales) setSales(data.sales);
      if (data.cloths) setCloths(data.cloths);
      if (data.paints) setPaints(data.paints);
      if (data.summary) setSummary(data.summary);
      setIsNewSaleModalOpen(false);
      setPreselectedClothForSale(null);
    } catch (err) {
      console.error('Failed to save sale entry:', err);
    }
  };

  const handleDeleteSale = async (id: string) => {
    try {
      const res = await fetch(`/api/sales/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.sales) setSales(data.sales);
      if (data.cloths) setCloths(data.cloths);
      if (data.summary) setSummary(data.summary);
    } catch (err) {
      console.error('Failed to delete sale entry:', err);
    }
  };

  // Handlers for Misc Expenses
  const handleAddOrUpdateExpense = async (exp: ExpenseEntry) => {
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exp),
      });
      const data = await res.json();
      if (data.expenses) setExpenses(data.expenses);
      if (data.summary) setSummary(data.summary);
    } catch (err) {
      console.error('Failed to save expense entry:', err);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.expenses) setExpenses(data.expenses);
      if (data.summary) setSummary(data.summary);
    } catch (err) {
      console.error('Failed to delete expense entry:', err);
    }
  };

  // Handlers for Customer Profiles
  const handleAddOrUpdateCustomer = async (cust: CustomerProfile) => {
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cust),
      });
      const data = await res.json();
      if (data.customers) setCustomers(data.customers);
    } catch (err) {
      console.error('Failed to save customer profile:', err);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.customers) setCustomers(data.customers);
    } catch (err) {
      console.error('Failed to delete customer profile:', err);
    }
  };

  // Handlers for Vendor Profiles
  const handleAddOrUpdateVendor = async (vend: VendorProfile) => {
    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vend),
      });
      const data = await res.json();
      if (data.vendors) setVendors(data.vendors);
    } catch (err) {
      console.error('Failed to save vendor profile:', err);
    }
  };

  const handleDeleteVendor = async (id: string) => {
    try {
      const res = await fetch(`/api/vendors/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.vendors) setVendors(data.vendors);
    } catch (err) {
      console.error('Failed to delete vendor profile:', err);
    }
  };

  // Reset to initial sample data
  const handleResetData = async () => {
    try {
      const res = await fetch('/api/reset-data', { method: 'POST' });
      const data = await res.json();
      setCloths(data.cloths || []);
      setPaints(data.paints || []);
      setSales(data.sales || []);
      setExpenses(data.expenses || []);
      setCustomers(data.customers || []);
      setVendors(data.vendors || []);
      setSummary(data.summary || null);
    } catch (err) {
      console.error('Failed to reset studio data:', err);
    }
  };

  // Trigger sell on specific cloth item
  const handleInitiateSellCloth = (cloth: ClothItem) => {
    setPreselectedClothForSale(cloth);
    setActiveTab('sales');
    setIsNewSaleModalOpen(true);
  };

  // Mark paint bottle finished directly
  const handleMarkPaintFinished = async (paint: PaintItem) => {
    await handleAddOrUpdatePaint({
      ...paint,
      isFullyUtilized: true,
      fullyUtilizedDate: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] font-sans antialiased flex flex-col">
        {/* Top Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          summary={summary}
          onOpenNewSale={() => {
            setActiveTab('sales');
            setIsNewSaleModalOpen(true);
          }}
          onOpenNewCloth={() => {
            setActiveTab('cloths');
          }}
          onOpenNewPaint={() => {
            setActiveTab('paints');
          }}
          onOpenQuestions={() => setIsQuestionsModalOpen(true)}
          onResetData={handleResetData}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3 text-[#6E6E73]">
              <div className="w-8 h-8 border-3 border-[#C1553D] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium">Loading Kalam Kaari Accounting Ledger...</p>
            </div>
          ) : error ? (
            <div className="bg-white text-[#1d1d1f] border border-[#E5E5EA] p-6 rounded-2xl text-center max-w-md mx-auto my-12 space-y-3 shadow-xs">
              <p className="font-semibold text-[#C1553D]">{error}</p>
              <button
                onClick={fetchStudioData}
                className="px-4 py-2 bg-[#C1553D] text-white font-medium rounded-xl text-xs cursor-pointer hover:bg-[#A84732]"
              >
                Retry Connection
              </button>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  summary={summary}
                  sales={sales}
                  cloths={cloths}
                  paints={paints}
                  onNavigate={setActiveTab}
                  onOpenNewSale={() => {
                    setActiveTab('sales');
                    setIsNewSaleModalOpen(true);
                  }}
                  onOpenNewCloth={() => setActiveTab('cloths')}
                  onOpenNewPaint={() => setActiveTab('paints')}
                  onSellCloth={handleInitiateSellCloth}
                  onMarkPaintFinished={handleMarkPaintFinished}
                />
              )}

              {activeTab === 'cloths' && (
                <ClothStockView
                  cloths={cloths}
                  vendors={vendors}
                  onAddOrUpdateCloth={handleAddOrUpdateCloth}
                  onDeleteCloth={handleDeleteCloth}
                  onSellCloth={handleInitiateSellCloth}
                />
              )}

              {activeTab === 'sales' && (
                <SalesRegisterView
                  sales={sales}
                  cloths={cloths}
                  paints={paints}
                  customers={customers}
                  onAddSale={handleAddSale}
                  onDeleteSale={handleDeleteSale}
                  onAddCustomer={handleAddOrUpdateCustomer}
                  preselectedCloth={preselectedClothForSale}
                  onClearPreselectedCloth={() => setPreselectedClothForSale(null)}
                  isModalOpenExternal={isNewSaleModalOpen}
                  onCloseExternalModal={() => setIsNewSaleModalOpen(false)}
                />
              )}

              {activeTab === 'paints' && (
                <PaintsView
                  paints={paints}
                  vendors={vendors}
                  sales={sales}
                  onAddOrUpdatePaint={handleAddOrUpdatePaint}
                  onDeletePaint={handleDeletePaint}
                />
              )}

              {activeTab === 'expenses' && (
                <ExpensesView
                  expenses={expenses}
                  vendors={vendors}
                  onAddOrUpdateExpense={handleAddOrUpdateExpense}
                  onDeleteExpense={handleDeleteExpense}
                />
              )}

              {activeTab === 'profiles' && (
                <ProfilesView
                  customers={customers}
                  vendors={vendors}
                  sales={sales}
                  cloths={cloths}
                  paints={paints}
                  expenses={expenses}
                  onAddOrUpdateCustomer={handleAddOrUpdateCustomer}
                  onDeleteCustomer={handleDeleteCustomer}
                  onAddOrUpdateVendor={handleAddOrUpdateVendor}
                  onDeleteVendor={handleDeleteVendor}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsView
                  sales={sales}
                  expenses={expenses}
                  cloths={cloths}
                  paints={paints}
                  summary={summary}
                />
              )}
            </>
          )}
        </main>

        {/* Questions Modal */}
        <QuestionsModal
          isOpen={isQuestionsModalOpen}
          onClose={() => setIsQuestionsModalOpen(false)}
        />

        {/* Footer */}
        <footer className="bg-white text-[#6E6E73] border-t border-[#E5E5EA] py-6 text-center text-xs mt-12">
          <p>Kalam Kaari • Artisan Cloth Painting Accounting & Inventory System</p>
        </footer>
      </div>
    </ToastProvider>
  );
}
