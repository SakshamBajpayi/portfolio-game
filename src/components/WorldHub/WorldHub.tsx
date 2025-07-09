import { useState, useEffect } from 'react';
import './WorldHub.scss';

import bg from './assets/bg-hub.png';
import pigFront from './assets/pig-front.png';
import pigBack from './assets/pig-back.png';
import pigLeft from './assets/pig-left.png';
import pigRight from './assets/pig-right.png';

const WorldHub = () => {
  const [position, setPosition] = useState({ x: 39.7, y: 100 }); // start off screen
  const [direction, setDirection] = useState<'front' | 'back' | 'left' | 'right'>('back');
  const [entered, setEntered] = useState(false);

  // Animate Pigasso entering from bottom
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPosition({ x: 39.7, y: 70 }); // move to path area
      setEntered(true);
    }, 500); // delay entrance slightly
    return () => clearTimeout(timeout);
  }, []);

  // Arrow key controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setPosition((prev) => {
        const step = 1.4;
        switch (e.key) {
          case 'ArrowUp':
            setDirection('back');
            return { ...prev, y: Math.max(prev.y - step, 0) };
          case 'ArrowDown':
            setDirection('front');
            return { ...prev, y: Math.min(prev.y + step, 100) };
          case 'ArrowLeft':
            setDirection('left');
            return { ...prev, x: Math.max(prev.x - step, 0) };
          case 'ArrowRight':
            setDirection('right');
            return { ...prev, x: Math.min(prev.x + step, 100) };
          default:
            return prev;
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getAvatarSprite = () => {
    switch (direction) {
      case 'front': return pigFront;
      case 'back': return pigBack;
      case 'left': return pigLeft;
      case 'right': return pigRight;
      default: return pigFront;
    }
  };

  return (
    <div className="worldhub">
      <img src={bg} alt="World Hub Background" className="hub-bg" />

      <img
        src={getAvatarSprite()}
        alt="Pigasso"
        className={`pig-avatar ${entered ? 'entered' : ''}`}
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
        }}
      />
    </div>
  );
};

export default WorldHub;
