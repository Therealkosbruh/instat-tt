import type { CheckoutOptions } from '@/entities/checkout-options/api/checkout-options';

type DeliveryMethodOption = CheckoutOptions['deliveryMethods'][number];

export function estimateShippingCost(
  method: DeliveryMethodOption | undefined,
  subtotal: number,
): number {
  if (!method) return 0;
  if (method.freeFrom !== null && subtotal >= method.freeFrom) return 0;
  return method.price;
}
