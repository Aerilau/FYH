import { useEffect, useState } from 'react';
import Hud from './components/Hud';
import PetScene from './components/PetScene';
import QuoteCard from './components/QuoteCard';
import TasksPopup from './components/TasksPopup';
import ShopPopup from './components/ShopPopup';
import { PixelIcon } from './components/PixelIcon';
import { pickQuote } from './data/quotes';
import type { Task } from './data/tasks';
import { claimTask, loadPetState, purchaseShopCard, subscribePetState } from './lib/taskStore';
import { getWellbeingStage } from './data/wellbeing';

export default function App() {
  const [quote, setQuote] = useState(() => pickQuote());
  const [coins, setCoins] = useState(0);
  const [health, setHealth] = useState(45);
  const [claimed, setClaimed] = useState<string[]>([]);
  const [ownedCards, setOwnedCards] = useState<string[]>([]);
  const [celebratingTask, setCelebratingTask] = useState<string | null>(null);
  const [popup, setPopup] = useState<'tasks' | 'shop' | null>(null);

  useEffect(() => {
    const applyState = (state: { coins: number; health: number; claimed: string[]; ownedCards: string[] }) => { setCoins(state.coins); setHealth(state.health); setClaimed(state.claimed); setOwnedCards(state.ownedCards); };
    const unsubscribe = subscribePetState(applyState);
    loadPetState().then(applyState).catch(() => undefined);
    return unsubscribe;
  }, []);
  const stage = getWellbeingStage(health);

  async function handleClaim(task: Task) {
    const state = await claimTask(task.id);
    setCoins(state.coins);
    setHealth(state.health);
    setClaimed(state.claimed);
    setCelebratingTask(task.id);
  }

  async function handlePurchase(cardId: string) {
    const result = await purchaseShopCard(cardId);
    setCoins(result.state.coins);
    setOwnedCards(result.state.ownedCards);
  }

  return <main className="game-shell"><div className="paper-grain"/><Hud coins={coins} health={health} stage={stage}/>
    <section className="game-main"><div className="welcome-line"><span className="welcome-flower">✿</span><span>A soft place to land</span><span className="welcome-flower">✿</span></div>
      <PetScene stage={stage}/><div className="pet-dialogue" key={stage.id}><span className="dialogue-star">✦</span>{stage.dialogue}</div><div className="pet-nameplate"><span className="name-sparkle">✦</span><h1>Snorlax</h1><span className="name-sparkle">✦</span><p>{stage.personality}</p></div>
      <QuoteCard quote={quote} onRefresh={() => setQuote((current) => pickQuote(current))}/>
      <div className="nook-hint"><span>✿</span> Take your time. You’re right where you need to be. <span>✿</span></div>
    </section>
    <nav className="corner-actions" aria-label="Game menu"><button className="action-card shop-action" onClick={() => setPopup('shop')}><span className="action-icon"><PixelIcon name="shop" size={30}/></span><span className="action-label"><strong>Little Shop</strong><small>treat yourself</small></span><span className="action-arrow">›</span></button>
      <button className="action-card tasks-action" onClick={() => setPopup('tasks')}><span className="action-icon"><PixelIcon name="tasks" size={30}/></span><span className="action-label"><strong>Tiny Tasks</strong><small>earn cozy coins</small></span><span className="action-arrow">›</span></button></nav>
    <footer className="page-footer"><span>MADE FOR SLOW MORNINGS</span><span className="footer-heart">♥</span><span>EST. NAP O’CLOCK</span></footer>
    {popup === 'tasks' && <TasksPopup claimed={claimed} celebratingTask={celebratingTask} onClaim={handleClaim} onClose={() => setPopup(null)}/>}{popup === 'shop' && <ShopPopup coins={coins} ownedCards={ownedCards} onPurchase={handlePurchase} onClose={() => setPopup(null)}/>}
  </main>;
}
