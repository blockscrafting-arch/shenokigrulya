import type { OrderStatus, PaymentStatus, DeliveryType } from "@prisma/client";

export type { OrderStatus, PaymentStatus, DeliveryType };

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string | null;
}
