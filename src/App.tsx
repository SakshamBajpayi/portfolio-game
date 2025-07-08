import { useState, useEffect } from 'react';

function App() {
  const [started, setStarted] = useState(false);
  const [avatarIdle, setAvatarIdle] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const fullText = "Hi, I'm Pigasso.";

  useEffect(() => {
    let cursorInterval;

    if (avatarIdle) {
      cursorInterval = setInterval(() => {
        setCursorVisible((prev) => !prev);
      }, 500);
    }

    return () => clearInterval(cursorInterval);
  }, [avatarIdle]);

  useEffect(() => {
    if (avatarIdle && typedText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setTypedText(fullText.slice(0, typedText.length + 1));
      }, 120);
      return () => clearTimeout(timeout);
    }
  }, [avatarIdle, typedText]);

  const playClickSound = () => {
    const audio = new Audio('/sfx/click.mp3');
    audio.volume = 0.7;
    audio.play().catch((err) =>
      console.warn('🔇 Sound error:', err)
    );
  };

  const handleWalkInEnd = () => {
    setTimeout(() => {
      setAvatarIdle(true);
    }, 200); // Delay smooths the idle transition
  };

  return (
    <div className="screen-container">
      {!started ? (
        <div className="start-screen">
          <video className="background-video" autoPlay muted loop playsInline>
            <source src="/media/startup.mp4" type="video/mp4" />
          </video>

          <div className="start-screen-content">
            {/* Top Section */}
            <div className="top-section">
              <p className="retro-mode">RETRO MODE : ON</p>
              <h1 className="title-text" data-text="WELCOME TO SAKSHAM'S WORLD">
                WELCOME TO SAKSHAM'S WORLD
              </h1>

              <button
                className="glow-button-magenta"
                onClick={() => {
                  playClickSound();
                  setStarted(true);
                }}
              >
                &gt; CLICK TO PLAY
              </button>
            </div>

            {/* Avatar Walk-in */}
            <div className="avatar-walk-in" onAnimationEnd={handleWalkInEnd}>
              <div className={`avatar-inner ${avatarIdle ? 'idle' : ''}`}>
                <img
                  src={
                    avatarIdle
                      ? '/assets/avatar-idle.png'
                      : '/assets/avatar-walk.png'
                  }
                  alt="Saksham Avatar"
                  className={`avatar-img ${avatarIdle ? 'avatar-breath' : ''}`}
                />

                {avatarIdle && (
                 <div className="pig-typewriter-text">
                  <p className="pig-intro-glitch">
                    {typedText.split('').map((char, index) => (
                      <span
                        key={index}
                        className={Math.random() < 0.1 ? 'glitch-char' : ''}
                      >
                        {char}
                      </span>
                    ))}
                    <span className="blinking-cursor">
                      {cursorVisible ? '|' : ' '}
                    </span>
                  </p>
                 </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="loading-screen">
          <p className="loading-text">🎮 Loading...</p>
        </div>
      )}
    </div>
  );
}

export default App;
