import { create } from 'zustand';
import { SavedSearch } from '../types';

interface SearchState {
  savedSearches: SavedSearch[];
  addSavedSearch: (search: SavedSearch) => void;
  removeSavedSearch: (id: string) => void;
  loadSavedSearch: (id: string) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  savedSearches: [],
  addSavedSearch: (search) => 
    set((state) => ({ 
      savedSearches: [...state.savedSearches, search] 
    })),
  removeSavedSearch: (id) =>
    set((state) => ({
      savedSearches: state.savedSearches.filter(s => s.id !== id)
    })),
  loadSavedSearch: (id) => {
    // This will be handled by the component
  }
}));