import { PixelIcon } from './PixelIcon';

export default function QuoteCard({ quote, onRefresh }: { quote: string; onRefresh: () => void }) {
  return <section className="quote-card" aria-live="polite"><div className="quote-ornament">“</div><div className="quote-copy"><span className="quote-label">A THOUGHT FROM THE NAP KINGDOM</span><p>{quote}</p></div><button className="sprite-button refresh-button" onClick={onRefresh} aria-label="Show another quote" title="Another little thought"><PixelIcon name="refresh" size={21}/></button><span className="quote-corner corner-a"/><span className="quote-corner corner-b"/></section>;
}
