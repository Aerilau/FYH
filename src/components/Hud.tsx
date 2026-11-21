import { PixelIcon } from './PixelIcon';
import type { WellbeingStage } from '../data/wellbeing';

export default function Hud({ coins, health, stage }: { coins: number; health: number; stage: WellbeingStage }) {
  return <header className="hud"><div className="brand-mark"><span className="brand-star">✦</span><span>PROCRASTIPET</span></div>
    <div className="hud-group"><div className="hud-pill coin-pill"><PixelIcon name="coin" size={25}/><span className="balance"><small>POCKET COINS</small><strong>{coins}</strong></span></div>
      <div className="wellbeing-card" aria-label={`Wellbeing: ${health}% — ${stage.name}`}>
        <div className="wellbeing-topline"><span className="wellbeing-title">PET WELLBEING</span><strong className="wellbeing-stage">{stage.name}</strong><span className="wellbeing-percent">{health}%</span></div>
        <div className="wellbeing-meter-row"><div className="pixel-hearts" aria-hidden="true">{[0, 1, 2].map((heart) => <PixelIcon key={heart} name="heart" size={14} className={health > heart * 34 ? '' : 'heart-empty'}/>)}</div><div className="health-meter" role="progressbar" aria-label="Pet health" aria-valuemin={0} aria-valuemax={100} aria-valuenow={health}><span className="health-meter-fill" style={{ width: `${health}%` }}/></div></div>
      </div></div>
    <div className="day-stamp"><span>✦</span> YOUR LITTLE CORNER <span>✦</span></div>
  </header>;
}
