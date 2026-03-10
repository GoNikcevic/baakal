import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import DashboardPage from '../DashboardPage';
import { AppProvider } from '../../context/AppContext';

// Mock auth service
vi.mock('../../services/auth', () => ({
  isLoggedIn: () => false,
  getUser: () => null,
  getToken: () => null,
  getRefreshToken: () => null,
}));

// Mock api-client
vi.mock('../../services/api-client', () => ({
  default: {
    checkHealth: vi.fn().mockResolvedValue(null),
  },
}));

function renderDashboard(props = {}) {
  return render(
    <AppProvider>
      <MemoryRouter>
        <DashboardPage {...props} />
      </MemoryRouter>
    </AppProvider>
  );
}

describe('DashboardPage', () => {
  it('renders the page title', () => {
    renderDashboard();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders all tab buttons', () => {
    renderDashboard();

    expect(screen.getByRole('button', { name: 'Vue globale' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rapports' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Analytics' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Campagnes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refinement' })).toBeInTheDocument();
  });

  it('shows empty state / welcome banner when no campaigns', () => {
    renderDashboard();

    // Overview tab is active by default, should show welcome banner
    expect(screen.getByText('Bienvenue sur Bakal')).toBeInTheDocument();
  });

  it('shows empty KPI cards with placeholder values', () => {
    renderDashboard();

    // Multiple KPI cards show "En attente de donnees"
    const placeholders = screen.getAllByText('En attente de donnees');
    expect(placeholders.length).toBe(6);
  });

  it('switches to Reports tab on click', () => {
    renderDashboard();

    fireEvent.click(screen.getByRole('button', { name: 'Rapports' }));

    expect(screen.getByText('Aucun rapport disponible')).toBeInTheDocument();
  });

  it('switches to Analytics tab on click', () => {
    renderDashboard();

    fireEvent.click(screen.getByRole('button', { name: 'Analytics' }));

    expect(screen.getByText('Analytics non disponible')).toBeInTheDocument();
  });

  it('switches to Refinement tab on click', () => {
    renderDashboard();

    fireEvent.click(screen.getByRole('button', { name: 'Refinement' }));

    expect(screen.getByText('Refinement A/B non disponible')).toBeInTheDocument();
  });

  it('shows subtitle for empty state', () => {
    renderDashboard();

    expect(screen.getByText(/Bienvenue.*Configurez votre premiere campagne/)).toBeInTheDocument();
  });

  it('shows onboarding steps in empty overview', () => {
    renderDashboard();

    expect(screen.getByText('Creez votre campagne')).toBeInTheDocument();
    expect(screen.getByText('Claude genere vos sequences')).toBeInTheDocument();
    expect(screen.getByText('Importez vos prospects')).toBeInTheDocument();
    expect(screen.getByText('Lancez et optimisez')).toBeInTheDocument();
  });

  it('respects section prop for initial tab', () => {
    renderDashboard({ section: 'reports' });

    expect(screen.getByText('Aucun rapport disponible')).toBeInTheDocument();
  });
});
