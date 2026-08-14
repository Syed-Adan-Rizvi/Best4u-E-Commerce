// File Path: src/store/useCurrencyStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const EXCHANGE_RATE_API = "https://open.er-api.com/v6/latest/USD"; 
// 🟢 FIX: VPN-friendly aur zyada reliable API use ki hai
const GEO_IP_API = "https://ipapi.co/json/";

// 🌍 ALL MAJOR CURRENCIES
export const ALL_CURRENCIES = [
  "USD", "PKR", "INR", "EUR", "GBP", "CAD", "AUD", 
  "AED", "SAR", "QAR", "CNY", "JPY", "SGD"
];

export const useCurrencyStore = create(
  persist(
    (set, get) => ({
      currency: "USD",         
      rates: { USD: 1 },       
      isLoading: true,         
      hasUserSelected: false,  

      setCurrency: (newCurrency) => {
        set({ currency: newCurrency, hasUserSelected: true });
      },

      initCurrencyAndRates: async () => {
        set({ isLoading: true });
        
        try {
          const rateRes = await fetch(EXCHANGE_RATE_API);
          const rateData = await rateRes.json();
          const liveRates = rateData.rates || { USD: 1 };

          let detectedCurrency = get().currency;

          // Agar user ne khud koi currency select NAHI ki hui
          if (!get().hasUserSelected) {
            try {
              const ipRes = await fetch(GEO_IP_API);
              const ipData = await ipRes.json();
              
              // 🟢 ipapi.co direct "GBP", "USD" waghera bhejta hai ipData.currency mein
              // Hum check kar rahe hain ke wo currency hamari list mein hai ya nahi
              if (ipData.currency && ALL_CURRENCIES.includes(ipData.currency)) {
                detectedCurrency = ipData.currency;
              }
            } catch (ipError) {
              console.log("⚠️ IP API block ho gayi (Adblocker ya Strict Privacy ki wajah se).");
            }
          }

          set({ rates: liveRates, currency: detectedCurrency, isLoading: false });

        } catch (error) {
          console.error("❌ Rates fetch failed:", error);
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'best4u-currency-pref', 
      partialize: (state) => ({ 
        currency: state.currency, 
        hasUserSelected: state.hasUserSelected 
      }), 
    }
  )
);












// // File Path: src/store/useCurrencyStore.js
// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

// const EXCHANGE_RATE_API = "https://open.er-api.com/v6/latest/USD"; 
// const GEO_IP_API = "https://ipwho.is/";

// // 🌍 ALL MAJOR CURRENCIES
// export const ALL_CURRENCIES = [
//   "USD", "PKR", "INR", "EUR", "GBP", "CAD", "AUD", 
//   "AED", "SAR", "QAR", "CNY", "JPY", "SGD"
// ];

// export const useCurrencyStore = create(
//   persist(
//     (set, get) => ({
//       currency: "USD",         
//       rates: { USD: 1 },       
//       isLoading: true,         
//       hasUserSelected: false,  

//       setCurrency: (newCurrency) => {
//         set({ currency: newCurrency, hasUserSelected: true });
//       },

//       initCurrencyAndRates: async () => {
//         set({ isLoading: true });
        
//         try {
//           const rateRes = await fetch(EXCHANGE_RATE_API);
//           const rateData = await rateRes.json();
//           const liveRates = rateData.rates || { USD: 1 };

//           let detectedCurrency = get().currency;

//           if (!get().hasUserSelected) {
//             try {
//               const ipRes = await fetch(GEO_IP_API);
//               const ipData = await ipRes.json();
              
//               if (ipData.currency && ipData.currency.code && liveRates[ipData.currency.code]) {
//                 detectedCurrency = ipData.currency.code;
//               }
//             } catch (ipError) {
//               console.log("⚠️ IP API roki gayi.");
//             }
//           }

//           set({ rates: liveRates, currency: detectedCurrency, isLoading: false });

//         } catch (error) {
//           console.error("❌ Rates fetch failed:", error);
//           set({ isLoading: false });
//         }
//       }
//     }),
//     {
//       name: 'best4u-currency-pref', 
//       partialize: (state) => ({ 
//         currency: state.currency, 
//         hasUserSelected: state.hasUserSelected 
//       }), 
//     }
//   )
// );







// // File Path: src/store/useCurrencyStore.js
// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

// // 🌍 PUBLIC FREE APIs (No API Keys required)
// const EXCHANGE_RATE_API = "https://open.er-api.com/v6/latest/USD"; 
// // const GEO_IP_API = "https://ipapi.co/json/";
// const GEO_IP_API = "https://ipwho.is/";

// export const useCurrencyStore = create(
//   persist(
//     (set, get) => ({
//       currency: "USD",         // Default Currency
//       rates: { USD: 1 },       // Default Rate
//       isLoading: true,         // Loading state for UI
//       hasUserSelected: false,  // Agar user ne khud change ki hai toh Auto-detect kaam na kare

//       // 🖱️ User Manually Dropdown Se Change Kare
//       setCurrency: (newCurrency) => {
//         set({ currency: newCurrency, hasUserSelected: true });
//       },

//       // 🚀 App Load Hote Hi Yeh Function Chalega
//       initCurrencyAndRates: async () => {
//         set({ isLoading: true });
        
//         try {
//           // 1. Live Exchange Rates Mangwao (USD ke muqable mein sabhi currencies)
//           const rateRes = await fetch(EXCHANGE_RATE_API);
//           const rateData = await rateRes.json();
//           const liveRates = rateData.rates || { USD: 1 };

//           let detectedCurrency = get().currency;

//           // 2. Auto Detect Location (Sirf tab agar user ne khud koi currency save nahi ki)
//           if (!get().hasUserSelected) {
//             try {
//               const ipRes = await fetch(GEO_IP_API);
//               const ipData = await ipRes.json();
              
//               // Agar us country ki currency hamare rates list mein hai toh set kar do
//               if (ipData.currency && liveRates[ipData.currency]) {
//                 detectedCurrency = ipData.currency;
//               }
//             } catch (ipError) {
//               console.log("⚠️ Adblocker ne IP API rok di. Default currency use ho rahi hai.");
//             }
//           }

//           // 3. Store Update Kar Do
//           set({ 
//             rates: liveRates, 
//             currency: detectedCurrency, 
//             isLoading: false 
//           });

//         } catch (error) {
//           console.error("❌ Exchange rates fetch fail ho gaye:", error);
//           set({ isLoading: false });
//         }
//       }
//     }),
//     {
//       name: 'best4u-currency-pref', // LocalStorage mein is naam se save hoga
//       partialize: (state) => ({ 
//         currency: state.currency, 
//         hasUserSelected: state.hasUserSelected 
//       }), // Sirf selected currency save hogi, rates hamesha fresh aayenge!
//     }
//   )
// );