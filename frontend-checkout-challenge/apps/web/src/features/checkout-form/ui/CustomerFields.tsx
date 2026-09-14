import type { ReactElement } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Field } from '@/shared/ui/field/Field';
import { TextInput } from '@/shared/ui/field/TextInput';
import type { CustomerValues } from '../model/customer-schema';
import { PhoneInput } from './PhoneInput';
import styles from './CustomerFields.module.scss';

interface CustomerFieldsProps {
  form: UseFormReturn<CustomerValues>;
}

export function CustomerFields({ form }: CustomerFieldsProps): ReactElement {
  const {
    register,
    control,
    formState: { errors },
  } = form;

  return (
    <div className={styles.grid}>
      <Field label="Имя" error={errors.name?.message}>
        <TextInput {...register('name')} autoComplete="name" placeholder="Тестовый Покупатель" />
      </Field>
      <Field label="Email" error={errors.email?.message}>
        <TextInput
          type="email"
          {...register('email')}
          autoComplete="email"
          placeholder="buyer@example.test"
        />
      </Field>
      <Field
        label="Телефон"
        error={errors.phone?.message}
        hint={errors.phone ? undefined : 'Формат: +7 (999) 999-99-99'}
      >
        <PhoneInput control={control} name="phone" />
      </Field>
    </div>
  );
}
