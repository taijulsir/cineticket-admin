# CineTicket Admin — Next.js 14

A fully-featured admin dashboard for the CineTicket platform, migrated from Create React App to **Next.js 14 App Router** with TypeScript, shadcn/ui, and a scalable industry-standard folder structure.

---

## ✨ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 (strict) |
| Styling | TailwindCSS 3 + CSS variables (dark theme) |
| Components | shadcn/ui (Radix UI primitives) |
| Forms | React Hook Form 7 + Zod 3 |
| Tables | TanStack Table 8 |
| HTTP | Axios 1.7 |
| State | Zustand 5 (available, not yet wired) |
| Toasts | Sonner |
| Icons | Lucide React |

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
cd cineticket-admin-next
npm install

# 2. Configure environment
cp .env.local.example .env.local
# Edit .env.local and set your backend URL

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## ⚙️ Environment Variables

Create a `.env.local` file (already provided as a template):

```env
# Backend base URL — must end with /
NEXT_PUBLIC_BACKEND_URL=http://localhost:5010/

# Digital Ocean Spaces (for image serving)
NEXT_PUBLIC_SPACES_URL=https://your-space.nyc3.digitaloceanspaces.com
```

---

## 📁 Folder Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Unauthenticated routes (login, register, etc.)
│   │   ├── login/page.tsx
│   │   ├── register/[token]/page.tsx
│   │   ├── recover-password/page.tsx
│   │   └── reset-password/[token]/page.tsx
│   └── (dashboard)/              # Protected routes (redirect to /login if not authed)
│       ├── page.tsx              # Dashboard
│       ├── events/[status]/      # Events list (nowSelling, upcoming, past, voteToBring)
│       ├── events-status/        # Event status hub (landing for producers)
│       ├── orders/[showId]/      # Orders list
│       ├── search-order/         # Search by orderId or transactionId
│       ├── duplicate-orders/     # Duplicate seat conflict detection
│       ├── producers/            # Producers CRUD
│       ├── theaters/             # Theaters CRUD → /theaters/[id]/halls
│       ├── ticket-categories/    # Ticket categories CRUD
│       ├── fees/                 # Platform fees CRUD
│       ├── promo-codes/          # Promo codes CRUD
│       ├── countries/            # Countries CRUD
│       ├── states/               # States CRUD
│       ├── cities/               # Cities CRUD
│       ├── employees/            # Employee management (admins only)
│       ├── users/                # Customer management
│       └── settings/             # CMS settings hub
│           ├── hero-sliders/
│           ├── ads/
│           └── social-links/
│
├── components/
│   ├── shared/                   # Reusable components used across pages
│   │   ├── CrudPage.tsx          # Generic CRUD page wrapper
│   │   ├── tables/ReusableTable.tsx
│   │   ├── cards/StatsCard.tsx
│   │   ├── modals/
│   │   │   ├── ReusableModal.tsx
│   │   │   └── ConfirmDialog.tsx
│   │   ├── buttons/ActionDropdown.tsx
│   │   ├── forms/
│   │   │   ├── FormInput.tsx
│   │   │   └── FormSelect.tsx
│   │   ├── Sidebar/
│   │   └── Header/
│   └── ui/                       # shadcn/ui primitives
│       ├── button.tsx
│       ├── badge.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       └── tooltip.tsx
│
├── context/
│   └── AuthContext.tsx           # Auth state (employee, login, register, logout)
│
├── features/                     # Feature-specific components and schemas
│   └── events/
│       ├── eventSchema.ts        # Zod schema shared by create + update forms
│       ├── CreateEventForm.tsx
│       └── UpdateEventForm.tsx
│
├── hooks/
│   └── useAxiosInstance.ts       # Protected Axios hook (attaches Bearer token)
│
├── lib/
│   ├── utils.ts                  # cn(), formatTimeIn12Hour(), getImageUrl(), etc.
│   ├── constants.ts              # All API endpoint paths and role constants
│   └── api/
│       └── apiClient.ts          # createAuthClient() + createProtectedClient()
│
├── services/                     # All API calls separated by domain
│   ├── eventService.ts
│   ├── orderService.ts
│   ├── producerService.ts
│   ├── employeeService.ts
│   ├── theaterService.ts
│   ├── showService.ts
│   └── cmsService.ts             # customers, countries, states, cities, fees,
│                                 # promoCodes, heroSliders, ads, socialLinks
│
├── styles/
│   └── globals.css               # TailwindCSS directives + CSS variable dark theme
│
└── types/
    └── index.ts                  # All TypeScript interfaces
```

---

## 🔐 Authentication Flow

1. User visits any `/` route → `(dashboard)/layout.tsx` checks `localStorage` for `employee` token
2. If no token → redirect to `/login`
3. On login → `AuthContext.login()` calls `POST /api/employeeApp/public/auth/login/`
4. JWT stored in `localStorage` as the `employee` object
5. All protected routes use `useAxiosInstance()` which attaches `Authorization: Bearer <token>`
6. On 401 response → auto-logout and redirect to `/login`

---

## 👥 Role-Based Access

| Role | Redirect after login | Sidebar |
|------|---------------------|---------|
| `superAdmin` | `/` (dashboard) | Full nav |
| `admin` | `/` (dashboard) | Full nav |
| `employee` | `/` (dashboard) | Full nav |
| `producer` | `/events-status` | Events only |

---

## 📦 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 🎨 Theme

The project uses a dark theme by default configured via CSS variables in `src/styles/globals.css`. Primary colour is **yellow** (`hsl(47.9, 95.8%, 53.1%)`).

---

## 🗺️ Original → New Mapping

| Old (React CRA) | New (Next.js 14) |
|----------------|-----------------|
| `AppContext.js` | `src/context/AuthContext.tsx` |
| `useAxiosInstance.js` | `src/hooks/useAxiosInstance.ts` |
| `APIs.js` + `AuthAPIs.js` | `src/lib/constants.ts` |
| `CRUDBoilerPlate.js` | `src/components/shared/CrudPage.tsx` |
| `Modal.js` | `src/components/shared/modals/ReusableModal.tsx` |
| `ArchiveItem.js` | `src/components/shared/modals/ConfirmDialog.tsx` |
| React Router `<Route>` | `app/(dashboard)/` file-system routing |
| Per-field `useState` forms | React Hook Form + Zod |
| `react-tooltip` | Radix Tooltip |
| `react-toastify` | Sonner |
| `react-icons` | Lucide React |
