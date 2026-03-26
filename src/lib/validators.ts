import { z } from "zod";

export const loginSchema = z.object({
  login: z.string().min(1, "Введите логин"),
  password: z.string().min(1, "Введите пароль"),
});

export const createProductSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  description: z.string().optional(),
  composition: z.string().optional(),
  price: z.number().int().min(0, "Цена не может быть отрицательной"),
  ozonUrl: z.string().url().optional().or(z.literal("")),
  badges: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  videoUrl: z.string().optional(),
  weight: z.number().int().min(0).optional().nullable(),
  length: z.number().int().min(0).optional().nullable(),
  width: z.number().int().min(0).optional().nullable(),
  height: z.number().int().min(0).optional().nullable(),
  cdekFulfillmentProductId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
  price: z.number().int().min(0),
});

export const createOrderSchema = z.object({
  customerName: z.string().min(1, "Укажите ФИО").max(200),
  customerPhone: z.string().min(10, "Укажите телефон").max(20).regex(/^\+?[0-9\s\-()+]{10,20}$/, "Некорректный телефон"),
  customerEmail: z.string().email("Некорректный email").max(254),
  comment: z.string().max(1000).optional(),
  deliveryType: z.enum(["CDEK_PVZ", "CDEK_DOOR"]),
  deliveryAddress: z.string().max(500).optional(),
  cdekPvzCode: z.string().max(50).optional(),
  cdekPvzAddress: z.string().max(500).optional(),
  deliveryCityCode: z.number().int().min(1).optional(),
  deliveryCost: z.number().int().min(0),
  items: z.array(orderItemSchema).min(1, "Добавьте товары"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["NEW", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
