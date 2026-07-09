export type ProductDTO = {
  id: string;
  name: string;
  description: string;
  price: number;
  costPrice: number;
  images: string[];
  category: string;
  stock: number;
  featured: boolean;
  active: boolean;
};

export type DeliveryZoneDTO = {
  id: string;
  name: string;
  country: string;
  state: string;
  wholeCountry: boolean;
  areas: string[];
  charge: number;
  estimatedDays: string;
  active: boolean;
  freeAbove: number | null;
  sortOrder: number;
};

export type CalculateDeliveryResult = {
  zone: string;
  charge: number;
  isFree: boolean;
  freeAboveAmount: number | null;
  remainingForFree: number | null;
  estimatedDelivery: string;
};

export type CartItem = {
  product: ProductDTO;
  quantity: number;
};

export type AddressDTO = {
  id?: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  area: string;
  city: string;
  postalCode?: string;
  isDefault?: boolean;
};

export type OrderDTO = {
  id: string;
  email: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  discount: number;
  couponCode: string | null;
  tax: number;
  deliveryCharge: number;
  total: number;
  deliveryArea: string;
  invoiceNumber: number | null;
  refundStatus: string;
  refundedAmount: number;
  paymentRef: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: { name: string; images: string[] };
  }>;
};

export type ReviewDTO = {
  id: string;
  productId: string;
  productName: string;
  authorName: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: string;
};

export type CouponDTO = {
  id: string;
  code: string;
  type: string;
  value: number;
  active: boolean;
  minSubtotal: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  createdAt: string;
};

export type TestimonialDTO = {
  id: string;
  name: string;
  role: string;
  quote: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
