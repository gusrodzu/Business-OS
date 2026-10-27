/**
 * Hexagonal, flat-top coordinates (BuzzBee Home).
 *
 * Desktop uses a connected, centre-out cluster (1–2–3–2–1 when 9 tiles).
 * Narrow containers use 2/3 interleaved columns so every hex retains a
 * readable value. Positions are recomputed from the actual component width,
 * not window.innerWidth (the workspace tools rail reduces usable space).
 */
const SQRT3 = Math.sqrt(3);
const FLOWER = [
  [0,0],[-1,-0.5],[1,-0.5],[-1,0.5],[1,0.5],
  [0,-1],[0,1],[-2,0],[2,0],[-2,-1],[2,-1],
];

const rounded = value => Math.round(value * 10) / 10;

export function createHoneycombLayout({count, width, compact = false}) {
  const safeCount = Math.max(0, Math.min(11, Math.floor(Number(count) || 0)));
  const availableWidth = Math.max(220, Number(width) || 800);
  const mode = availableWidth < 480 ? 'mobile'
    : availableWidth < 680 ? 'tablet' : 'flower';
  const columns = mode === 'mobile' ? (availableWidth < 245 ? 1 : 2)
    : mode === 'tablet' ? 3 : 5;
  const maxSize = compact ? (mode === 'mobile' ? 180 : 205)
    : (mode === 'mobile' ? 205 : mode === 'tablet' ? 225 : 240);
  const gridFactor = mode === 'flower'
    ? (safeCount <= 1 ? 1 : safeCount <= 3 ? 2.5 : safeCount <= 7 ? 2.5 : 4)
    : 1 + 0.75 * (columns - 1);
  const tileWidth = Math.max(1, Math.min(maxSize, (availableWidth - 8) / gridFactor));
  const tileHeight = tileWidth * SQRT3 / 2;

  const centres = Array.from({length:safeCount}, (_,index) => {
    if (mode === 'flower') {
      const [x,y] = FLOWER[index];
      return {x:x * 0.75 * tileWidth, y:y * tileHeight};
    }
    const col = index % columns;
    const row = Math.floor(index / columns);
    return {x:col * 0.75 * tileWidth, y:(row + (col % 2) / 2) * tileHeight};
  });

  if (!centres.length) return {mode, tileWidth:rounded(tileWidth), tileHeight:rounded(tileHeight),
    width:rounded(availableWidth),height:0,positions:[]};

  const minX = Math.min(...centres.map(p => p.x - tileWidth / 2));
  const maxX = Math.max(...centres.map(p => p.x + tileWidth / 2));
  const minY = Math.min(...centres.map(p => p.y - tileHeight / 2));
  const maxY = Math.max(...centres.map(p => p.y + tileHeight / 2));
  const clusterWidth = maxX - minX;
  const offsetX = Math.max(0, (availableWidth - clusterWidth) / 2);
  const verticalPadding = 5;

  const positions = centres.map(p => ({
    left:rounded(p.x - tileWidth / 2 - minX + offsetX),
    top:rounded(p.y - tileHeight / 2 - minY + verticalPadding),
    width:rounded(tileWidth),
    height:rounded(tileHeight),
  }));

  return {
    mode,
    columns,
    width:rounded(availableWidth),
    height:rounded(maxY - minY + verticalPadding * 2),
    tileWidth:rounded(tileWidth),
    tileHeight:rounded(tileHeight),
    positions,
  };
}
