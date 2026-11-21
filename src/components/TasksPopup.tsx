import { tasks } from '../data/tasks';
import type { Task } from '../data/tasks';
import { PixelIcon } from './PixelIcon';

export default function TasksPopup({ claimed, celebratingTask, onClaim, onClose }: { claimed: string[]; celebratingTask: string | null; onClaim: (task: Task) => void; onClose: () => void }) {
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="popup-card tasks-popup" role="dialog" aria-modal="true" aria-labelledby="tasks-heading">
    <div className="popup-heading"><div><span className="eyebrow">TINY WINS, TINY REWARDS</span><h2 id="tasks-heading">A little something to do</h2></div><button className="sprite-button close-button" onClick={onClose} aria-label="Close tasks"><PixelIcon name="close" size={19}/></button></div>
    <p className="popup-intro">Pick a quest for your next cozy adventure.</p><div className="task-list">{tasks.map((task) => { const done = claimed.includes(task.id); const progress = done ? 100 : 0; return <div className={`task-row ${done ? 'is-done' : ''} ${celebratingTask === task.id ? 'just-claimed' : ''}`} key={task.id}><span className="task-check">{done ? '✓' : ' '}</span><span className="task-copy"><strong className="task-title">{task.title}</strong><small className="task-description">{task.description}</small><span className="task-progress-line"><span className="task-progress-track" role="progressbar" aria-label={`${task.title} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span className="task-progress-fill" style={{ width: `${progress}%` }}/></span><small>{progress}%</small></span></span><span className="task-rewards"><span className="task-reward"><PixelIcon name="coin" size={16}/>{task.reward}</span><span className="task-reward health-reward"><PixelIcon name="heart" size={15}/>+{task.healthReward}</span></span><button className="claim-button" disabled={done} onClick={() => onClaim(task)}>{done ? 'DONE' : 'CLAIM'}</button></div>; })}</div>
    <div className="popup-footnote"><span>✦</span> You can claim each cozy task once. <span>✦</span></div>
  </section></div>;
}
