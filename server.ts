import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { 
  ClothItem, 
  PaintItem, 
  CustomerProfile, 
  VendorProfile, 
  SaleEntry, 
  ExpenseEntry, 
  BusinessSummary 
} from './src/types';
import { 
  initialCloths, 
  initialPaints, 
  initialSales, 
  initialExpenses, 
  initialCustomers, 
  initialVendors 
} from './src/server/sampleData';

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DATA_FILE = path.join(DATA_DIR, 'studio_data.json');
const OLD_DATA_FILE = path.join(process.cwd(), 'studio_data.json');

// In-memory data store with file persistence
let cloths: ClothItem[] = [];
let paints: PaintItem[] = [];
let sales: SaleEntry[] = [];
let expenses: ExpenseEntry[] = [];
let customers: CustomerProfile[] = [];
let vendors: VendorProfile[] = [];

function loadData() {
  try {
    const targetFile = fs.existsSync(DATA_FILE) ? DATA_FILE : (fs.existsSync(OLD_DATA_FILE) ? OLD_DATA_FILE : null);
    if (targetFile) {
      const raw = fs.readFileSync(targetFile, 'utf-8');
      const parsed = JSON.parse(raw);
      cloths = parsed.cloths || initialCloths;
      paints = parsed.paints || initialPaints;
      sales = parsed.sales || initialSales;
      expenses = parsed.expenses || initialExpenses;
      customers = parsed.customers || initialCustomers;
      vendors = parsed.vendors || initialVendors;
    } else {
      resetToDefaultData();
    }
  } catch (err) {
    console.error('Error loading stored JSON data, falling back to initial defaults:', err);
    resetToDefaultData();
  }
}

function saveData() {
  try {
    const data = { cloths, paints, sales, expenses, customers, vendors };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing studio_data.json:', err);
  }
}

function resetToDefaultData() {
  cloths = [...initialCloths];
  paints = [...initialPaints];
  sales = [...initialSales];
  expenses = [...initialExpenses];
  customers = [...initialCustomers];
  vendors = [...initialVendors];
  saveData();
}

function calculateSummary(): BusinessSummary {
  const totalRevenue = sales.reduce((acc, s) => acc + (s.sellingPrice || 0), 0);
  const totalClothCostSold = sales.reduce((acc, s) => acc + (s.clothPurchaseCost || 0), 0);
  const totalPaintCostAllocated = sales.reduce((acc, s) => acc + (s.paintCostAllocated || 0), 0);
  const totalMiscExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  
  const netProfit = totalRevenue - totalClothCostSold - totalPaintCostAllocated - totalMiscExpenses;
  const profitMarginPct = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const inStockCloths = cloths.filter(c => c.status === 'In Stock');
  const inStockClothValue = inStockCloths.reduce((acc, c) => acc + (c.purchaseCost || 0), 0);
  
  const pendingSales = sales.filter(s => (s.sellingPrice - (s.amountReceived || 0)) > 0);
  const totalPendingCustomerDues = pendingSales.reduce((acc, s) => {
    const pending = s.sellingPrice - (s.amountReceived || 0);
    return acc + (pending > 0 ? pending : 0);
  }, 0);
  const pendingDuesCount = pendingSales.length;

  const activePaintsCount = paints.filter(p => !p.isFullyUtilized).length;

  return {
    totalRevenue,
    totalClothCostSold,
    totalPaintCostAllocated,
    totalMiscExpenses,
    netProfit,
    profitMarginPct,
    inStockClothValue,
    inStockClothCount: inStockCloths.length,
    totalPendingCustomerDues,
    pendingDuesCount,
    activePaintsCount,
  };
}

async function startServer() {
  loadData();

  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/initial-data', (req, res) => {
    res.json({
      cloths,
      paints,
      sales,
      expenses,
      customers,
      vendors,
      summary: calculateSummary(),
    });
  });

  // Cloths CRUD
  app.post('/api/cloths', (req, res) => {
    const item: ClothItem = req.body;
    if (!item.id) {
      item.id = `cloth-${Date.now()}`;
      item.createdAt = new Date().toISOString();
      cloths.unshift(item);
    } else {
      const idx = cloths.findIndex(c => c.id === item.id);
      if (idx !== -1) {
        cloths[idx] = { ...cloths[idx], ...item };
      } else {
        cloths.unshift(item);
      }
    }
    saveData();
    res.json({ success: true, item, cloths, summary: calculateSummary() });
  });

  app.delete('/api/cloths/:id', (req, res) => {
    cloths = cloths.filter(c => c.id !== req.params.id);
    saveData();
    res.json({ success: true, cloths, summary: calculateSummary() });
  });

  // Paints CRUD
  app.post('/api/paints', (req, res) => {
    const item: PaintItem = req.body;
    if (!item.id) {
      item.id = `paint-${Date.now()}`;
      item.createdAt = new Date().toISOString();
      item.timesUsedCount = item.timesUsedCount || 0;
      item.linkedSaleIds = item.linkedSaleIds || [];
      paints.unshift(item);
    } else {
      const idx = paints.findIndex(p => p.id === item.id);
      if (idx !== -1) {
        paints[idx] = { ...paints[idx], ...item };
      } else {
        paints.unshift(item);
      }
    }
    saveData();
    res.json({ success: true, item, paints, summary: calculateSummary() });
  });

  app.delete('/api/paints/:id', (req, res) => {
    paints = paints.filter(p => p.id !== req.params.id);
    saveData();
    res.json({ success: true, paints, summary: calculateSummary() });
  });

  // Sales Entry (Linking, paint allocation, customer dues)
  app.post('/api/sales', (req, res) => {
    const sale: SaleEntry = req.body;
    if (!sale.id) {
      sale.id = `sale-${Date.now()}`;
      sale.createdAt = new Date().toISOString();
    }

    // 1. Check cloth linkage
    if (!sale.isCustomerCloth && sale.linkedClothId) {
      const cloth = cloths.find(c => c.id === sale.linkedClothId);
      if (cloth) {
        cloth.status = 'Sold';
        sale.clothPurchaseCost = cloth.purchaseCost;
        sale.clothTypeSnapshot = `${cloth.clothType} (${cloth.fabricCategory})`;
        sale.fabricCategorySnapshot = cloth.fabricCategory;
      }
    } else {
      sale.clothPurchaseCost = 0;
      sale.clothTypeSnapshot = sale.clothTypeSnapshot || "Customer's Cloth";
    }

    // 2. Link Paint usage & calculate paint cost allocated
    let totalAllocatedPaintCost = 0;
    if (sale.paintIdsUsed && sale.paintIdsUsed.length > 0) {
      sale.paintNamesSnapshot = [];
      sale.paintIdsUsed.forEach(pId => {
        const paint = paints.find(p => p.id === pId);
        if (paint) {
          if (!paint.linkedSaleIds.includes(sale.id)) {
            paint.linkedSaleIds.push(sale.id);
            paint.timesUsedCount = paint.linkedSaleIds.length;
          }
          sale.paintNamesSnapshot?.push(paint.brandName);

          // Calculate bottle contribution: bottle cost divided by estimated or actual usages
          const share = paint.purchaseCost / Math.max(1, paint.timesUsedCount);
          totalAllocatedPaintCost += share;
        }
      });
    }
    sale.paintCostAllocated = Math.round(totalAllocatedPaintCost);

    // 3. Mark finished paints if selected
    if (sale.markPaintsFinished && sale.markPaintsFinished.length > 0) {
      sale.markPaintsFinished.forEach(pId => {
        const paint = paints.find(p => p.id === pId);
        if (paint) {
          paint.isFullyUtilized = true;
          paint.fullyUtilizedDate = sale.date;
        }
      });
    }

    // Add or update sale in list
    const idx = sales.findIndex(s => s.id === sale.id);
    if (idx !== -1) {
      sales[idx] = sale;
    } else {
      sales.unshift(sale);
    }

    saveData();
    res.json({
      success: true,
      sale,
      sales,
      cloths,
      paints,
      summary: calculateSummary(),
    });
  });

  app.delete('/api/sales/:id', (req, res) => {
    const sale = sales.find(s => s.id === req.params.id);
    if (sale && !sale.isCustomerCloth && sale.linkedClothId) {
      const cloth = cloths.find(c => c.id === sale.linkedClothId);
      if (cloth) {
        cloth.status = 'In Stock';
      }
    }
    sales = sales.filter(s => s.id !== req.params.id);
    saveData();
    res.json({ success: true, sales, cloths, summary: calculateSummary() });
  });

  // Expenses CRUD
  app.post('/api/expenses', (req, res) => {
    const exp: ExpenseEntry = req.body;
    if (!exp.id) {
      exp.id = `exp-${Date.now()}`;
      exp.createdAt = new Date().toISOString();
      expenses.unshift(exp);
    } else {
      const idx = expenses.findIndex(e => e.id === exp.id);
      if (idx !== -1) {
        expenses[idx] = { ...expenses[idx], ...exp };
      } else {
        expenses.unshift(exp);
      }
    }
    saveData();
    res.json({ success: true, exp, expenses, summary: calculateSummary() });
  });

  app.delete('/api/expenses/:id', (req, res) => {
    expenses = expenses.filter(e => e.id !== req.params.id);
    saveData();
    res.json({ success: true, expenses, summary: calculateSummary() });
  });

  // Customer Profiles
  app.post('/api/customers', (req, res) => {
    const cust: CustomerProfile = req.body;
    if (!cust.id) {
      cust.id = `cust-${Date.now()}`;
      cust.createdAt = new Date().toISOString();
      customers.unshift(cust);
    } else {
      const idx = customers.findIndex(c => c.id === cust.id);
      if (idx !== -1) {
        customers[idx] = { ...customers[idx], ...cust };
      } else {
        customers.unshift(cust);
      }
    }
    saveData();
    res.json({ success: true, customer: cust, customers });
  });

  app.delete('/api/customers/:id', (req, res) => {
    customers = customers.filter(c => c.id !== req.params.id);
    saveData();
    res.json({ success: true, customers });
  });

  // Vendor Profiles
  app.post('/api/vendors', (req, res) => {
    const vend: VendorProfile = req.body;
    if (!vend.id) {
      vend.id = `vend-${Date.now()}`;
      vend.createdAt = new Date().toISOString();
      vendors.unshift(vend);
    } else {
      const idx = vendors.findIndex(v => v.id === vend.id);
      if (idx !== -1) {
        vendors[idx] = { ...vendors[idx], ...vend };
      } else {
        vendors.unshift(vend);
      }
    }
    saveData();
    res.json({ success: true, vendor: vend, vendors });
  });

  app.delete('/api/vendors/:id', (req, res) => {
    vendors = vendors.filter(v => v.id !== req.params.id);
    saveData();
    res.json({ success: true, vendors });
  });

  // Reset to default sample dataset
  app.post('/api/reset-data', (req, res) => {
    resetToDefaultData();
    res.json({
      success: true,
      cloths,
      paints,
      sales,
      expenses,
      customers,
      vendors,
      summary: calculateSummary(),
    });
  });

  // Vite Middleware in Dev Mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
