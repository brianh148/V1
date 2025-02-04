import React, { useState, useEffect } from 'react';
import { PropertyCard } from '../../components/PropertyCard';
import { Property } from '../../types';
import { Building2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

export function MyProperties() {
  const { user } = useAuthStore();
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSavedProperties();
    }
  }, [user]);

  const fetchSavedProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('saved_properties')
        .select('property_id')
        .eq('user_id', user?.id);

      if (error) throw error;

      if (data && data.length > 0) {
        const propertyIds = data.map(saved => saved.property_id);
        const { data: properties, error: propertiesError } = await supabase
          .from('properties')
          .select('*')
          .in('id', propertyIds);

        if (propertiesError) throw propertiesError;
        setSavedProperties(properties || []);
      } else {
        setSavedProperties([]);
      }
    } catch (error) {
      console.error('Error fetching saved properties:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">My Saved Properties</h1>
        <p className="mt-2 text-gray-400">
          View and manage your saved properties
        </p>
      </div>

      {savedProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              calculationFactors={{
                purchaseModel: 'financed',
                strategy: 'fix-and-flip',
                interestRate: 5,
                downPaymentPercentage: 20,
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
                currentCosts: defaultPresets['fix-and-flip'].financed
              }}
              isSaved={true}
              onSaveProperty={() => {
                // Handle unsaving property
                // This would remove it from saved_properties table
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-600 mb-4" />
          <p className="text-gray-400">You haven't saved any properties yet.</p>
        </div>
      )}
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