import React from 'react';

/**
 * Containment for template render errors (Ring 5).
 *
 * ── WHY THE SDK NEEDS ONE ───────────────────────────────────────────────────
 * Inside Motion Studio, a throwing composition is the RIGHT outcome: it names
 * the bad field and stops the render before a wrong frame ships. Inside somebody
 * else's product page, the same throw unmounts their React tree and takes down
 * whatever surrounds the animation. A statistics website should not go white
 * because one player's rating arrived as a string.
 *
 * So the runtime keeps the strictness and changes only where it lands: the error
 * is contained, reported through `onError`, and the consumer's `fallback`
 * renders in the template's place.
 *
 * Two layers are needed because they catch different things. `tryResolvePack`
 * handles bad DATA (schema and adapter failures) before mounting; this boundary
 * handles anything that throws once the film is rendering — a missing preset
 * name, a component contract violated at frame 200.
 */
export class TemplateErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.props.onError?.(error, info);
  }

  componentDidUpdate(previous) {
    // A new document deserves a fresh attempt. Without this, one bad payload
    // would leave the template permanently in its fallback for the lifetime of
    // the page, even after the consumer fixed the data.
    if (this.state.error && previous.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) return this.props.fallback ?? null;
    return this.props.children;
  }
}

export default TemplateErrorBoundary;
