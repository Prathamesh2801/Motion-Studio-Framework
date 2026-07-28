import React from 'react';

/**
 * The editor's own UI atoms (Ring 4).
 *
 * Explicitly NOT the framework's component library. Those components animate on
 * a frame clock and render inside a video; these are chrome. Reusing `Surface`
 * or `Text` here would put a `useCurrentFrame()` call outside the Player, which
 * throws — and would couple the editor's look to whichever brand a document
 * happens to select.
 */

export const Panel = ({ title, action, children }) => (
  <section className="border-b border-white/10 last:border-b-0">
    <header className="flex items-center justify-between px-4 pt-4 pb-2">
      <h2 className="text-[11px] font-semibold tracking-[0.14em] text-white/40 uppercase">
        {title}
      </h2>
      {action}
    </header>
    <div className="px-4 pb-4">{children}</div>
  </section>
);

export const Field = ({ label, children }) => (
  <label className="mb-3 block last:mb-0">
    <span className="mb-1.5 block text-xs text-white/50">{label}</span>
    {children}
  </label>
);

const base =
  'w-full rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm text-white/90 ' +
  'outline-none transition focus:border-white/25 focus:bg-white/10';

export const Select = (props) => (
  <select {...props} className={`${base} appearance-none`}>
    {props.children}
  </select>
);

export const TextInput = (props) => <input {...props} className={base} />;

export const OptionRow = ({ options, value, onChange }) => (
  <div className="flex flex-wrap gap-1.5">
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        onClick={() => onChange(option.value)}
        className={
          'rounded-md px-2.5 py-1 text-xs transition ' +
          (option.value === value
            ? 'bg-white/90 font-medium text-slate-900'
            : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/90')
        }
      >
        {option.label}
      </button>
    ))}
  </div>
);

export const ListButton = ({ active, children, ...props }) => (
  <button
    type="button"
    {...props}
    className={
      'mb-1 block w-full rounded-md px-2.5 py-2 text-left text-sm transition last:mb-0 ' +
      (active
        ? 'bg-white/10 font-medium text-white'
        : 'text-white/55 hover:bg-white/5 hover:text-white/85')
    }
  >
    {children}
  </button>
);
