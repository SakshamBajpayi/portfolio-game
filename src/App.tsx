import { Routes, Route, Navigate } from 'react-router-dom';
import StartScreen from './components/StartScreen/StartScreen';
import WorldHub from './components/WorldHub/WorldHub';

function App() {
  return (
    <Routes>
      <Route path="/" element={<StartScreen />} />
      <Route path="/hub" element={<WorldHub />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
