import React, { useState } from 'react';
import { Search, Heart, RotateCcw, ChevronDown, DollarSign, Home, Bed, Store, Filter, ArrowUpDown, Clock, Calendar, BookmarkPlus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { FilterOptions, SavedSearch } from '../types';
import { useSearchStore } from '../store/searchStore';

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  priceRange: [number, number];
  setPriceRange: (value: [number, number]) => void;
  bedrooms: number;
  setBedrooms: (value: number) => void;
  minROI: number;
  setMinROI: (value: number) => void;
  filterOptions: FilterOptions;
  setFilterOptions: (options: FilterOptions) => void;
  showFavorites: boolean;
  setShowFavorites: (value: boolean) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (value: 'asc' | 'desc') => void;
}

export function SearchFilters({
  searchTerm,
  setSearchTerm,
  priceRange,
  setPriceRange,
  bedrooms,
  setBedrooms,
  minROI,
  setMinROI,
  filterOptions,
  setFilterOptions,
  showFavorites,
  setShowFavorites,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}: SearchFiltersProps) {
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [showBedsDropdown, setShowBedsDropdown] = useState(false);
  const [showPropertyTypeDropdown, setShowPropertyTypeDropdown] = useState(false);
  const [showDealTypeDropdown, setShowDealTypeDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showSaveSearchModal, setShowSaveSearchModal] = useState(false);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [searchName, setSearchName] = useState('');

  const { savedSearches, addSavedSearch, removeSavedSearch } = useSearchStore();

  const propertyTypes = [
    { value: 'single-family', label: 'Single Family' },
    { value: 'multi-family', label: 'Multi Family' },
    { value: 'condo', label: 'Condo' }
  ];

  const dealTypes = [
    { value: 'on-market', label: 'On Market' },
    { value: 'wholesale', label: 'Wholesale' },
    { value: 'turnkey-rental', label: 'Turnkey Rental' }
  ];

  const sortOptions = [
    { value: 'dateAdded', label: 'Date Added', icon: <Clock className="w-4 h-4" /> },
    { value: 'price', label: 'Price', icon: <DollarSign className="w-4 h-4" /> },
    { value: 'roi', label: 'ROI', icon: <ArrowUpDown className="w-4 h-4" /> },
    { value: 'netProfit', label: 'Net Profit', icon: <DollarSign className="w-4 h-4" /> },
    { value: 'bedrooms', label: 'Bedrooms', icon: <Bed className="w-4 h-4" /> },
    { value: 'squareFeet', label: 'Square Feet', icon: <Home className="w-4 h-4" /> },
    { value: 'yearBuilt', label: 'Year Built', icon: <Calendar className="w-4 h-4" /> },
  ];

  const handlePriceRangeChange = (index: number, value: number) => {
    const newRange = [...priceRange] as [number, number];
    if (index === 0 && value < newRange[1]) {
      newRange[0] = value;
    } else if (index === 1 && value > newRange[0]) {
      newRange[1] = value;
    }
    setPriceRange(newRange);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setPriceRange([0, 200000]);
    setBedrooms(1);
    setMinROI(0);
    setFilterOptions({
      location: '',
      propertyType: [],
      yearBuiltRange: [1900, 2024],
      arvRange: [0, 1000000],
      minNetProfit: 0,
      dealType: 'all',
    });
    setSortBy('dateAdded');
    setSortOrder('desc');
  };

  const handleSaveSearch = () => {
    if (!searchName) return;

    const newSearch: SavedSearch = {
      id: Math.random().toString(36).substr(2, 9),
      name: searchName,
      filters: {
        searchTerm,
        priceRange,
        bedrooms,
        minROI,
        filterOptions,
        sortBy,
        sortOrder
      },
      dateCreated: new Date().toISOString()
    };

    addSavedSearch(newSearch);
    setShowSaveSearchModal(false);
    setSearchName('');
  };

  const handleLoadSearch = (search: SavedSearch) => {
    setSearchTerm(search.filters.searchTerm);
    setPriceRange(search.filters.priceRange);
    setBedrooms(search.filters.bedrooms);
    setMinROI(search.filters.minROI);
    setFilterOptions(search.filters.filterOptions);
    setSortBy(search.filters.sortBy);
    setSortOrder(search.filters.sortOrder);
    setShowSavedSearches(false);
  };

  const getSortLabel = () => {
    const option = sortOptions.find(opt => opt.value === sortBy);
    return option ? option.label : 'Sort By';
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by address, city, or ZIP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-100 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Sort and View Controls */}
      <div className="p-4 border-b border-gray-700 flex flex-wrap gap-4">
        <div className="relative">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200 min-w-[160px] justify-between"
          >
            <span className="flex items-center gap-2">
              {sortOptions.find(opt => opt.value === sortBy)?.icon}
              {getSortLabel()}
            </span>
            <ArrowUpDown className={`w-4 h-4 ${sortOrder === 'desc' ? 'rotate-180' : ''} transition-transform`} />
          </button>
          {showSortDropdown && (
            <div className="absolute z-50 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-2 right-0">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    if (sortBy === option.value) {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy(option.value);
                      setSortOrder('asc');
                    }
                    setShowSortDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center justify-between ${
                    sortBy === option.value
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-200 hover:bg-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {option.icon}
                    {option.label}
                  </span>
                  {sortBy === option.value && (
                    <ArrowUpDown className={`w-4 h-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <select
          value={filterOptions.dealType}
          onChange={(e) => setFilterOptions({ ...filterOptions, dealType: e.target.value })}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200"
        >
          <option value="all">All Deal Types</option>
          <option value="on-market">On Market</option>
          <option value="wholesale">Wholesale</option>
          <option value="turnkey-rental">Turnkey Rental</option>
        </select>

        <button
          onClick={handleResetFilters}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Toggle Controls */}
      <div className="p-4 border-b border-gray-700 flex flex-wrap gap-4">
        <button
          onClick={() => setShowFavorites(!showFavorites)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            showFavorites 
              ? 'bg-blue-500 text-white hover:bg-blue-600' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Heart className={`w-4 h-4 ${showFavorites ? 'fill-current' : ''}`} />
          <span>Saved Properties</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowSavedSearches(!showSavedSearches)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
          >
            <BookmarkPlus className="w-4 h-4" />
            <span>Saved Searches</span>
          </button>

          {showSavedSearches && savedSearches.length > 0 && (
            <div className="absolute z-50 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-2 right-0">
              {savedSearches.map((search) => (
                <div
                  key={search.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-700 rounded-lg"
                >
                  <button
                    onClick={() => handleLoadSearch(search)}
                    className="flex-1 text-left text-sm text-gray-200"
                  >
                    {search.name}
                  </button>
                  <button
                    onClick={() => removeSavedSearch(search.id)}
                    className="p-1 text-gray-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setShowSaveSearchModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
        >
          <BookmarkPlus className="w-4 h-4" />
          <span>Save Current Search</span>
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="p-4 flex flex-wrap gap-4">
        {/* Price Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowPriceDropdown(!showPriceDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200"
          >
            <DollarSign className="w-4 h-4" />
            <span>Price Range</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {showPriceDropdown && (
            <div className="absolute z-50 mt-2 w-72 bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-4 left-0">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Price Range: {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}
                  </label>
                  <div className="relative pt-6">
                    <div className="h-2 bg-gray-700 rounded-full">
                      <div
                        className="absolute h-2 bg-blue-500 rounded-full"
                        style={{
                          left: `${(priceRange[0] / 1000000) * 100}%`,
                          right: `${100 - (priceRange[1] / 1000000) * 100}%`
                        }}
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1000000"
                      step="10000"
                      value={priceRange[0]}
                      onChange={(e) => handlePriceRangeChange(0, Number(e.target.value))}
                      className="absolute top-0 left-0 w-full h-6 opacity-0 cursor-pointer"
                    />
                    <input
                      type="range"
                      min="0"
                      max="1000000"
                      step="10000"
                      value={priceRange[1]}
                      onChange={(e) => handlePriceRangeChange(1, Number(e.target.value))}
                      className="absolute top-0 left-0 w-full h-6 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bedrooms Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowBedsDropdown(!showBedsDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200"
          >
            <Bed className="w-4 h-4" />
            <span>Bedrooms</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {showBedsDropdown && (
            <div className="absolute z-50 mt-2 w-72 bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-4 left-0">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Minimum Bedrooms: {bedrooms}+
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Property Type Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowPropertyTypeDropdown(!showPropertyTypeDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200"
          >
            <Home className="w-4 h-4" />
            <span>Property Type</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {showPropertyTypeDropdown && (
            <div className="absolute z-50 mt-2 w-72 bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-4 left-0">
              <div className="space-y-2">
                {propertyTypes.map(type => (
                  <label key={type.value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filterOptions.propertyType.includes(type.value)}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...filterOptions.propertyType, type.value]
                          : filterOptions.propertyType.filter(t => t !== type.value);
                        setFilterOptions({ ...filterOptions, propertyType: newTypes });
                      }}
                      className="rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-gray-300">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Deal Type Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDealTypeDropdown(!showDealTypeDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200"
          >
            <Store className="w-4 h-4" />
            <span>Deal Type</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {showDealTypeDropdown && (
            <div className="absolute z-50 mt-2 w-72 bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-4 left-0">
              <div className="space-y-2">
                {dealTypes.map(type => (
                  <label key={type.value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={filterOptions.dealType === type.value}
                      onChange={() => setFilterOptions({ ...filterOptions, dealType: type.value })}
                      className="rounded-full border-gray-600 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-gray-300">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Search Modal */}
      {showSaveSearchModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={() => setShowSaveSearchModal(false)} />
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gray-800 rounded-lg shadow-xl">
              <h3 className="text-lg font-medium text-gray-100 mb-4">Save Search</h3>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Search Name
                </label>
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter a name for this search"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowSaveSearchModal(false)}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSearch}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Save Search
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}