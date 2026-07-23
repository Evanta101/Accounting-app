import express from 'express';
import path from 'path';
import fs from 'fs';
import XLSX from 'xlsx';
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

const BACKUP_DIR = path.join(DATA_DIR, 'backups');
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
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

function createExcelWorkbook() {
  const wb = XLSX.utils.book_new();

  // 1. Sales Sheet
  const salesData = sales.map((s, idx) => {
    const pending = Math.max(0, s.sellingPrice - (s.amountReceived || 0));
    const profit = s.sellingPrice - (s.clothPurchaseCost || 0) - (s.paintCostAllocated || 0);
    return {
      'S.No': idx + 1,
      'Invoice / Ref': s.id,
      'Date': s.date,
      'Customer Name': s.customerName,
      'Location': s.location || '',
      'Item Description': s.clothTypeSnapshot || '',
      'Fabric Category': s.fabricCategorySnapshot || '',
      'Is Customer Cloth?': s.isCustomerCloth ? 'Yes' : 'No',
      'Selling Price (₹)': s.sellingPrice,
      'Amount Received (₹)': s.amountReceived,
      'Outstanding Due (₹)': pending,
      'Payment Status': pending === 0 ? 'Paid' : (s.amountReceived > 0 ? 'Partial' : 'Unpaid'),
      'Payment Mode': s.paymentMode || '',
      'Paints Used': (s.paintNamesSnapshot || []).join(', '),
      'Allocated Paint Cost (₹)': s.paintCostAllocated || 0,
      'Cloth Purchase Cost (₹)': s.clothPurchaseCost || 0,
      'Net Item Profit (₹)': profit,
      'Notes': s.notes || ''
    };
  });
  const salesWs = XLSX.utils.json_to_sheet(salesData.length > 0 ? salesData : [{}]);
  XLSX.utils.book_append_sheet(wb, salesWs, 'Sales Register');

  // 2. Cloth Stock Sheet
  const clothData = cloths.map((c, idx) => ({
    'S.No': idx + 1,
    'Cloth ID': c.id,
    'Cloth Type': c.clothType,
    'Custom Label': c.customTypeLabel || '',
    'Fabric Category': c.fabricCategory,
    'Purchase Date': c.purchaseDate,
    'Purchase Cost (₹)': c.purchaseCost,
    'Purchase Location': c.purchaseLocation || '',
    'Vendor Name': c.vendorName || '',
    'Quantity': c.quantity,
    'Status': c.status,
    'Notes': c.notes || ''
  }));
  const clothWs = XLSX.utils.json_to_sheet(clothData.length > 0 ? clothData : [{}]);
  XLSX.utils.book_append_sheet(wb, clothWs, 'Cloth Stock');

  // 3. Paint Inventory Sheet
  const paintData = paints.map((p, idx) => ({
    'S.No': idx + 1,
    'Bottle ID': p.id,
    'Brand & Color': p.brandName,
    'Category': p.category,
    'Bottle Cost (₹)': p.purchaseCost,
    'Purchase Date': p.purchaseDate,
    'Vendor Name': p.vendorName || '',
    'Times Used Count': p.timesUsedCount || 0,
    'Finished / Fully Used?': p.isFullyUtilized ? 'Yes' : 'No',
    'Date Finished': p.fullyUtilizedDate || '',
    'Description / Notes': p.description || ''
  }));
  const paintWs = XLSX.utils.json_to_sheet(paintData.length > 0 ? paintData : [{}]);
  XLSX.utils.book_append_sheet(wb, paintWs, 'Paint Inventory');

  // 4. Expenses Sheet
  const expenseData = expenses.map((e, idx) => ({
    'S.No': idx + 1,
    'Expense ID': e.id,
    'Date': e.date,
    'Category': e.category,
    'Amount (₹)': e.amount,
    'Description': e.description || ''
  }));
  const expenseWs = XLSX.utils.json_to_sheet(expenseData.length > 0 ? expenseData : [{}]);
  XLSX.utils.book_append_sheet(wb, expenseWs, 'Misc Expenses');

  // 5. Customers Sheet
  const customerData = customers.map((c, idx) => ({
    'S.No': idx + 1,
    'Customer ID': c.id,
    'Name': c.name,
    'Phone': c.phone || '',
    'City': c.city || '',
    'Address': c.address || '',
    'Notes': c.notes || ''
  }));
  const custWs = XLSX.utils.json_to_sheet(customerData.length > 0 ? customerData : [{}]);
  XLSX.utils.book_append_sheet(wb, custWs, 'Customers');

  // 6. Vendors Sheet
  const vendorData = vendors.map((v, idx) => ({
    'S.No': idx + 1,
    'Vendor ID': v.id,
    'Shop / Business Name': v.shopName,
    'Category': v.category,
    'Contact Person': v.contactPerson || '',
    'Phone': v.phone || '',
    'City': v.city || '',
    'Notes': v.notes || ''
  }));
  const vendWs = XLSX.utils.json_to_sheet(vendorData.length > 0 ? vendorData : [{}]);
  XLSX.utils.book_append_sheet(wb, vendWs, 'Vendors');

  // 7. Business Summary Sheet
  const summary = calculateSummary();
  const summaryData = [
    { 'Metric': 'Total Sales Revenue (₹)', 'Value': summary.totalRevenue },
    { 'Metric': 'Total Cloth Purchase Cost Sold (₹)', 'Value': summary.totalClothCostSold },
    { 'Metric': 'Total Paint Cost Allocated (₹)', 'Value': summary.totalPaintCostAllocated },
    { 'Metric': 'Total Misc Expenses (₹)', 'Value': summary.totalMiscExpenses },
    { 'Metric': 'Net Operating Profit (₹)', 'Value': summary.netProfit },
    { 'Metric': 'Profit Margin (%)', 'Value': `${summary.profitMarginPct.toFixed(1)}%` },
    { 'Metric': 'In-Stock Cloth Inventory Value (₹)', 'Value': summary.inStockClothValue },
    { 'Metric': 'In-Stock Cloth Count', 'Value': summary.inStockClothCount },
    { 'Metric': 'Pending Customer Dues (₹)', 'Value': summary.totalPendingCustomerDues },
    { 'Metric': 'Pending Dues Count', 'Value': summary.pendingDuesCount },
    { 'Metric': 'Active Paint Bottles Count', 'Value': summary.activePaintsCount },
  ];
  const summaryWs = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

  return wb;
}

function saveExcelBackup() {
  try {
    const wb = createExcelWorkbook();
    // 1. Save to Latest copy
    const latestPath = path.join(BACKUP_DIR, 'Kalam_Kaari_Latest.xlsx');
    XLSX.writeFile(wb, latestPath);

    // 2. Save timestamped backup copy
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-');
    const timePath = path.join(BACKUP_DIR, `Kalam_Kaari_Backup_${dateStr}_${timeStr}.xlsx`);
    XLSX.writeFile(wb, timePath);

    // Clean up older backups if more than 50 files exist to keep disk tidy
    const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.xlsx') && f !== 'Kalam_Kaari_Latest.xlsx');
    if (files.length > 50) {
      files.sort((a, b) => {
        return fs.statSync(path.join(BACKUP_DIR, b)).mtimeMs - fs.statSync(path.join(BACKUP_DIR, a)).mtimeMs;
      });
      for (let i = 50; i < files.length; i++) {
        try { fs.unlinkSync(path.join(BACKUP_DIR, files[i])); } catch {}
      }
    }
  } catch (err) {
    console.error('Error generating Excel backup:', err);
  }
}

function saveData() {
  try {
    const data = { cloths, paints, sales, expenses, customers, vendors };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    saveExcelBackup();
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

  const inStockCloths = cloths.filter(c => c.status === 'In Stock' && (c.quantity === undefined || c.quantity > 0));
  const inStockClothValue = inStockCloths.reduce((acc, c) => acc + (c.purchaseCost || 0) * (c.quantity !== undefined ? c.quantity : 1), 0);
  const inStockClothCount = inStockCloths.reduce((acc, c) => acc + (c.quantity !== undefined ? c.quantity : 1), 0);
  
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
    inStockClothCount,
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

    // Check if this is an update to an existing sale and restore old stock quantity if needed
    const existingIdx = sales.findIndex(s => s.id === sale.id);
    if (existingIdx !== -1) {
      const oldSale = sales[existingIdx];
      if (!oldSale.isCustomerCloth && oldSale.linkedClothId) {
        const oldCloth = cloths.find(c => c.id === oldSale.linkedClothId);
        if (oldCloth) {
          oldCloth.quantity = (oldCloth.quantity !== undefined ? oldCloth.quantity : 0) + 1;
          if (oldCloth.quantity > 0) {
            oldCloth.status = 'In Stock';
          }
        }
      }
    }

    // 1. Check cloth linkage for new or updated sale
    if (!sale.isCustomerCloth && sale.linkedClothId) {
      const cloth = cloths.find(c => c.id === sale.linkedClothId);
      if (cloth) {
        const currentQty = cloth.quantity !== undefined ? cloth.quantity : 1;
        cloth.quantity = Math.max(0, currentQty - 1);
        if (cloth.quantity === 0) {
          cloth.status = 'Sold';
        } else {
          cloth.status = 'In Stock';
        }
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
    if (existingIdx !== -1) {
      sales[existingIdx] = sale;
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
        cloth.quantity = (cloth.quantity !== undefined ? cloth.quantity : 0) + 1;
        if (cloth.quantity > 0) {
          cloth.status = 'In Stock';
        }
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

  // Excel & Data Backup Endpoints
  app.get('/api/backups', (req, res) => {
    try {
      if (!fs.existsSync(BACKUP_DIR)) {
        return res.json({ success: true, files: [] });
      }
      const fileNames = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.xlsx'));
      const files = fileNames.map(fileName => {
        const filePath = path.join(BACKUP_DIR, fileName);
        const stats = fs.statSync(filePath);
        return {
          name: fileName,
          sizeKb: Math.round(stats.size / 1024),
          createdAt: stats.birthtime.toISOString(),
          modifiedAt: stats.mtime.toISOString(),
          isLatest: fileName === 'Kalam_Kaari_Latest.xlsx'
        };
      });
      // Sort newest first
      files.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());
      res.json({ success: true, files, backupDir: BACKUP_DIR });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to list backups' });
    }
  });

  app.get('/api/backups/download/:filename', (req, res) => {
    try {
      const filename = path.basename(req.params.filename);
      const filePath = path.join(BACKUP_DIR, filename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).send('Backup file not found');
      }
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.sendFile(filePath);
    } catch (err) {
      res.status(500).send('Error downloading file');
    }
  });

  app.post('/api/backups/create', (req, res) => {
    try {
      saveExcelBackup();
      const fileNames = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.xlsx'));
      const files = fileNames.map(fileName => {
        const filePath = path.join(BACKUP_DIR, fileName);
        const stats = fs.statSync(filePath);
        return {
          name: fileName,
          sizeKb: Math.round(stats.size / 1024),
          createdAt: stats.birthtime.toISOString(),
          modifiedAt: stats.mtime.toISOString(),
          isLatest: fileName === 'Kalam_Kaari_Latest.xlsx'
        };
      });
      files.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());
      res.json({ success: true, message: 'Excel backup created successfully in data/backups/', files });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to create backup' });
    }
  });

  app.get('/api/export-excel', (req, res) => {
    try {
      const wb = createExcelWorkbook();
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      const filename = `Kalam_Kaari_Ledger_${new Date().toISOString().slice(0, 10)}.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buf);
    } catch (err) {
      res.status(500).send('Error exporting Excel workbook');
    }
  });

  app.get('/api/export-json', (req, res) => {
    try {
      const data = { cloths, paints, sales, expenses, customers, vendors, exportedAt: new Date().toISOString() };
      const filename = `Kalam_Kaari_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(JSON.stringify(data, null, 2));
    } catch (err) {
      res.status(500).send('Error exporting JSON payload');
    }
  });

  app.post('/api/import-json', (req, res) => {
    try {
      const imported = req.body;
      if (!imported || typeof imported !== 'object') {
        return res.status(400).json({ success: false, error: 'Invalid JSON payload' });
      }
      cloths = Array.isArray(imported.cloths) ? imported.cloths : cloths;
      paints = Array.isArray(imported.paints) ? imported.paints : paints;
      sales = Array.isArray(imported.sales) ? imported.sales : sales;
      expenses = Array.isArray(imported.expenses) ? imported.expenses : expenses;
      customers = Array.isArray(imported.customers) ? imported.customers : customers;
      vendors = Array.isArray(imported.vendors) ? imported.vendors : vendors;
      
      saveData();
      res.json({
        success: true,
        message: 'Data successfully imported and backed up',
        cloths,
        paints,
        sales,
        expenses,
        customers,
        vendors,
        summary: calculateSummary(),
      });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to import JSON data' });
    }
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
