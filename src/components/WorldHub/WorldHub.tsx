import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './WorldHub.scss';

import bg from './assets/bg-hub.png';
import pigFront from './assets/pig-front.png';
import pigBack from './assets/pig-back.png';
import pigLeft from './assets/pig-left.png';
import pigRight from './assets/pig-right.png';

import ArcadeNavButtons from '../Shared/ArcadeNavButtons';

interface CharCell { char: string; }

const hitboxes = [
  { id: 'gallery', x: 9, y: 9.2, width: 20, height: 20 },
  { id: 'about', x: 13, y: 50, width: 8, height: 16 },
  { id: 'thoughts', x: 16, y: 74, width: 9, height: 20 },
  { id: 'lore', x: 5.7, y: 92.6, width: 8, height: 6 },
  { id: 'skills', x: 61.5, y: 24, width: 15, height: 8 },
  { id: 'projects', x: 60, y: 50, width: 20, height: 11 },
  { id: 'corrupted', x: 58, y: 78, width: 20.2, height: 15.2 },
];

const guidanceLines = ['[Use arrow keys to move me]', '[around the map.]'];
const quirkyLines: Record<string, string> = {
  gallery: 'Pixel party!',
  about: 'Pig bio engaged.',
  thoughts: 'Oink-brain mode.',
  lore: 'Legends say I once flew.',
  skills: 'Observe my many talents!',
  projects: 'The pig did *that*?!',
  corrupted: "Uh-oh... something's weird here."
};

export default function WorldHub() {
  const navigate = useNavigate();
  const [position, setPosition] = useState({ x: 39.7, y: 110 });
  const [direction, setDirection] = useState<'front' | 'back' | 'left' | 'right'>('back');
  const [isWalkingIn, setIsWalkingIn] = useState(true);
  const [isMoving, setIsMoving] = useState(false);
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [typedCells, setTypedCells] = useState<CharCell[][]>([[], []]);
  const [typedDone, setTypedDone] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [startFadeOut, setStartFadeOut] = useState(false);
  const [zoneTypedCells, setZoneTypedCells] = useState<CharCell[]>([]);
  const [zoneDone, setZoneDone] = useState(false);
  const [showDeathScreen, setShowDeathScreen] = useState(false);

  const heldKeys = useRef(new Set<string>());
  const rafRef = useRef<number | null>(null);
  const typingRef = useRef<number | null>(null);
  const zoneTypingRef = useRef<number | null>(null);
  const lastZoneRef = useRef<string | null>(null);

  useEffect(() => {
    let y = 110;
    const id = window.setInterval(() => {
      y -= 0.4;
      if (y <= 70) {
        clearInterval(id);
        y = 70;
        setIsWalkingIn(false);
        setDirection('front');
      }
      setPosition({ x: 39.7, y });
    }, 16);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!isWalkingIn && !hasMoved) {
      setTypedCells([[], []]);
      setTypedDone(false);
      let line = 0;
      let idx = 0;
      typingRef.current = window.setInterval(() => {
        setTypedCells(prev => {
          const copy = prev.map(arr => [...arr]);
          if (line < guidanceLines.length) {
            const text = guidanceLines[line];
            if (text[idx]) copy[line].push({ char: text[idx] });
          }
          return copy;
        });
        idx++;
        if (line < guidanceLines.length && idx > guidanceLines[line].length) {
          idx = 0;
          line++;
          if (line >= guidanceLines.length) {
            clearInterval(typingRef.current!);
            setTypedDone(true);
          }
        }
      }, 80);
    }
    return () => { if (typingRef.current) clearInterval(typingRef.current); };
  }, [isWalkingIn, hasMoved]);

  useEffect(() => {
    if (activeZone && activeZone !== lastZoneRef.current) {
      const msg = quirkyLines[activeZone];
      setZoneTypedCells([]);
      setZoneDone(false);
      let idx = 0;
      if (zoneTypingRef.current) clearInterval(zoneTypingRef.current);
      zoneTypingRef.current = window.setInterval(() => {
        setZoneTypedCells(prev => [...prev, { char: msg[idx] }]);
        idx++;
        if (idx >= msg.length) {
          clearInterval(zoneTypingRef.current!);
          setZoneDone(true);
        }
      }, 60);
      lastZoneRef.current = activeZone;
    } else if (!activeZone) {
      if (zoneTypingRef.current) clearInterval(zoneTypingRef.current);
      setZoneTypedCells([]);
      lastZoneRef.current = null;
    }
  }, [activeZone]);

  useEffect(() => {
    const step = 0.68;
    const hw = 2.5 / 2;
    const hh = 4 / 2;
    const moveLoop = () => {
      setPosition(prev => {
        let { x, y } = prev;
        if (heldKeys.current.has('ArrowUp')) { setDirection('back'); y -= step; }
        if (heldKeys.current.has('ArrowDown')) { setDirection('front'); y += step; }
        if (heldKeys.current.has('ArrowLeft')) { setDirection('left'); x -= step; }
        if (heldKeys.current.has('ArrowRight')) { setDirection('right'); x += step; }

        // Clamp boundaries slightly beyond screen for smoother death handling
        const newX = Math.max(-10, Math.min(110, x));
        const newY = Math.max(-10, Math.min(130, y));

        if (!showDeathScreen && (x < -5 || x > 105 || y < -5 || y > 120)) {
          setShowDeathScreen(true);
        }

        const left = x - hw, right = x + hw, top = y - hh, bottom = y + hh;
        const hit = hitboxes.find(b => right > b.x && left < b.x + b.width && bottom > b.y && top < b.y + b.height);
        const newZone = hit ? hit.id : null;
        if (newZone !== activeZone) {
          setActiveZone(newZone);
          setShowPrompt(!!newZone);
        }

        return { x: newX, y: newY };
      });
      rafRef.current = requestAnimationFrame(moveLoop);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        if (!hasMoved) {
          setHasMoved(true);
          setStartFadeOut(true);
          if (typingRef.current) clearInterval(typingRef.current);
        }
        heldKeys.current.add(e.key);
        if (!rafRef.current) rafRef.current = requestAnimationFrame(moveLoop);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        heldKeys.current.delete(e.key);
        if (!heldKeys.current.size && rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
          setIsMoving(false);
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (zoneTypingRef.current) clearInterval(zoneTypingRef.current);
    };
  }, [hasMoved, activeZone]);

  const sprite = isWalkingIn ? pigBack : { front: pigFront, back: pigBack, left: pigLeft, right: pigRight }[direction];
  const isAboveText = activeZone === 'lore';
  const quirkyTextOffset = isAboveText ? '-50px' : '60px';

  return (
    <div className="worldhub">
      <img src={bg} className="hub-bg" alt="Map" />
      <ArcadeNavButtons />
      <div className="gallery-label">GALLERY</div>

      <div className="pig-container" style={{ left: `${position.x}%`, top: `${position.y}%` }}>
        <img src={sprite} className={`pig-avatar ${(isMoving || isWalkingIn) ? 'bouncing' : ''}`} alt="Pigasso" />
      </div>

      {!hasMoved && (
        <div className={`pig-typewriter-text ${startFadeOut ? 'fade-out' : ''}`} style={{ left: `${position.x}%`, top: `${position.y}%`, transform: 'translateX(-50%) translateY(40px)' }}>
          <p className="pig-intro-glitch">
            {typedCells.map((line, li) => (
              <React.Fragment key={li}>
                {line.map((cell, ci) => (<span key={ci}>{cell.char}</span>))}
                <br />
              </React.Fragment>
            ))}
          </p>
        </div>
      )}

      {zoneTypedCells.length > 0 && !showDeathScreen && (
        <div className="zone-typewriter-text" style={{ left: `${position.x}%`, top: `${position.y}%`, transform: `translateX(-50%) translateY(${quirkyTextOffset})` }}>
          <p style={{ color: '#ff1493', fontWeight: 700, textShadow: 'none', fontSize: '11px' }}>
            {zoneTypedCells.map((cell, i) => <span key={i}>{cell.char}</span>)}
          </p>
        </div>
      )}

      {showPrompt && activeZone && (
        <div className="interaction-prompt">
          {activeZone === 'corrupted'
            ? 'PRESS [E] TO ENTER NEW PROJECT'
            : `PRESS [E] TO ENTER ${activeZone.toUpperCase()}`}
        </div>
      )}

      {showDeathScreen && (
        <div className="death-screen">
          <h1 className="death-text">YOU DIED</h1>
          <button className="restart-button" onClick={() => navigate('/')}>RESTART</button>
        </div>
      )}
    </div>
  );
}
