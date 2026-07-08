export type ProductDTO = {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  featured: boolean;
  active: boolean;
};

export type DeliveryZoneDTO = {
  id: string;
  name: string;
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
  deliveryCharge: number;
  total: number;
  deliveryArea: string;
  createdAt: string;
  items: Array<{ id: string; quantity: number; price: number; product: { name: string; images: string[] } }>;
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
