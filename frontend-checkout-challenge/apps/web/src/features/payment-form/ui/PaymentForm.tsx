'use client';

import type { ReactElement } from 'react';
import { InfoBlock, InfoBlockSkeleton } from '@/shared/ui/info-block/InfoBlock';
import { usePaymentFlow } from '../model/use-payment-flow';
import { PaymentStatus } from './PaymentStatus';
import { TestCardSelector } from './TestCardSelector';

interface PaymentFormProps {
  orderId: string;
}

export function PaymentForm({ orderId }: PaymentFormProps): ReactElement {
  const flow = usePaymentFlow(orderId);

  if (flow.hasActivePayment) {
    if (!flow.payment) return <InfoBlockSkeleton count={1} />;
    return <PaymentStatus payment={flow.payment} onRetry={flow.retry} />;
  }

  if (flow.sandbox.isPending) return <InfoBlockSkeleton count={1} />;
  if (flow.sandbox.isError || !flow.sandbox.data) {
    return <InfoBlock status="error" actionLabel="Повторить" onAction={() => void flow.sandbox.refetch()} />;
  }

  return (
    <TestCardSelector
      cards={flow.sandbox.data.cards}
      selectedCardId={flow.selectedCardId}
      onSelect={flow.setSelectedCardId}
      onPay={flow.pay}
      onCancel={flow.cancel}
      isBusy={flow.isStarting}
      error={flow.flowError}
    />
  );
}
