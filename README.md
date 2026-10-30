# ELNIX POWERZONE — Wholesale & Retail Web Platform & CMS

A multi-page web platform and CMS built for **ELNIX POWERZONE** (Batteries, Electricals, Plumbing, and Sanitary) located in Eruvely, Chottanikkara, Ernakulam, Kerala.

Built with **Next.js 15 (App Router)**, **Tailwind CSS v4**, **Supabase Backend & Authentication**, **Cloudinary Media Storage**, and **Sonner Toast Notifications**.

---

## 🚀 Key Features

### 1. Exact Design Matching Public Pages
- **Home Page (`/`)**: 
  - Brand header with logo, navigation, direct phone CTA `8848 318 521`, and *Get a Quote* modal.
  - Hero banner with badge *WHOLESALE & RETAIL*, headline *"Your Trusted Partner for Every Connection"*, CTAs, and 4-metric feature strip.
  - *OUR PRODUCTS* 4-Category showcase: Batteries, Electricals, Plumbing, Sanitary.
  - *FEATURED PRODUCTS* Popular products grid with quick quote enquiry.
  - *CHANNEL PARTNERS* Brand showcase: Exide, SF Sonic, Bosch, Luminous, Livguard, V-Guard, Finolex, RR Kabel, Polycab, Cera, Somany, Jaquar.
  - *ABOUT ELNIX POWERZONE* Showroom feature with 4 value propositions.
  - *OUR LOCATION* Eruvely store address, contact cards, and interactive Google Map.
  - *NEED PRODUCT INFORMATION?* Dark showroom CTA section with Direct Call & WhatsApp buttons.
  - Modern footer with quick links, categories, store hours, and social media links.
- **About Page (`/about`)**: Full brand heritage, wholesale vs. retail supply chain, 4 commitments, and milestone timeline.
- **Products Catalog (`/products`)**: Dynamic filtering by category, brand, search keyword, in-stock status, and quick quote trigger.
- **Product Detail View (`/products/[slug]`)**: Technical specifications table, gallery viewer, stock status, direct WhatsApp enquiry, and related products.
- **Our Locations (`/locations`)**: Eruvely showroom address, interactive map, parking/dock amenities, and driving routes from Thripunithura, Kochi, and Piravom.
- **Contact Page (`/contact`)**: Interactive inquiry submission form, store hours, WhatsApp direct chat, and FAQ accordion.
- **Legal Pages (`/privacy`, `/terms`)**: Production-ready privacy policy and terms of service.

---

### 2. Role-Protected Admin CMS (`/admin`)
- **Protected Access**: Only authenticated users with `role: 'admin'` in Supabase `profiles` table can access. Unauthorized users are redirected to `/admin/login`.
- **Top-Right Toast Notifications**: All actions (create, edit, delete, status change, upload) trigger top-right feedback via `sonner`.
- **Products Management (`/admin/products`)**:
  - Full CRUD operations with category, brand, tagline, description, price, unit, and specifications key-value editor.
  - In-stock, popular, and featured toggles.
- **Categories Management (`/admin/categories`)**:
  - Full CRUD for store departments with Cloudinary cover images.
- **Brands Management (`/admin/brands`)**:
  - Manage partner logos (Exide, Polycab, Jaquar, etc.) with Cloudinary logo upload.
- **Customer Leads Pipeline (`/admin/enquiries`)**:
  - View real-time quote requests and general inquiries.
  - Status management (`pending`, `contacted`, `completed`).
  - Internal staff notes and direct WhatsApp/Phone response buttons.
- **Store Settings (`/admin/settings`)**:
  - Edit store name, contact phone, WhatsApp number, email, address, and timings.

---

### 3. Cloudinary Integration with Drag & Drop + Delete Confirmation
- **Upload Component (`ImageUploader.tsx`)**:
  - **Option 1**: Drag and drop image files directly onto the upload zone.
  - **Option 2**: Click "browse files" / "Choose File" for native file picker.
  - Automatic progress bar and Cloudinary asset badge.
- **Cloudinary Deletion API (`/api/cloudinary/delete`)**:
  - Uses Cloudinary `uploader.destroy(public_id)` to permanently purge deleted assets.
- **Confirmation Modal (`ConfirmationModal.tsx`)**:
  - Displays thumbnail preview of target item and requires explicit confirmation before any image or record deletion.

---

## 🗄️ Supabase Database Schema

A ready-to-run schema script is provided in:
`supabase/schema.sql`

### How to Apply in Supabase:
1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to your project -> **SQL Editor**.
3. Copy the entire contents of `supabase/schema.sql` and click **Run**.
4. The script creates:
   - `profiles` table with `role` check constraint (`'admin' | 'user'`).
   - `categories`, `brands`, `products`, `enquiries`, and `site_settings` tables.
   - Row-Level Security (RLS) policies allowing public read and admin-only write.
   - Auto-admin trigger on first user sign-up.
   - Initial seed data matching the Elnix Powerzone design.

To promote any registered user to admin manually:
```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

---

## 🔑 Environment Variables Setup

Configure `.env.local` with your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=elnix_uploads

# Store Info
NEXT_PUBLIC_STORE_PHONE=8848 318 521
NEXT_PUBLIC_STORE_WHATSAPP=918848318521
NEXT_PUBLIC_STORE_EMAIL=elnixpowerzone@gmail.com
```

*Note: The app includes an offline/local fallback store layer so the frontend and admin dashboard work immediately even before live credentials are entered.*

### Default Admin Login (Local / Demo):
- **URL**: `/admin/login`
- **Email**: `admin@elnixpowerzone.com`
- **Password**: `admin123` (or click *"Fill Demo Admin"* on the login page)

---

## 🛠️ Technology Stack
- **Framework**: Next.js 15 (App Router, Server & Client Components)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`)
- **Language**: TypeScript
- **Icons**: Lucide React
- **Notifications**: Sonner (Top-Right position)
- **Database / Auth**: Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- **Media CDN**: Cloudinary (`cloudinary` v2)

