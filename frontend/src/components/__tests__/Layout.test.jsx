import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Layout from '../Layout';
import { AppProvider } from '../../context/AppContext';

// Mock auth service so AppProvider doesn't hit localStorage issues
vi.mock('../../services/auth', () => ({
  isLoggedIn: () => true,
  getUser: () => ({ name: 'Goran', email: 'goran@test.com', role: 'demo' }),
  getToken: () => 'demo-token',
  getRefreshToken: () => null,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn().mockResolvedValue(undefined),
}));

// Mock api-client to prevent real network calls
vi.mock('../../services/api-client', () => ({
  default: {
    checkHealth: vi.fn().mockResolvedValue(null),
  },
}));

function renderLayout(initialRoute = '/dashboard') {
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Layout />
      </MemoryRouter>
    </AppProvider>
  );
}

describe('Layout', () => {
  it('renders sidebar nav links', () => {
    renderLayout();

    expect(screen.getByText('Assistant')).toBeInTheDocument();
    // "Dashboard" appears in both sidebar and mobile nav, so use getAllByText
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Campagnes')).toBeInTheDocument();
    expect(screen.getByText('Recommandations')).toBeInTheDocument();
    expect(screen.getByText('Profil')).toBeInTheDocument();
  });

  it('renders the brand logo', () => {
    renderLayout();

    expect(screen.getByText('b')).toBeInTheDocument();
    expect(screen.getByText('.ai')).toBeInTheDocument();
  });

  it('renders the new campaign button', () => {
    renderLayout();

    expect(screen.getByText('+ Nouvelle campagne')).toBeInTheDocument();
  });

  it('renders user info when user is logged in', () => {
    renderLayout();

    expect(screen.getByText('Goran')).toBeInTheDocument();
    expect(screen.getByText('goran@test.com')).toBeInTheDocument();
  });

  it('renders user initial in avatar', () => {
    renderLayout();

    expect(screen.getByText('G')).toBeInTheDocument();
  });

  it('renders mobile navigation items', () => {
    renderLayout();

    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText('Recos')).toBeInTheDocument();
    expect(screen.getByText('Config')).toBeInTheDocument();
  });

  it('renders the main content outlet area', () => {
    renderLayout();

    const main = document.querySelector('main.main');
    expect(main).toBeInTheDocument();
  });
});
