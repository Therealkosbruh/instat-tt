import type { ReactElement } from 'react';
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { TextInput } from '@/shared/ui/field/TextInput';
import { formatPhoneForDisplay, toE164 } from '../lib/phone';

interface PhoneInputProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  id?: string;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

export function PhoneInput<T extends FieldValues>({
  control,
  name,
  ...rest
}: PhoneInputProps<T>): ReactElement {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <TextInput
          {...rest}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+7 (999) 999-99-99"
          value={formatPhoneForDisplay(typeof field.value === 'string' ? field.value : '')}
          onChange={(event) => field.onChange(toE164(event.target.value))}
          onBlur={field.onBlur}
          ref={field.ref}
        />
      )}
    />
  );
}
