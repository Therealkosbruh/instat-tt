import type { Delivery } from '@checkout/contracts';
import type { CheckoutOptions } from '@/entities/checkout-options/api/checkout-options';

export function describeDelivery(
  delivery: Delivery,
  deliveryMethods: CheckoutOptions['deliveryMethods'] | undefined,
): string {
  if (delivery.method === 'pickup') {
    const point = deliveryMethods
      ?.find((method) => method.id === 'pickup')
      ?.pickupPoints.find((item) => item.id === delivery.pickupPointId);
    return point ? `Самовывоз: ${point.title}, ${point.address}` : 'Самовывоз';
  }

  const { city, street, house, apartment } = delivery.address;
  return `Курьер: ${city}, ${street}, ${house}${apartment ? `, кв. ${apartment}` : ''}`;
}
