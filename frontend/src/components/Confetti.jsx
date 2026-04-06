import { useEffect, useState } from 'react';

const COLORS = ['#6C5CE7', '#00D68F', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#10B981', '#FBBF24'];
const SHAPES = ['square', 'circle', 'strip'];

function ConfettiPiece({ index }) {
  const color = COLORS[index % COLORS.length];
  const shape = SHAPES[index % SHAPES.length];
  const left = Math.random() * 100;
  const delay = Math.random() * 0.8;
  const duration = 2.2 + Math.random() * 1.8;
  const size = 8 + Math.random() * 10;
  const rotation = Math.random() * 360;
  const drift = (Math.random() - 0.5) * 200;

  const shapeStyle =
    shape === 'circle'
      ? { borderRadius: '50%', width: size, height: size }
      : shape === 'strip'
      ? { borderRadius: 1, width: size * 0.35, height: size * 1.4 }
      : { borderRadius: 2, width: size, height: size * 0.6 };

  return (
    <div style={{
      position: 'fixed',
      left: `${left}%`,
      top: -30,
      background: color,
      transform: `rotate(${rotation}deg)`,
      animation: `confettiFall ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s forwards`,
      zIndex: 99999,
      pointerEvents: 'none',
      '--drift': `${drift}px`,
      ...shapeStyle,
    }} />
  );
}

export default function Confetti({ trigger }) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (trigger) {
      setPieces(Array.from({ length: 180 }, (_, i) => i));
      const timer = setTimeout(() => setPieces([]), 5000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (pieces.length === 0) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99999 }}>
      {pieces.map(i => <ConfettiPiece key={i} index={i} />)}
    </div>
  );
}
