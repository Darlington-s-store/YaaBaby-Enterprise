import { products } from "./catalog";

export type OrderStatus = "Pending" | "Paid" | "Shipped" | "Delivered" | "Cancelled" | "Refunded";

export type OrderItem = {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: string;
};

export type Order = {
  id: string;
  date: string;
  customer: { name: string; email: string; phone: string; avatar?: string };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: OrderStatus;
  payment: "Paystack" | "MoMo" | "Card" | "Cash on delivery";
  shippingAddress: { name: string; line1: string; city: string; region: string; phone: string };
  tracking?: string;
};

const mk = (i: number, status: OrderStatus, qty: number, prodIdx: number, customer: { name: string; email: string; phone: string }): Order => {
  const p = products[prodIdx % products.length];
  const subtotal = p.price * qty;
  const shipping = subtotal > 500 ? 0 : 35;
  const tax = Math.round(subtotal * 0.025);
  return {
    id: `YBE-${(100000 + i).toString(16).toUpperCase()}`,
    date: new Date(Date.now() - i * 86400000 * 2).toISOString().slice(0, 10),
    customer,
    items: [{ productId: p.id, name: p.name, image: p.image, price: p.price, quantity: qty, variant: p.colors?.[0] }],
    subtotal, shipping, tax,
    total: subtotal + shipping + tax,
    status, payment: i % 3 === 0 ? "MoMo" : i % 2 === 0 ? "Paystack" : "Card",
    shippingAddress: { name: customer.name, line1: "12 Liberation Rd, East Legon", city: "Accra", region: "Greater Accra", phone: customer.phone },
    tracking: status === "Shipped" || status === "Delivered" ? `GH${1000000 + i}` : undefined,
  };
};

const customers = [
  { name: "Ama Boateng", email: "ama@example.com", phone: "+233 24 555 0101" },
  { name: "Kwesi Mensah", email: "kwesi@example.com", phone: "+233 24 555 0102" },
  { name: "Adwoa Asante", email: "adwoa@example.com", phone: "+233 24 555 0103" },
  { name: "Yaw Owusu", email: "yaw@example.com", phone: "+233 24 555 0104" },
  { name: "Akua Frimpong", email: "akua@example.com", phone: "+233 24 555 0105" },
  { name: "Kojo Asare", email: "kojo@example.com", phone: "+233 24 555 0106" },
  { name: "Efua Mensa", email: "efua@example.com", phone: "+233 24 555 0107" },
];

const statuses: OrderStatus[] = ["Pending", "Paid", "Shipped", "Delivered", "Delivered", "Cancelled", "Refunded", "Paid"];

export const orders: Order[] = Array.from({ length: 18 }).map((_, i) =>
  mk(i, statuses[i % statuses.length], (i % 3) + 1, i, customers[i % customers.length]),
);

// User-specific
export const myOrders: Order[] = orders.slice(0, 6).map((o, i) => ({
  ...o, customer: { name: "You", email: "you@example.com", phone: "+233 20 000 0000" },
  id: `YBE-${(900000 + i).toString(16).toUpperCase()}`,
}));

export const myWishlist = products.slice(0, 5);

export const myAddresses = [
  { id: "a1", label: "Home", name: "Yaa Mensah", line1: "12 Liberation Rd, East Legon", city: "Accra", region: "Greater Accra", phone: "+233 20 555 0101", isDefault: true },
  { id: "a2", label: "Office", name: "Yaa Mensah", line1: "Ridge Tower, Floor 8", city: "Accra", region: "Greater Accra", phone: "+233 20 555 0101", isDefault: false },
];

export const myPaymentMethods = [
  { id: "pm1", type: "MoMo" as const, label: "MTN MoMo", detail: "•••• 0101", isDefault: true },
  { id: "pm2", type: "Card" as const, label: "Visa", detail: "•••• 4242", isDefault: false },
];

// Admin analytics mocks
export const revenueSeries = [
  { day: "Mon", value: 18200 }, { day: "Tue", value: 22400 }, { day: "Wed", value: 19800 },
  { day: "Thu", value: 28600 }, { day: "Fri", value: 34200 }, { day: "Sat", value: 41200 }, { day: "Sun", value: 26800 },
];

export const adminCustomers = customers.map((c, i) => ({
  ...c, id: `CUST-${1000 + i}`,
  joined: new Date(Date.now() - (i + 1) * 86400000 * 18).toISOString().slice(0, 10),
  orders: 1 + (i % 6), spent: 220 + i * 380,
  status: i % 7 === 0 ? "VIP" : "Active",
}));
