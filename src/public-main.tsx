import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './lib/api-base.ts';
import { JournalProvider } from './lib/journal.tsx';
import PublicApp from './PublicApp.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <JournalProvider>
      <PublicApp />
    </JournalProvider>
  </StrictMode>,
);
