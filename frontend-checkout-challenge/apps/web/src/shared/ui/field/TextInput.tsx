import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { joinClassNames } from '@/shared/lib/join-class-names';
import styles from './TextInput.module.scss';

type TextInputProps = ComponentPropsWithoutRef<'input'>;

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { className, ...rest },
  ref,
) {
  return <input ref={ref} className={joinClassNames(styles.input, className)} {...rest} />;
});
