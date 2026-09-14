import { Navigate, Route, Routes } from 'react-router-dom';
import { CanvasPage } from './pages/CanvasPage/CanvasPage';
import { HomePage } from './pages/HomePage/HomePage';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/space/:id" element={<CanvasPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
