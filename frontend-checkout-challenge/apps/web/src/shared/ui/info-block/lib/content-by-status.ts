import type { IconName } from '../../icon/Icon';

export type InfoBlockStatus = 'error' | 'empty' | 'emptyCart';

interface StatusContent {
  icon: IconName;
  title: string;
  text: string;
}

export const CONTENT_BY_STATUS: Record<InfoBlockStatus, StatusContent> = {
  error: {
    icon: 'alert',
    title: 'Что-то пошло не так',
    text: 'Не получилось загрузить данные. Проверьте соединение и попробуйте ещё раз.',
  },
  empty: {
    icon: 'store',
    title: 'Ничего не найдено',
    text: 'Пока здесь пусто.',
  },
  emptyCart: {
    icon: 'cart',
    title: 'Корзина пуста',
    text: 'Добавьте товары из каталога, чтобы оформить заказ.',
  },
};
