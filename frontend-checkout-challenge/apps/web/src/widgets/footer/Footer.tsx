import type { ReactElement } from 'react';
import styles from './Footer.module.scss';

export function Footer(): ReactElement {
  return (
    <footer className={styles.footer}>
      <a
        className={styles.credit}
        href="https://github.com/Therealkosbruh"
        target="_blank"
        rel="noopener noreferrer"
      >
        © by Therealkos
      </a>
    </footer>
  );
}
