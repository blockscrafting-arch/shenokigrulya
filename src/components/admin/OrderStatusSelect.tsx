"use client";

import { useRouter } from "next/navigation";
import type { OrderStatus } from "@prisma/client";

const STATUSES: OrderStatus[] = ["NEW", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

const LABELS: Record<OrderStatus, string> = {
  NEW: "Новый",
  PROCESSING: "В обработке",
  SHIPPED: "Отправлен",
  DELIVERED: "Доставлен",
  CANCELLED: "Отменён",
};

interface OrderStatusSelectProps {
  orderId: string;
  currentStatus: OrderStatus;
}

export function OrderStatusSelect({ orderId, currentStatus }: OrderStatusSelectProps) {
  const router = useRouter();

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value as OrderStatus;
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium">Статус заказа:</label>
      <select
        value={currentStatus}
        onChange={handleChange}
        className="rounded-lg border border-black/10 px-3 py-2 text-sm"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {LABELS[s]}
          </option>
        ))}
      </select>
    </div>
  );
}
