export type ShopCard = {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
};

export const shopCards: ShopCard[] = [
  {
    id: 'self-care-snorlax',
    title: 'Self-Care Snorlax',
    description: 'A little glow, a lot of naps.',
    price: 500,
    image: new URL('../assets/shop-cards/self-care-card.jpg', import.meta.url).href
  },
  {
    id: 'bigger-better-snorlax',
    title: 'Bigger Better Snorlax',
    description: 'Discipline builds a better nap.',
    price: 500,
    image: new URL('../assets/shop-cards/gym-card.jpg', import.meta.url).href
  },
  {
    id: 'cozy-content-night',
    title: 'Cozy Content Night',
    description: 'One more video, then bedtime.',
    price: 500,
    image: new URL('../assets/shop-cards/gaming-card.jpg', import.meta.url).href
  },
  {
    id: 'snack-nap-repeat',
    title: 'Snack, Nap, Repeat',
    description: 'A perfectly balanced routine.',
    price: 500,
    image: new URL('../assets/shop-cards/snack-nap-card.jpg', import.meta.url).href
  }
];
