import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ConciergeChat from './components/ConciergeChat';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    {/* Floating concierge overlay. Mounted here, not inside App, so the landing
        page component stays byte-identical to the original AI Studio export. */}
    <ConciergeChat />
  </StrictMode>,
);
