import type { WellbeingStage } from '../data/wellbeing';
const snorlaxResting = new URL('../assets/newtab-snorlax.png', import.meta.url).href;

function PetSprite({ stage }: { stage: WellbeingStage }) {
  return <img className={`pet-sprite mood-${stage.id}`} src={snorlaxResting} alt={`${stage.name} Snorlax resting in the grass`} />;
}

export default function PetScene({ stage }: { stage: WellbeingStage }) {
  return <section className={`pet-scene stage-${stage.id}`} aria-label={`${stage.name} Snorlax resting on a grass patch`}>
    <div className="grass-patch" aria-hidden="true" />
    <PetSprite stage={stage}/>
  </section>;
}
