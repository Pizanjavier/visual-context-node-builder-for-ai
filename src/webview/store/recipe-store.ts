import { create } from 'zustand';
import type { RecipeMeta } from '../../shared/types/snapshot';

export type RecipeState = {
  recipes: RecipeMeta[];
  setRecipes: (recipes: RecipeMeta[]) => void;
  libraryOpen: boolean;
  openLibrary: () => void;
  closeLibrary: () => void;
  saveOpen: boolean;
  openSave: () => void;
  closeSave: () => void;
  packageInputOpen: boolean;
  openPackageInput: () => void;
  closePackageInput: () => void;
  availablePackages: string[];
  setAvailablePackages: (packages: string[]) => void;
};

/**
 * Store for recipe management UI state: recipe library listing,
 * save modal, and package input modal visibility. Also holds the
 * list of available npm packages for the package node feature.
 */
export const useRecipeStore = create<RecipeState>((set) => ({
  recipes: [],
  setRecipes: (recipes) => set({ recipes }),
  libraryOpen: false,
  openLibrary: () => set({ libraryOpen: true }),
  closeLibrary: () => set({ libraryOpen: false }),
  saveOpen: false,
  openSave: () => set({ saveOpen: true }),
  closeSave: () => set({ saveOpen: false }),
  packageInputOpen: false,
  openPackageInput: () => set({ packageInputOpen: true }),
  closePackageInput: () => set({ packageInputOpen: false }),
  availablePackages: [],
  setAvailablePackages: (packages) => set({ availablePackages: packages }),
}));
