import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '100vh', background: '#0c0c0e', color: '#fff', fontFamily: 'system-ui, sans-serif',
          padding: 32, textAlign: 'center',
        }}>
          <h2 style={{ marginBottom: 12 }}>Une erreur est survenue</h2>
          <p style={{ color: '#888', maxWidth: 500, marginBottom: 20 }}>
            {this.state.error?.message || 'Erreur inconnue'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#fff', color: '#0c0c0e', border: 'none', borderRadius: 8,
              padding: '10px 24px', cursor: 'pointer', fontWeight: 600,
            }}
          >
            Recharger la page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
