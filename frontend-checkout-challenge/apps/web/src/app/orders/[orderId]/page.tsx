import type { ReactElement } from 'react';
import { OrderView } from '@/widgets/order-view/OrderView';

interface OrderPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderPage({ params }: OrderPageProps): Promise<ReactElement> {
  const { orderId } = await params;
  return <OrderView orderId={orderId} />;
}
