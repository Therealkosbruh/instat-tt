import type { ComponentPropsWithoutRef, ReactElement } from 'react';
import { joinClassNames } from '@/shared/lib/join-class-names';
import { Icon } from '../icon/Icon';
import styles from './Button.module.scss';

type ButtonVariant = 'primary' | 'ghost' | 'danger';

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  loading = false,
  fullWidth = false,
  disabled,
  className,
  type = 'button',
  children,
  ...rest
}: ButtonProps): ReactElement {
  return (
    <button
      type={type}
      className={joinClassNames(
        styles.button,
        styles[variant],
        fullWidth && styles.fullWidth,
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <Icon name="spinner" size={16} className={styles.spinner} />}
      <span>{children}</span>
    </button>
  );
}
