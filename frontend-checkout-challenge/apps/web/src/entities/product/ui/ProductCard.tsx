import type { ReactElement, ReactNode } from 'react';
import type { Product } from '@checkout/contracts';
import { joinClassNames } from '@/shared/lib/join-class-names';
import { formatPrice } from '@/shared/lib/format-price';
import styles from './ProductCard.module.scss';

interface ProductCardProps {
  product: Product;
  action?: ReactNode;
}

export function ProductCard({ product, action }: ProductCardProps): ReactElement {
  const inStock = product.stock > 0;

  return (
    <article className={joinClassNames(styles.card, !inStock && styles.soldOut)}>
      <div className={styles.media}>
        {!inStock && <span className={styles.badge}>Нет в наличии</span>}
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{product.title}</h3>
        <p className={styles.description}>{product.description}</p>
        <div className={styles.footer}>
          <span className={styles.price}>{formatPrice(product.price)}</span>
          {action}
        </div>
      </div>
    </article>
  );
}
