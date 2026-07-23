import React, { useState } from 'react';
import { 
  Receipt, 
  Plus, 
  Trash2, 
  Edit3, 
  Bus, 
  Truck, 
  Package, 
  Wrench, 
  Coffee, 
  MoreHorizontal,
  Search,
  ArrowUpDown,
  Filter,
  X
} from 'lucide-react';
import { ExpenseEntry, VendorProfile } from '../types';
import { ConfirmPopover } from './ConfirmPopover';
import { useToast } from '../context/ToastContext';
import { Modal } from './Modal';

interface ExpensesViewProps {
  expenses: ExpenseEntry[];
  vendors: VendorProfile[];
  onAddOrUpdateExpense: (expense: ExpenseEntry) => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  vendors,
  onAddOrUpdateExpense,
  onDeleteExpense,
}) => {
  const { showToast } = useToast();
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filters & Sorting state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Form state
  const [category, setCategory] = useState<'Travel' | 'Courier / Shipping' | 'Tools & Equipment' | 'Packaging' | 'Refreshments' | 'Misc'>('Travel');
  const [amount, setAmount] = useState<number | ''>(450);
  const [expenseDate, setExpenseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');

  // Inline validation errors
  const [amountError, setAmountError] = useState<string>('');
  const [descriptionError, setDescriptionError] = useState<string>('');

  const openNewForm = () => {
    setEditingId(null);
    setCategory('Travel');
    setAmount(450);
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setDescription('Bus fare to Surat Market for purchasing raw silk sarees');
    setAmountError('');
    setDescriptionError('');
    setShowAddModal(true);
  };

  const openEditForm = (exp: ExpenseEntry) => {
    setEditingId(exp.id);
    setCategory(exp.category);
    setAmount(exp.amount);
    setExpenseDate(exp.date);
    setDescription(exp.description);
    setAmountError('');
    setDescriptionError('');
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    if (!amount || Number(amount) <= 0) {
      setAmountError('Please enter a valid expense amount');
      hasError = true;
    } else {
      setAmountError('');
    }

    if (!description.trim()) {
      setDescriptionError('Please enter a description or purpose');
      hasError = true;
    } else {
      setDescriptionError('');
    }

    if (hasError) return;

    const newExp: ExpenseEntry = {
      id: editingId || `exp-${Date.now()}`,
      date: expenseDate,
      category,
      amount: Number(amount),
      description: description.trim(),
      createdAt: new Date().toISOString(),
    };

    onAddOrUpdateExpense(newExp);
    showToast(editingId ? 'Expense updated' : 'New expense logged', 'success');
    setShowAddModal(false);
  };

  // Filter & Sort Logic
  const filteredAndSortedExpenses = expenses
    .filter((exp) => {
      const matchesSearch = 
        exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.date.includes(searchTerm);

      const matchesCategory = categoryFilter === 'All' || exp.category === categoryFilter;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'highest') {
        return b.amount - a.amount;
      } else {
        return a.amount - b.amount;
      }
    });

  const totalExpenseSum = expenses.reduce((acc, e) => acc + e.amount, 0);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Travel': return <Bus className="w-4 h-4 text-[#1D1D1F]" />;
      case 'Courier / Shipping': return <Truck className="w-4 h-4 text-[#1D1D1F]" />;
      case 'Packaging': return <Package className="w-4 h-4 text-[#1D1D1F]" />;
      case 'Tools & Equipment': return <Wrench className="w-4 h-4 text-[#1D1D1F]" />;
      case 'Refreshments': return <Coffee className="w-4 h-4 text-[#1D1D1F]" />;
      default: return <MoreHorizontal className="w-4 h-4 text-[#1D1D1F]" />;
    }
  };

  return (
    <div className="space-y-6 text-[#1D1D1F]">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E5E5EA] shadow-xs">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-[#F0F0F2] flex items-center justify-center text-[#C1553D]">
              <Receipt className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-[#1D1D1F]">Misc Expenses</h2>
          </div>
          <p className="text-xs text-[#6E6E73] mt-1">
            Travel, shipping, courier, tools, and studio operational costs
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right pr-4 border-r border-[#E5E5EA]">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-[#8E8E93]">Total Spent</div>
            <div className="text-xl font-semibold tracking-tight text-[#1D1D1F]">₹{totalExpenseSum.toLocaleString('en-IN')}</div>
          </div>
          <button
            onClick={openNewForm}
            className="btn-primary font-medium text-xs sm:text-sm px-4 py-2.5 transition flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Options Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E5EA] shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 text-[#8E8E93] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#F5F5F7] border border-[#D2D2D7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C1553D] text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <div className="flex items-center space-x-1.5 bg-[#F5F5F7] border border-[#D2D2D7] px-3 py-1.5 rounded-xl">
              <Filter className="w-3.5 h-3.5 text-[#8E8E93]" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent font-medium text-[#1D1D1F] focus:outline-none text-xs cursor-pointer"
              >
                <option value="All">All Categories</option>
                <option value="Travel">Travel</option>
                <option value="Courier / Shipping">Courier / Shipping</option>
                <option value="Packaging">Packaging</option>
                <option value="Tools & Equipment">Tools & Equipment</option>
                <option value="Refreshments">Refreshments</option>
                <option value="Misc">Other Misc</option>
              </select>
            </div>

            {/* Sort Datewise / Amountwise */}
            <div className="flex items-center space-x-1.5 bg-[#F5F5F7] border border-[#D2D2D7] px-3 py-1.5 rounded-xl">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#8E8E93]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-medium text-[#1D1D1F] focus:outline-none text-xs cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Amount (High to Low)</option>
                <option value="lowest">Amount (Low to High)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses Table / List */}
      {filteredAndSortedExpenses.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E5E5EA] shadow-xs">
          <Receipt className="w-8 h-8 text-[#8E8E93] mx-auto mb-2" />
          <h3 className="font-semibold text-[#1D1D1F]">No matching expenses found</h3>
          <p className="text-xs text-[#6E6E73] mt-1 max-w-sm mx-auto">
            Adjust search or category filters, or click "Add Expense".
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E5EA] shadow-xs overflow-hidden">
          <div className="divide-y divide-[#E5E5EA]">
            {filteredAndSortedExpenses.map((exp) => (
              <div key={exp.id} className="p-4 hover:bg-[#F5F5F7] transition flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-[#F0F0F2] rounded-xl">
                    {getCategoryIcon(exp.category)}
                  </div>
                  <div>
                    <div className="font-semibold text-[#1D1D1F] text-sm">{exp.description}</div>
                    <div className="text-xs text-[#6E6E73] flex items-center space-x-2 mt-0.5">
                      <span>{exp.category}</span>
                      <span>•</span>
                      <span>{exp.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-base font-semibold text-[#1D1D1F]">₹{exp.amount.toLocaleString('en-IN')}</div>
                  </div>

                  <div className="flex space-x-1">
                    <button
                      onClick={() => openEditForm(exp)}
                      className="p-1.5 text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-lg border border-[#D2D2D7] transition cursor-pointer"
                      title="Edit Expense"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <ConfirmPopover
                      title="Delete this expense entry?"
                      align="right"
                      onConfirm={() => {
                        onDeleteExpense(exp.id);
                        showToast("Expense entry deleted", "success");
                      }}
                    >
                      <button
                        className="p-1.5 text-[#6E6E73] hover:text-[#D9552C] hover:bg-[#FDF0ED] rounded-lg border border-[#D2D2D7] transition cursor-pointer"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </ConfirmPopover>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Expense Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} maxWidthClass="max-w-lg">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E5EA] shrink-0 mb-4">
          <h3 className="font-semibold text-[#1D1D1F] text-lg">
            {editingId ? 'Edit Misc Expense' : 'Log New Misc Expense'}
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
                <label className="text-[11px] font-semibold tracking-wider text-[#8E8E93] uppercase block mb-1">Expense Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-[#F2F2F7] border border-[#D2D2D7] px-3.5 py-2.5 rounded-xl font-medium focus:ring-2 focus:ring-[#C1553D] focus:outline-none"
                >
                  <option value="Travel">Travel (Bus/Train/Auto fare)</option>
                  <option value="Courier / Shipping">Courier / Shipping</option>
                  <option value="Packaging">Packaging Covers & Ribbons</option>
                  <option value="Tools & Equipment">Tools, Frames & Scissors</option>
                  <option value="Refreshments">Refreshments for Clients</option>
                  <option value="Misc">Other Misc Expense</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold tracking-wider text-[#8E8E93] uppercase block mb-1">Amount Spent (₹) *</label>
                  <input
                    type="number"
                    placeholder="450"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value ? Number(e.target.value) : '');
                      if (e.target.value && Number(e.target.value) > 0) setAmountError('');
                    }}
                    className={`w-full bg-[#F2F2F7] border px-3.5 py-2.5 rounded-xl font-semibold text-[#1D1D1F] transition ${
                      amountError ? 'border-[#D9552C] focus:ring-[#D9552C]' : 'border-[#D2D2D7] focus:ring-[#C1553D]'
                    }`}
                  />
                  {amountError && (
                    <p className="text-[12px] text-[#D9552C] mt-1 animate-fade-up">{amountError}</p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-semibold tracking-wider text-[#8E8E93] uppercase block mb-1">Expense Date</label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full bg-[#F2F2F7] border border-[#D2D2D7] px-3.5 py-2.5 rounded-xl font-medium focus:ring-2 focus:ring-[#C1553D] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold tracking-wider text-[#8E8E93] uppercase block mb-1">Description / Purpose *</label>
                <input
                  type="text"
                  placeholder="e.g. Bus fare to Surat Market"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (e.target.value.trim()) setDescriptionError('');
                  }}
                  className={`w-full bg-[#F2F2F7] border px-3.5 py-2.5 rounded-xl transition ${
                    descriptionError ? 'border-[#D9552C] focus:ring-[#D9552C]' : 'border-[#D2D2D7] focus:ring-[#C1553D]'
                  }`}
                />
                {descriptionError && (
                  <p className="text-[12px] text-[#D9552C] mt-1 animate-fade-up">{descriptionError}</p>
                )}
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
