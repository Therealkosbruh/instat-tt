'use client';

import type { ReactElement } from 'react';
import { useProducts } from '@/entities/product/model/use-products';
import { ProductCard } from '@/entities/product/ui/ProductCard';
import { AddToCartButton } from '@/features/add-to-cart/AddToCartButton';
import { InfoBlock, InfoBlockSkeleton } from '@/shared/ui/info-block/InfoBlock';
import styles from './ProductCatalog.module.scss';

export function ProductCatalog(): ReactElement {
  const { data: products, isPending, isError, refetch } = useProducts();

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Каталог</h1>
      {isPending && <InfoBlockSkeleton />}
      {isError && (
        <InfoBlock status="error" actionLabel="Повторить" onAction={() => void refetch()} />
      )}
      {products && products.length === 0 && <InfoBlock status="empty" />}
      {products && products.length > 0 && (
        <div className={styles.grid}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              action={<AddToCartButton productId={product.id} stock={product.stock} />}
            />
          ))}
        </div>
      )}
    </div>
  );
}
