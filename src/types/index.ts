// ─── Employee / Auth ────────────────────────────────────────────────────────

export type EmployeeLevel =
  | "superAdmin"
  | "admin"
  | "employee"
  | "producer";

export interface Employee {
  _id: string;
  name: string;
  email: string;
  dp?: string;
  level: EmployeeLevel;
  token: string;
  refreshToken?: string;
  isArchive?: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  token: string;
}

// ─── Event ──────────────────────────────────────────────────────────────────

export type EventStatus =
  | "nowSelling"
  | "upcoming"
  | "past"
  | "voteToBring";

export type EventType = "movie" | "others";
export type ReleaseType = "private screen" | "theatrical" | "";

export interface Event {
  _id: string;
  name: string;
  slug: string;
  description: string;
  location: string;
  organizer: string;
  releaseDate: string;
  type: EventType;
  status: EventStatus;
  duration: string;
  cardImage: string;
  bannerImage: string;
  releaseType: ReleaseType;
  theatricalLink?: string;
  trailerVideoLink?: string;
  eventCurrency: string;
  isArchive: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventPayload {
  name: string;
  slug: string;
  description: string;
  location: string;
  organizer: string;
  releaseDate: string;
  type: EventType;
  status: EventStatus;
  duration: string;
  cardImage: File | null;
  bannerImage: File | null;
  releaseType: ReleaseType;
  theatricalLink?: string;
  trailerVideoLink?: string;
  eventCurrency: string;
}

// ─── Order ──────────────────────────────────────────────────────────────────

export interface Show {
  _id: string;
  date: string;
  startTime: string;
  event?: Event;
}

export interface Order {
  _id: string;
  orderId: string;
  transactionId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  status: "active" | "archived";
  show?: Show;
  totalAmount: number;
  isArchive: boolean;
  createdAt: string;
}

export interface OrderItem {
  _id: string;
  seatName: string;
  ticketCategory: string;
  price: number;
}

export interface SearchOrderResult {
  order: Order | null;
  seats: OrderItem[];
}

// ─── Dashboard ──────────────────────────────────────────────────────────────

export interface NowSellingEvent {
  _id: string;
  name: string;
  cardImage: string;
}

export interface DashboardInfo {
  totalOrder: number;
  totalSoldTickets: number;
  yesterdaySoldTickets: number;
  todaySoldTickets: number;
  last24HourSoldTickets: number;
  last7DaysSoldTickets: number;
  last15DaysSoldTickets: number;
  last30DaysSoldTickets: number;
  firstOrderRangeText: string;
  firstSoldTicketRangeText: string;
  nowSellingEvents: NowSellingEvent[];
}

// ─── Theater ────────────────────────────────────────────────────────────────

export interface Theater {
  _id: string;
  name: string;
  address: string;
  isArchive: boolean;
  isActive: boolean;
}

export interface Hall {
  _id: string;
  name: string;
  theater: string;
  isArchive: boolean;
}

// ─── Misc ────────────────────────────────────────────────────────────────────

export interface Country {
  _id: string;
  name: string;
  isArchive: boolean;
}

export interface State {
  _id: string;
  name: string;
  country: string;
  isArchive: boolean;
}

export interface City {
  _id: string;
  name: string;
  state: string;
  isArchive: boolean;
}

export interface TicketCategory {
  _id: string;
  name: string;
  isArchive: boolean;
}

export interface PromoCode {
  _id: string;
  code: string;
  discount: number;
  isArchive: boolean;
}

export interface Producer {
  _id: string;
  name: string;
  email: string;
  dp?: string;
  isArchive: boolean;
}

// ─── Customer ────────────────────────────────────────────────────────────────

export type CustomerStatus = "active" | "blocked";
export type CustomerProvider = "email" | "google" | "facebook" | string;

export interface Customer {
  _id: string;
  name: string;
  email: string;
  dp?: string;
  provider: CustomerProvider;
  status: CustomerStatus;
  isActive: boolean;
  totalBookings: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerBooking {
  _id: string;
  orderId: string;
  orderCode?: string;
  movieName: string;
  theaterName: string;
  showDate: string;
  showTime: string;
  seats: string[];
  totalAmount: number;
  paymentStatus: "PAID" | "PENDING" | "FAILED";
  status: string;
  createdAt: string;
}

export interface CustomerDetail extends Customer {
  totalAmountSpent: number;
  bookings: CustomerBooking[];
}

export interface UpdateCustomerStatusPayload {
  status: CustomerStatus;
}

// ─── Generic CRUD ────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export type FilterType = "active" | "archived" | "all";
