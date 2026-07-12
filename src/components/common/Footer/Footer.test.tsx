import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from './Footer';

const mockNavigate = vi.fn();
let mockPathname = '/privacy';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      pathname: mockPathname,
      hash: '',
      search: '',
      state: null,
      key: 'test',
    }),
  };
});

vi.mock('../../../services/landingAnalytics', () => ({
  trackLandingFooterClick: vi.fn(),
}));

const renderFooter = () =>
  render(
    <MemoryRouter>
      <Footer variant="landing" />
    </MemoryRouter>
  );

describe('Footer landing anchors', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockPathname = '/privacy';
    document.body.innerHTML = '';
  });

  it('navigates home with scroll state when anchor is clicked off landing', () => {
    renderFooter();

    fireEvent.click(screen.getByRole('link', { name: /^funkcje$/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/', { state: { scrollTo: '#features' } });
  });

  it('scrolls to section when anchor is clicked on landing', () => {
    mockPathname = '/';
    const section = document.createElement('section');
    section.id = 'features';
    section.scrollIntoView = vi.fn();
    document.body.appendChild(section);

    renderFooter();
    fireEvent.click(screen.getByRole('link', { name: /^funkcje$/i }));

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(section.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
  });
});
