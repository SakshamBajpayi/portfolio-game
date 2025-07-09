import React from 'react';
import { useState, useEffect } from 'react';
import './Pigasso.scss';
import pigBack from './assets/pig-back.png';
import pigFront from './assets/pig-front.png';


const Pigasso = () => {
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setHasEntered(true);
    }, 2500); // ⏱️ Adjust this to match your walk-in duration
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className={`pigasso ${hasEntered ? 'idle' : 'walk-in'}`}>
      <img
        src={hasEntered ? pigFront : pigBack}
        alt="Pigasso"
        className="pigasso-sprite"
      />
    </div>
  );
};

export default Pigasso;
