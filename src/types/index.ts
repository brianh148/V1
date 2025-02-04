// Add new types for vendor portal
export interface VendorQuote {
  id: string;
  propertyId: string;
  vendorId: string;
  totalCost: number;
  laborCost: number;
  materialsCost: number;
  timeline: number; // in days
  scopeItems: {
    category: string;
    items: {
      name: string;
      description: string;
      cost: number;
      timeline: number;
    }[];
  }[];
  status: 'pending' | 'submitted' | 'accepted' | 'rejected';
  submittedAt?: string;
  notes?: string;
}

export interface QuoteRequest {
  id: string;
  propertyId: string;
  propertyAddress: string;
  propertyImage: string;
  scope: {
    category: string;
    items: {
      name: string;
      description: string;
      required: boolean;
    }[];
  }[];
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string;
  createdAt: string;
  inspectionReport?: string;
  adminNotes?: string;
}

export interface Property {
  id: number | string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  yearBuilt: number;
  propertyType: string;
  source: 'mls' | 'wholesaler';
  status: 'pending_review' | 'published' | 'rejected';
  photos: string[];
  image?: string;
  estimatedARV?: number;
  renovationCost?: number;
  rentPotential?: number;
  dealType?: string;
  zipCode?: string;
  lastSoldDate?: string;
  lastSoldPrice?: number;
  dateAdded?: string;
  description?: string;
  notes?: string;
  wholesaler_id?: string;
  deal_status?: 'available' | 'pending' | 'sold';
}

export interface SavedProperty extends Property {
  profit: number;
  roi: number;
}

export interface FilterOptions {
  location: string;
  propertyType: string[];
  yearBuiltRange: [number, number];
  arvRange: [number, number];
  minNetProfit: number;
  dealType: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: {
    searchTerm: string;
    priceRange: [number, number];
    bedrooms: number;
    minROI: number;
    filterOptions: FilterOptions;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
  dateCreated: string;
}

export interface MiscellaneousCosts {
  utilities: number;
  insurance: number;
  propertyTaxes: number;
  maintenance: number;
  propertyManagement: number;
  other: number;
}

export interface PurchaseCosts {
  acquisition: {
    closingCosts: number;
    inspectionCosts: number;
  };
  rehab: {
    renovationBudget: number;
    permitsAndFees: number;
    contingency: number;
  };
  holding: {
    propertyTaxes: number;
    utilities: number;
    insurance: number;
    hoaFees: number;
    loanInterest: number;
  };
  selling: {
    realtorCommission: number;
    closingCosts: number;
    stagingCosts: number;
  };
  setup?: {
    repairs: number;
    propertyManagementSetup: number;
  };
  refinance?: {
    appraisalFees: number;
    closingCosts: number;
    prepaymentPenalties: number;
  };
  operating?: {
    propertyTaxes: number;
    insurance: number;
    propertyManagement: number;
    maintenanceReserve: number;
    vacancyReserve: number;
  };
  wholesale?: {
    assignmentFee: number;
    buyerRehabBudget: number;
    marketingFees: number;
  };
}

export interface CostPresets {
  'fix-and-flip': {
    financed: PurchaseCosts;
    cash: PurchaseCosts;
  };
  'turnkey-rental': {
    financed: PurchaseCosts;
    cash: PurchaseCosts;
  };
  'brrr': {
    financed: PurchaseCosts;
    cash: PurchaseCosts;
  };
  'wholesale': {
    financed: PurchaseCosts;
    cash: PurchaseCosts;
  };
}

export interface CalculationFactors {
  purchaseModel: 'financed' | 'cash';
  strategy: string;
  interestRate: number;
  downPaymentPercentage: number;
  rehabFinancingPercentage: number;
  holdingPeriod: number;
  miscCostsPercentage: number;
  miscCostsBreakdown: MiscellaneousCosts;
  costPresets: CostPresets;
  currentCosts: PurchaseCosts;
}