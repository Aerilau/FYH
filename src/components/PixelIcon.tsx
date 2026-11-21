import type { CSSProperties } from 'react';

const shapes: Record<string, string[]> = {
  coin: ['..yyy..', '.ygggy.', 'ygggggy', 'yggyggy', 'ygggggy', '.ygggy.', '..yyy..'],
  shop: ['..bb..bb..', '..bb..bb..', '.bbbbbbbb.', '.bppppppb.', '.bppppppb.', '.bbbbbbbb.', '.bb....bb.'],
  tasks: ['.bbbbbbb.', '.bgggggb.', '.bgwgbgb.', '.bbbbbbb.', '.bgwgbgb.', '.bbbbbbb.', '.bgwgbgb.'],
  refresh: ['..bb...', '.bbbb..', 'bb..bb.', 'bb..bb.', '.bbbbb.', '..bbb..', '...b...'],
  close: ['bb...bb', '.bb.bb.', '..bbb..', '..bbb..', '.bb.bb.', 'bb...bb'],
  sparkle: ['...y...', '..yyy..', '.yyyyy.', 'yyyyyyy', '.yyyyy.', '..yyy..', '...y...'],
  heart: ['.pp.pp.', 'ppppppp', 'ppppppp', '.ppppp.', '..ppp..', '...p...']
};
const colors: Record<string, string> = { '.': 'transparent', b: '#694f43', g: '#89a18a', p: '#d99c98', y: '#e9b957', w: '#fff5dc' };

export function PixelIcon({ name, size = 24, className = '' }: { name: keyof typeof shapes; size?: number; className?: string }) {
  const grid = shapes[name];
  const pixels: CSSProperties[] = [];
  grid.forEach((row, y) => [...row].forEach((pixel, x) => {
    if (pixel !== '.') pixels.push({ left: `${(x / row.length) * 100}%`, top: `${(y / grid.length) * 100}%`, backgroundColor: colors[pixel] });
  }));
  return <span aria-hidden="true" className={`pixel-icon ${className}`} style={{ width: size, height: size }}><span className="pixel-grid">{pixels.map((style, i) => <i key={i} style={style} />)}</span></span>;
}
