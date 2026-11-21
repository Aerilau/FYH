import { shopCards } from '../data/shopItems';
import { PixelIcon } from './PixelIcon';

type ShopPopupProps = {
  coins: number;
  ownedCards: string[];
  onPurchase: (cardId: string) => void;
  onClose: () => void;
};

export default function ShopPopup({ coins, ownedCards, onPurchase, onClose }: ShopPopupProps) {
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="popup-card shop-popup" role="dialog" aria-modal="true" aria-labelledby="shop-heading">
    <div className="popup-heading"><div><span className="eyebrow">A VERY IMPORTANT DESTINATION</span><h2 id="shop-heading">The Cozy Corner Shop</h2></div><button className="sprite-button close-button" onClick={onClose} aria-label="Close shop"><PixelIcon name="close" size={19}/></button></div>
    <div className="shop-wallet"><span>Your cozy wallet</span><strong><PixelIcon name="coin" size={18}/>{coins.toLocaleString()} coins</strong></div>
    <div className="shop-card-grid">{shopCards.map((card) => {
      const owned = ownedCards.includes(card.id);
      const canAfford = coins >= card.price;
      return <article className={`shop-card${owned ? ' is-owned' : ''}`} key={card.id}>
        <div className="shop-card-art"><img src={card.image} alt={`${card.title} collectible card`} loading="lazy"/><span>NAP CARD</span></div>
        <div className="shop-card-info"><h3>{card.title}</h3><p>{card.description}</p>
          <div className="shop-card-price"><PixelIcon name="coin" size={18}/><strong>{card.price}</strong><small>coins</small></div>
          <button className="primary-button shop-buy" disabled={owned || !canAfford} onClick={() => onPurchase(card.id)}>{owned ? 'COLLECTED' : canAfford ? 'BUY CARD' : 'NEED MORE COINS'}</button>
        </div>
      </article>;
    })}</div>
    <p className="shop-coming-soon"><span>✦</span> More cozy cards coming soon! <span>✦</span></p>
  </section></div>;
}
