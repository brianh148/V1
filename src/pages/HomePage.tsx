import React, { useState, useMemo, useEffect } from 'react';
import { SearchFilters } from '../components/SearchFilters';
import { PropertyCard } from '../components/PropertyCard';
import { CalculationFactorsBox } from '../components/CalculationFactors';
import { supabase } from '../lib/supabase';
import { calculateROI } from '../utils/format';
import { calculateNetProfit } from '../utils/calculations';
import { CalculationFactors, FilterOptions, SavedProperty, Property } from '../types';
import { useAuthStore } from '../store/authStore';

export function HomePage() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000]);
  const [bedrooms, setBedrooms] = useState(1);
  const [minROI, setMinROI] = useState(0);
  const [sortBy, setSortBy] = useState('dateAdded');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calculationFactors, setCalculationFactors] = useState<CalculationFactors>({
    purchaseModel: 'financed',
    strategy: 'fix-and-flip',
    interestRate: 5,
    downPaymentPercentage: 10,
    rehabFinancingPercentage: 100,
    holdingPeriod: 6,
    miscCostsPercentage: 5,
    miscCostsBreakdown: {
      utilities: 150,
      insurance: 100,
      propertyTaxes: 200,
      maintenance: 100,
      propertyManagement: 0,
      other: 0,
    },
    costPresets: defaultPresets,
    currentCosts: defaultPresets['fix-and-flip'].financed,
  });
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    location: '',
    propertyType: [],
    yearBuiltRange: [1900, 2024],
    arvRange: [0, 1000000],
    minNetProfit: 0,
    dealType: 'all',
  });

  useEffect(() => {
    fetchProperties();
    if (user) {
      fetchSavedProperties();
    }
  }, [user]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to ensure photos are properly handled
      const transformedData = (data || []).map(property => ({
        ...property,
        // Use the first photo from the photos array or a default image
        image: property.photos?.[0] || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'
      }));

      setProperties(transformedData);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_properties')
        .select('property_id')
        .eq('user_id', user?.id);

      if (error) throw error;

      if (data) {
        const savedIds = data.map(saved => saved.property_id);
        setSavedProperties(properties.filter(p => savedIds.includes(p.id)) as SavedProperty[]);
      }
    } catch (error) {
      console.error('Error fetching saved properties:', error);
    }
  };

  const handleSaveProperty = async (property: Property) => {
    if (!user) return;

    try {
      const isSaved = savedProperties.some(p => p.id === property.id);

      if (isSaved) {
        // Remove from saved properties
        await supabase
          .from('saved_properties')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', property.id);

        setSavedProperties(prev => prev.filter(p => p.id !== property.id));
      } else {
        // Add to saved properties
        await supabase
          .from('saved_properties')
          .insert({
            user_id: user.id,
            property_id: property.id
          });

        const netProfit = calculateNetProfit(property, calculationFactors);
        const roi = calculateROI(property.estimatedARV || 0, property.price, property.renovationCost || 0);
        
        setSavedProperties(prev => [...prev, { ...property, profit: netProfit, roi }]);
      }
    } catch (error) {
      console.error('Error saving property:', error);
    }
  };

  const filteredProperties = useMemo(() => {
    let filtered = properties;

    if (showFavorites) {
      filtered = filtered.filter(property => 
        savedProperties.some(saved => saved.id === property.id)
      );
    }

    filtered = filtered.filter(property => {
      const matchesSearch = property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          property.zipCode?.includes(searchTerm);
      const matchesPrice = property.price >= priceRange[0] && property.price <= priceRange[1];
      const matchesBedrooms = property.bedrooms >= bedrooms;
      const propertyROI = calculateROI(property.estimatedARV || 0, property.price, property.renovationCost || 0);
      const matchesROI = propertyROI >= minROI;
      
      const matchesPropertyType = filterOptions.propertyType.length === 0 ||
                                filterOptions.propertyType.includes(property.propertyType);
      const matchesYearBuilt = property.yearBuilt >= filterOptions.yearBuiltRange[0] &&
                              property.yearBuilt <= filterOptions.yearBuiltRange[1];
      const netProfit = calculateNetProfit(property, calculationFactors);
      const matchesNetProfit = netProfit >= filterOptions.minNetProfit;
      const matchesDealType = filterOptions.dealType === 'all' || property.dealType === filterOptions.dealType;

      return matchesSearch && matchesPrice && matchesBedrooms && matchesROI &&
             matchesPropertyType && matchesYearBuilt && matchesNetProfit && matchesDealType;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'dateAdded':
          const aDate = a.dateAdded || new Date(0).toISOString();
          const bDate = b.dateAdded || new Date(0).toISOString();
          comparison = new Date(bDate).getTime() - new Date(aDate).getTime();
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'roi':
          const roiA = calculateROI(a.estimatedARV || 0, a.price, a.renovationCost || 0);
          const roiB = calculateROI(b.estimatedARV || 0, b.price, b.renovationCost || 0);
          comparison = roiA - roiB;
          break;
        case 'netProfit':
          const profitA = calculateNetProfit(a, calculationFactors);
          const profitB = calculateNetProfit(b, calculationFactors);
          comparison = profitA - profitB;
          break;
        case 'bedrooms':
          comparison = a.bedrooms - b.bedrooms;
          break;
        case 'squareFeet':
          comparison = a.squareFeet - b.squareFeet;
          break;
        case 'yearBuilt':
          comparison = a.yearBuilt - b.yearBuilt;
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [properties, searchTerm, priceRange, bedrooms, minROI, filterOptions, calculationFactors, showFavorites, savedProperties, sortBy, sortOrder]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchProperties}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CalculationFactorsBox
          factors={calculationFactors}
          onFactorsChange={setCalculationFactors}
        />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Column */}
          <div className="lg:col-span-1 space-y-4">
            <div className="sticky top-8">
              <SearchFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                bedrooms={bedrooms}
                setBedrooms={setBedrooms}
                minROI={minROI}
                setMinROI={setMinROI}
                filterOptions={filterOptions}
                setFilterOptions={setFilterOptions}
                showFavorites={showFavorites}
                setShowFavorites={setShowFavorites}
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
              />
            </div>
          </div>

          {/* Properties Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {filteredProperties.map((property) => (
                <PropertyCard 
                  key={property.id} 
                  property={property}
                  calculationFactors={calculationFactors}
                  onSaveProperty={() => handleSaveProperty(property)}
                  isSaved={savedProperties.some(p => p.id === property.id)}
                />
              ))}
            </div>
            {filteredProperties.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">No properties found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const defaultPresets = {
  'fix-and-flip': {
    financed: {
      acquisition: {
        closingCosts: 3000,
        inspectionCosts: 500,
      },
      rehab: {
        renovationBudget: 25000,
        permitsAndFees: 1500,
        contingency: 2500,
      },
      holding: {
        propertyTaxes: 2000,
        utilities: 1200,
        insurance: 800,
        hoaFees: 0,
        loanInterest: 3000,
      },
      selling: {
        realtorCommission: 15000,
        closingCosts: 3000,
        stagingCosts: 1500,
      }
    },
    cash: {
      acquisition: {
        closingCosts: 2000,
        inspectionCosts: 500,
      },
      rehab: {
        renovationBudget: 25000,
        permitsAndFees: 1500,
        contingency: 2500,
      },
      holding: {
        propertyTaxes: 2000,
        utilities: 1200,
        insurance: 800,
        hoaFees: 0,
        loanInterest: 0,
      },
      selling: {
        realtorCommission: 15000,
        closingCosts: 3000,
        stagingCosts: 1500,
      }
    }
  },
  'turnkey-rental': {
    financed: {
      acquisition: {
        closingCosts: 3000,
        inspectionCosts: 500,
      },
      setup: {
        repairs: 5000,
        propertyManagementSetup: 500,
      },
      operating: {
        propertyTaxes: 200,
        insurance: 100,
        propertyManagement: 100,
        maintenanceReserve: 200,
        vacancyReserve: 100,
      }
    },
    cash: {
      acquisition: {
        closingCosts: 2000,
        inspectionCosts: 500,
      },
      setup: {
        repairs: 5000,
        propertyManagementSetup: 500,
      },
      operating: {
        propertyTaxes: 200,
        insurance: 100,
        propertyManagement: 100,
        maintenanceReserve: 200,
        vacancyReserve: 100,
      }
    }
  },
  'brrr': {
    financed: {
      acquisition: {
        closingCosts: 3000,
        inspectionCosts: 500,
      },
      rehab: {
        renovationBudget: 25000,
        permitsAndFees: 1500,
        contingency: 2500,
      },
      refinance: {
        appraisalFees: 500,
        closingCosts: 3000,
        prepaymentPenalties: 0,
      },
      operating: {
        propertyTaxes: 200,
        insurance: 100,
        propertyManagement: 100,
        maintenanceReserve: 200,
        vacancyReserve: 100,
      }
    },
    cash: {
      acquisition: {
        closingCosts: 2000,
        inspectionCosts: 500,
      },
      rehab: {
        renovationBudget: 25000,
        permitsAndFees: 1500,
        contingency: 2500,
      },
      refinance: {
        appraisalFees: 500,
        closingCosts: 3000,
        prepaymentPenalties: 0,
      },
      operating: {
        propertyTaxes: 200,
        insurance: 100,
        propertyManagement: 100,
        maintenanceReserve: 200,
        vacancyReserve: 100,
      }
    }
  },
  'wholesale': {
    financed: {
      wholesale: {
        assignmentFee: 5000,
        buyerRehabBudget: 25000,
        marketingFees: 1000,
      }
    },
    cash: {
      wholesale: {
        assignmentFee: 5000,
        buyerRehabBudget: 25000,
        marketingFees: 1000,
      }
    }
  }
};