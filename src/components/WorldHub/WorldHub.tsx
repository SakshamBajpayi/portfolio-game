import React, { useState, useEffect, useRef } from 'react';
import './WorldHub.scss';

import bg from './assets/bg-hub.png';
import pigFront from './assets/pig-front.png';
import pigBack from './assets/pig-back.png';
import pigLeft from './assets/pig-left.png';
import pigRight from './assets/pig-right.png';

import ArcadeNavButtons from '../Shared/ArcadeNavButtons';

const WorldHub = () => {
  const [position, setPosition] = useState({ x: 39.7, y: 110 }); // ⬅️ Start off screen bottom
  const [direction, setDirection] = useState<'front' | 'back' | 'left' | 'right'>('back');
  const [isWalkingIn, setIsWalkingIn] = useState(true);
  const [isMoving, setIsMoving] = useState(false);

  const heldKeys = useRef(new Set<string>());
  const rafRef = useRef<number | null>(null);

  // 🎬 Walk-in animation
  useEffect(() => {
    let y = 110;
    const walkInterval = setInterval(() => {
      y -= 0.4;
      if (y <= 70) {
        y = 70;
        clearInterval(walkInterval);
        setIsWalkingIn(false);
        setDirection('front'); // Face forward after entering
      }
      setPosition({ x: 39.7, y });
    }, 16); // ≈60fps
    return () => clearInterval(walkInterval);
  }, []);

  // 🎮 Movement
  useEffect(() => {
    const step = 0.3;

    const move = () => {
      setPosition(prev => {
        let { x, y } = prev;
        if (heldKeys.current.has('ArrowUp')) {
          setDirection('back');
          y = Math.max(0, y - step);
        }
        if (heldKeys.current.has('ArrowDown')) {
          setDirection('front');
          y = Math.min(100, y + step);
        }
        if (heldKeys.current.has('ArrowLeft')) {
          setDirection('left');
          x = Math.max(0, x - step);
        }
        if (heldKeys.current.has('ArrowRight')) {
          setDirection('right');
          x = Math.min(100, x + step);
        }
        return { x, y };
      });

      rafRef.current = requestAnimationFrame(move);
    };

    const down = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        heldKeys.current.add(e.key);
        if (!rafRef.current) {
          setIsMoving(true);
          rafRef.current = requestAnimationFrame(move);
        }
      }
    };

    const up = (e: KeyboardEvent) => {
      heldKeys.current.delete(e.key);
      if (heldKeys.current.size === 0 && rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        setIsMoving(false);
      }
    };

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const sprite = (() => {
    if (isWalkingIn) return pigBack; // Walk in facing up
    return {
      front: pigFront,
      back: pigBack,
      left: pigLeft,
      right: pigRight,
    }[direction];
  })();

  return (
    <div className="worldhub">
      <img src={bg} className="hub-bg" alt="Map" />
      <ArcadeNavButtons />

      <div
        className="pig-container"
        style={{ left: `${position.x}%`, top: `${position.y}%` }}
      >
        <img
          src={sprite}
          className={`pig-avatar ${(isMoving || isWalkingIn) ? 'bouncing' : ''}`}
          alt="Pigasso"
        />
      </div>
    </div>
  );
};

export default WorldHub;
