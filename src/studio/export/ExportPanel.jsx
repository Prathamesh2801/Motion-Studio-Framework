import React, { useState } from 'react';
import { useEditor } from '../state/EditorProvider.jsx';
import { Panel } from '../panels/ui.jsx';

/**
 * Export (Ring 4).
 *
 * MP4 rendering is Remotion's job and a Node process's job — a browser tab
 * cannot do it, and pretending otherwise would mean a render service before the
 * engine is proven. So the editor's honest export is the exact command that
 * renders what you are looking at, with the live document passed through
 * `--props`.
 *
 * That command works because the Studio composition, the CLI and this preview
 * all mount `PackHost` with the same serialisable props. The editor is not
 * approximating the render; it is describing it.
 */
export const ExportPanel = () => {
  const { pack, document, format } = useEditor();
  const [copied, setCopied] = useState(false);

  const props = JSON.stringify({ packId: pack.id, document, format });
  const command =
    `npx remotion render ${pack.id}-${format} out/${document.id}-${format}.mp4 ` +
    `--props='${props}'`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Panel
      title="Export"
      action={
        <button
          type="button"
          onClick={copy}
          className="rounded-md bg-white/10 px-2.5 py-1 text-[11px] text-white/70 transition hover:bg-white/20 hover:text-white"
        >
          {copied ? 'Copied' : 'Copy command'}
        </button>
      }
    >
      <pre className="max-h-28 overflow-auto rounded-md bg-black/40 p-2.5 font-mono text-[10px] leading-relaxed break-all whitespace-pre-wrap text-white/50">
        {command}
      </pre>
    </Panel>
  );
};

export default ExportPanel;
