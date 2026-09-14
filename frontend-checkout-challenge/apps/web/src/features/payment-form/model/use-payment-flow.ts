'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Scenario } from '@checkout/contracts';
import {
  useCreatePayment,
  usePaymentPolling,
  usePayments,
  useSandbox,
  useSimulatePayment,
} from '@/entities/payment/model/use-payment';
import { useIdempotencyKey } from '@/shared/api/idempotency';
import { getErrorMessage } from '@/shared/lib/get-error-message';

export function usePaymentFlow(orderId: string | undefined) {
  const queryClient = useQueryClient();
  const { data: payments } = usePayments(orderId);
  const [activePaymentId, setActivePaymentId] = useState<string | undefined>(undefined);
  const [selectedCardId, setSelectedCardId] = useState<string | undefined>(undefined);
  const [flowError, setFlowError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (activePaymentId || !payments || payments.length === 0) return;
    setActivePaymentId(payments[0].id);
  }, [payments, activePaymentId]);

  const { data: payment } = usePaymentPolling(activePaymentId);
  const sandbox = useSandbox(!activePaymentId);
  const createPayment = useCreatePayment();
  const simulate = useSimulatePayment();
  const idempotency = useIdempotencyKey();

  useEffect(() => {
    if (payment?.status === 'succeeded' && orderId) {
      void queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    }
  }, [payment?.status, orderId, queryClient]);

  const isStarting = createPayment.isPending || simulate.isPending;

  async function submit(scenario: Scenario): Promise<void> {
    if (!orderId) return;
    setFlowError(undefined);
    try {
      const created = await createPayment.mutateAsync({ orderId, idempotencyKey: idempotency.getKey() });
      await simulate.mutateAsync({ paymentId: created.id, scenario });
      setActivePaymentId(created.id);
    } catch (error) {
      setFlowError(getErrorMessage(error));
    }
  }

  function pay(): void {
    const card = sandbox.data?.cards.find((item) => item.id === selectedCardId);
    if (!card) return;
    void submit(card.scenario);
  }

  function cancel(): void {
    void submit('cancel');
  }

  function retry(): void {
    idempotency.renew();
    setActivePaymentId(undefined);
    setSelectedCardId(undefined);
    setFlowError(undefined);
  }

  return {
    sandbox,
    selectedCardId,
    setSelectedCardId,
    pay,
    cancel,
    retry,
    isStarting,
    flowError,
    payment,
    hasActivePayment: activePaymentId !== undefined,
  };
}
