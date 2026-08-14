# 🛍️ Best4u - Modern Affiliate E-commerce Platform

**Best4u** ek high-performance, full-stack affiliate e-commerce web application hai jise **Next.js (App Router)**, **MongoDB Atlas**, aur **Tailwind CSS** par banaya gaya hai. Yeh platform users ko curated product recommendations explore karne, live currency convert karne, aur advanced search & filtering ke zariye best deals dhoondne ki sahulat deta hai, jabke admin ke liye ek powerful analytics dashboard bhi provide karta hai.

---

## 🚀 Key Features & Architecture

### 1. 🔍 Advanced Search, Debouncing & Spelling Suggestions
* **Debounced Search Input:** Search bar par user jab type karta hai, toh har keystroke par request bhejne ki bajaye ek intelligent debounce timer (`300ms`) lagaya gaya hai jo unnecessary API calls ko rokta hai.
* **Auto-Suggestions Dropdown:** 2 ya us se zyada characters type karne par live product suggestions (thumbnail, title, price) dropdown mein show hoti hain.
* **Typo & Spelling Tolerance:** MongoDB Atlas Full-Text Search Index aur custom query matching ki wajah se agar user se thori spelling mistake bhi ho jaye, tab bhi relevant results show ho jatay hain.
* **Clear Search State:** Search active hone par sidebar categories hide ho kar ek clean "Clear Search" button provide karta hai jo UX ko seamless banata hai.

### 2. ⚡ Pagination, Filtering & Sorting
* **Server-Side Pagination:** Shop page par `mongoose-paginate-v2` ya custom limit/page logic ke zariye infinite scroll / load more features handle kiye gaye hain.
* **Multi-Criteria Filtering:** Categories, Search queries, aur Sort options (`Newest`, `Price: Low to High`, `Price: High to Low`, `Featured`) URL query parameters (`searchParams`) ke sath fully synchronized hain.

### 3. 🗄️ Database & Indexing (MongoDB Atlas)
* **Atlas Full-Text Search Index:** Products ke `title` aur `tags` fields par text indexes (`productSchema.index({ title: 'text', tags: 'text' })`) configure kiye gaye hain taake database queries blazing fast rahen.
* **Lean Queries & Parallel Fetching:** Server components mein `Promise.all` aur `.lean()` use karke database overhead ko minimize kiya gaya hai.

### 4. 📦 Amazon Product Integration & Imports
* **Flexible Import System:** Admin panel ke zariye products ko 3 tareeqon se add kiya ja sakta hai:
  1. **Bulk Import:** Multiple products ek sath JSON/API ke zariye ingest karna.
  2. **Single Import:** Direct product link ya ID se fetch karna.
  3. **Manual Insert:** Custom title, description, features, aur affiliate links ke sath manual form.

### 5. ☁️ Cloudinary Media & Garbage Handling
* Cloudinary media storage integration ke sath images upload hoti hain.
* Admin panel se jab koi product delete hota hai, toh uske sath associated cloud media assets ko manage/clean (garbage handling) karne ka mechanism backend APIs mein built-in hai.

### 6. 📊 Admin Analytics & Click Tracking
* **Click Tracker Model:** User jab bhi "View Deal" par click karta hai, system click count record karta hai (`ClickTracker`).
* **Interactive Line & Bar Charts:** Recharts library ka use karke Admin Dashboard par **Product Clicks Analytics** ke liye aakash-jaisi smooth glowing **Line Chart (AreaChart)** aur Category Distribution ke liye **Bar Chart** banaye gaye hain, sath hi time-range filters (`Last 24h`, `7 Days`, `1 Month`, `All Time`) bhi available hain.

### 7. 🌐 Multi-Currency Support
* Zustand state management (`useCurrencyStore`) ke zariye user globally currency switch kar sakta hai (`USD`, `PKR`, `EUR`, `GBP`, etc.), aur saare products ki prices live conversion rates ke mutabiq automatically update ho jati hain.

### 8. 🛡️ Dynamic SEO & Schema.org (JSON-LD)
* **Global & Page-level Metadata:** Admin panel ki `SiteSettings` aur individual Product schemas se dynamic meta titles aur descriptions generate hotay hain.
* **Rich Snippets (JSON-LD):** Product pages par Schema.org structured data (`Product`, `Offer`, `AggregateRating`) inject kiya gaya hai taake Google search results mein Star Ratings aur Price directly show hon.

---

## 🛠️ Tech Stack

* **Frontend & Backend:** Next.js (App Router, Server & Client Components)
* **Styling:** Tailwind CSS, Lucide Icons, React Icons
* **Database:** MongoDB Atlas, Mongoose ODM
* **State Management:** Zustand
* **Validation & Forms:** Zod, React Hook Form
* **Charts:** Recharts
* **Deployment:** Vercel (Serverless Functions with ISR & Dynamic API routes)

---

## 📡 API Routes Documentation

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/shop` | `GET` | Fetches filtered, sorted, and paginated products with search support (`force-dynamic`). |
| `/api/categories` | `GET` | Retrieves all product categories for the shop sidebar and home slider. |
| `/api/search/suggest` | `GET` | Returns quick product suggestions for the navbar search bar debounce input. |
| `/api/analytics` | `GET` | Aggregates product click metrics filtered by time range, limit, and category. |
| `/api/categories/[id]` | `PUT/DELETE` | Admin routes for updating or removing product categories. |

---

