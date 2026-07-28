import React from 'react';
import { createRoot } from 'react-dom/client';

// The same generated Tailwind theme the render pipeline uses, so the editor's
// chrome and the video speak one design language. Remotion loads it through
// `@remotion/tailwind-v4`; Vite loads it here.
import '@/styles/tailwind.css';

import { App } from './App.jsx';

/**
 * The editor's entry point.
 *
 * Remotion's entry is `src/index.jsx` (`registerRoot`). These two files are the
 * only entry points in the repo and they never import each other — one boots a
 * DOM application, the other registers compositions. Everything they have in
 * common lives at `src/packs` and below, which is the entire point.
 */
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
