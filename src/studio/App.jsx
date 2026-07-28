import React, { useCallback, useState } from 'react';
import { EditorProvider, useEditor } from './state/EditorProvider.jsx';
import { Stage } from './preview/Stage.jsx';
import { Controls } from './panels/Controls.jsx';
import { AssetPanel } from './panels/AssetPanel.jsx';
import { JsonPanel } from './panels/JsonPanel.jsx';
import { ExportPanel } from './export/ExportPanel.jsx';

/**
 * The application shell (Ring 4).
 *
 * Three columns: what to show (left), the live template (centre), what it
 * resolved to (right). Every control is one document edit away from a different
 * video, and the Remotion template in the middle never learns that anything
 * changed except its props.
 */

const Header = () => {
  const { pack, document } = useEditor();
  return (
    <header className="flex shrink-0 items-baseline gap-3 border-b border-white/10 px-5 py-3">
      <h1 className="text-sm font-semibold tracking-tight text-white">Motion Studio</h1>
      <span className="text-xs text-white/35">
        {pack.title} — {document.title ?? document.id}
      </span>
      <span className="ml-auto text-[11px] text-white/25">
        Live via @remotion/player · the same composition Remotion renders
      </span>
    </header>
  );
};

const Layout = () => {
  // The Stage already resolves the document; it hands the result up rather than
  // letting the asset panel resolve it a second time and risk showing a
  // different ViewModel from the one on screen.
  const [mount, setMount] = useState(null);
  const onResolved = useCallback((next) => setMount(next), []);
  const { pack } = useEditor();

  return (
    <div className="flex h-screen flex-col bg-[#0b0d12] text-white">
      <Header />
      <div className="grid min-h-0 flex-1 grid-cols-[260px_minmax(0,1fr)_360px]">
        <aside className="min-h-0 overflow-y-auto border-r border-white/10">
          <Controls />
        </aside>

        <main className="min-h-0 overflow-hidden p-6">
          <Stage onResolved={onResolved} />
        </main>

        <aside className="min-h-0 overflow-y-auto border-l border-white/10">
          <AssetPanel vm={mount?.vm} packId={pack.id} />
          <JsonPanel />
          <ExportPanel />
        </aside>
      </div>
    </div>
  );
};

export const App = () => (
  <EditorProvider>
    <Layout />
  </EditorProvider>
);

export default App;
