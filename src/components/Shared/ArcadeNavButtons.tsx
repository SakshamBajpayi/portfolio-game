import { useNavigate, useLocation } from 'react-router-dom';
import './ArcadeNavButtons.scss';

const ArcadeNavButtons = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don’t show on StartScreen
  if (location.pathname === '/') return null;

  return (
    <div className="arcade-nav-buttons">
      <button className="arcade-button" onClick={() => navigate(-1)}>&lt;</button>
      <button className="arcade-button" onClick={() => navigate(1)}>&gt;</button>
    </div>
  );
};

export default ArcadeNavButtons;
