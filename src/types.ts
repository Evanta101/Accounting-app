export type ClothType = 
  | 'Saree'
  | 'Frock'
  | 'T-Shirt'
  | 'Salwar Suit'
  | 'Co-ord Set'
  | 'Dupatta / Stole'
  | 'Lehenga'
  | 'Other';

export type FabricCategory = 
  | 'Silk' 
  | 'Fabric / Cotton' 
  | 'Georgette' 
  | 'Organza' 
  | 'Chiffon' 
  | 'Crepe' 
  | 'Other';

export type ClothStatus = 'In Stock' | 'Sold' | 'Damaged';

export interface ClothItem {
  id: string;
  clothType: ClothType;
  customTypeLabel?: string;
  fabricCategory: FabricCategory;
  purchaseCost: number;
  purchaseDate: string;
  purchaseLocation: string; // e.g. "Surat Market", "City Wholesaler", "Amazon"
  vendorId?: string;
  vendorName?: string;
  quantity: number;
  status: ClothStatus;
  notes?: string;
  createdAt: string;
}

export type PaintCategory = 
  | 'Silk Paint' 
  | 'Fabric Paint' 
  | 'Outliner / Zari' 
  | 'Medium / Binder' 
  | 'Brushes & Tools';

export interface PaintItem {
  id: string;
  brandName: string; // e.g. "Fevicryl Silk Color - Royal Blue"
  category: PaintCategory;
  description?: string;
  purchaseCost: number;
  purchaseDate: string;
  vendorId?: string;
  vendorName?: string;
  isFullyUtilized: boolean;
  fullyUtilizedDate?: string;
  timesUsedCount: number; // calculated from linked sales
  linkedSaleIds: string[];
  createdAt: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  city: string;
  address?: string;
  notes?: string;
  createdAt: string;
}

export interface VendorProfile {
  id: string;
  shopName: string;
  category: 'Cloth Wholesaler' | 'Paint Shop' | 'General Supplier';
  contactPerson?: string;
  phone: string;
  city: string;
  notes?: string;
  createdAt: string;
}

export type PaymentStatus = 'Paid' | 'Pending' | 'Partial';

export interface SaleEntry {
  id: string;
  date: string;
  isCustomerCloth: boolean;
  linkedClothId?: string; // null if customer's own cloth
  clothTypeSnapshot: string; // e.g. "Saree (Silk)" or "Customer's Saree"
  fabricCategorySnapshot?: string;
  customerId: string;
  customerName: string;
  location: string;
  sellingPrice: number; // Total charged to customer
  clothPurchaseCost: number; // 0 if customer's cloth
  paintIdsUsed: string[]; // IDs of paint bottles used
  paintNamesSnapshot?: string[];
  markPaintsFinished?: string[]; // IDs of paints marked fully utilized during this sale
  paintCostAllocated: number; // calculated pro-rated paint cost
  paymentStatus: PaymentStatus;
  amountReceived: number;
  paymentMode: 'UPI' | 'Cash' | 'Bank Transfer' | 'Other';
  notes?: string;
  createdAt: string;
}

export interface ExpenseEntry {
  id: string;
  date: string;
  category: 'Travel' | 'Courier / Shipping' | 'Tools & Equipment' | 'Packaging' | 'Refreshments' | 'Misc';
  amount: number;
  description: string;
  vendorId?: string;
  createdAt: string;
}

export interface BusinessSummary {
  totalRevenue: number;
  totalClothCostSold: number;
  totalPaintCostAllocated: number;
  totalMiscExpenses: number;
  netProfit: number;
  profitMarginPct: number;
  inStockClothValue: number;
  inStockClothCount: number;
  totalPendingCustomerDues: number;
  pendingDuesCount: number;
  activePaintsCount: number;
}
