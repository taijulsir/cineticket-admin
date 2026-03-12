// ─── API Base Paths ────────────────────────────────────────────────────────

export const AUTH_BASE = "api/employeeApp/public/auth/";
export const PROTECTED_BASE = "api/employeeApp/protected/";

// ─── Auth API endpoints ────────────────────────────────────────────────────

export const AUTH_APIS = {
  LOGIN: "login/",
  REGISTER: "register/",
  FORGOT_PASSWORD: "forgotEmployeePassword/",
  RESET_PASSWORD: "resetEmployeePassword/",
} as const;

// ─── Protected API endpoints ──────────────────────────────────────────────

export const EMPLOYEE_API = "employees/";
export const EMPLOYEE_INVITE_API = "employeeInvite/";
export const CUSTOMER_API = "customers/";
export const CUSTOMERS_ADMIN_API = "admin/customers/";
export const ORDERS_API = "orders/";
export const PRODUCER_API = "producers/";
export const EVENTS_API = "events/";
export const THEATER_API = "theaters/";
export const TICKET_CATEGORY_API = "ticketCategories/";
export const FEES_API = "fees/";
export const PROMO_CODE_API = "promoCodes/";
export const COUNTRY_API = "countries/";
export const STATE_API = "states/";
export const CITY_API = "cities/";
export const HERO_SLIDER_API = "heroSliders/";
export const ADS_API = "ads/";
export const SOCIAL_LINKS_API = "socialLinks/";
export const DASHBOARD_API = "getDashboardInfo";
export const SEARCH_ORDER_API = "orders/searchOrderById";
export const DUPLICATE_ORDERS_API = "orders/duplicateOrders";
export const ACCEPT_INVITE_API = "auth/accept-invite";

// ─── Role constants ────────────────────────────────────────────────────────

export const ALLOWED_ROLES = ["employee", "admin", "superAdmin"] as const;
export const ADMINS_ONLY = ["admin", "superAdmin"] as const;
export const EVENT_STATUS_ROLES = [
  "producer",
  "employee",
  "admin",
  "superAdmin",
] as const;

// ─── Previous platform stats (hardcoded legacy value) ─────────────────────

export const PREVIOUS_PLATFORM_SOLD_TICKETS = 5300 * 2;
