// File Path: src/store/useAmazonStore.js

import { create } from 'zustand';

const useAmazonStore = create((set) => ({
  // 📦 States
  fetchedProducts: [], 
  searchKeyword: "",   
  searchLimit: 20,     
  cameFromAmazon: false, 

  // ⚙️ Actions 
  setAmazonData: (products, keyword, limit) => set({ 
    fetchedProducts: products, 
    searchKeyword: keyword, 
    searchLimit: limit 
  }),
  
  setCameFromAmazon: (status) => set({ cameFromAmazon: status }),
  
  clearAmazonData: () => set({ 
    fetchedProducts: [], 
    searchKeyword: "", 
    searchLimit: 20,
    cameFromAmazon: false 
  }),

  // 🌟 THE FIX: Naya function jo form submit hone ke baad chalega
  markAsAddedInDB: (savedAsin) => set((state) => ({
    fetchedProducts: state.fetchedProducts.map((product) => 
      product.externalId === savedAsin 
        ? { ...product, alreadyInDB: true } // Jo save hua, usko true kar do
        : product // Baqi sab ko waise hi rehne do
    )
  })),
}));

export default useAmazonStore;




















// // File Path: src/store/useAmazonStore.js

// import { create } from 'zustand';

// const useAmazonStore = create((set) => ({
//   // 📦 States (Zehdasht)
//   fetchedProducts: [], // Amazon se aaye hue products yahan save honge
//   searchKeyword: "",   // Admin ne kya search kiya tha (e.g. "Smart Watch")
//   searchLimit: 20,     // Kitne products mangwaye thay
//   cameFromAmazon: false, // Kya admin Amazon search page se form par aaya hai?

//   // ⚙️ Actions (Functions)
//   setAmazonData: (products, keyword, limit) => set({ 
//     fetchedProducts: products, 
//     searchKeyword: keyword, 
//     searchLimit: limit 
//   }),
  
//   setCameFromAmazon: (status) => set({ cameFromAmazon: status }),
  
//   clearAmazonData: () => set({ 
//     fetchedProducts: [], 
//     searchKeyword: "", 
//     searchLimit: 20,
//     cameFromAmazon: false 
//   }),
// }));

// export default useAmazonStore;