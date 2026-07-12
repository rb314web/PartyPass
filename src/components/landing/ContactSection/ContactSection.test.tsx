import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ContactSection from './ContactSection';
import { EmailService } from '../../../services/emailService';

// Mock EmailJS
vi.mock('@emailjs/browser', () => ({
  send: vi.fn(),
  init: vi.fn(),
}));

vi.mock('../../../services/landingAnalytics', () => ({
  trackLandingContactSubmit: vi.fn(),
}));

vi.mock('../../../config/turnstile', () => ({
  isTurnstileEnabled: () => false,
}));

describe('ContactSection', () => {
  it('renders contact section with title', () => {
    render(<ContactSection />);

    expect(screen.getByText('Skontaktuj się z nami')).toBeInTheDocument();
  });

  it('renders contact subtitle', () => {
    render(<ContactSection />);

    expect(screen.getByText(/masz pytania\?/i)).toBeInTheDocument();
  });

  it('renders contact form with all fields', () => {
    render(<ContactSection />);

    expect(screen.getByLabelText('Imię i nazwisko *')).toBeInTheDocument();
    expect(screen.getByLabelText('Email *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('W czym możemy Ci pomóc?')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<ContactSection />);

    const submitButton = screen.getByRole('button', { name: /wyślij wiadomość/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('renders form inputs', () => {
    render(<ContactSection />);

    expect(screen.getByPlaceholderText('Wprowadź swoje imię')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('np. twoj@email.pl')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('W czym możemy Ci pomóc?')).toBeInTheDocument();
  });

  it('renders section with proper structure', () => {
    render(<ContactSection />);

    const section = document.getElementById('contact');
    expect(section).toBeInTheDocument();
    expect(section?.tagName).toBe('SECTION');
  });

  it('shows validation errors when submitting empty form', async () => {
    render(<ContactSection />);

    fireEvent.click(screen.getByRole('button', { name: /wyślij wiadomość/i }));

    expect(await screen.findByText('Imię jest wymagane')).toBeInTheDocument();
    expect(screen.getByText('Email jest wymagany')).toBeInTheDocument();
    expect(screen.getByText('Wiadomość jest wymagana')).toBeInTheDocument();
  });

  it('ignores bot submissions when honeypot is filled', async () => {
    const sendContactForm = vi.spyOn(EmailService, 'sendContactForm');

    render(<ContactSection />);

    fireEvent.change(screen.getByPlaceholderText('Wprowadź swoje imię'), {
      target: { value: 'Jan Test' },
    });
    fireEvent.change(screen.getByPlaceholderText('np. twoj@email.pl'), {
      target: { value: 'jan@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('W czym możemy Ci pomóc?'), {
      target: { value: 'Test' },
    });
    fireEvent.change(document.querySelector('.contact-section__honeypot') as HTMLInputElement, {
      target: { value: 'https://spam.example' },
    });

    fireEvent.click(screen.getByRole('button', { name: /wyślij wiadomość/i }));

    expect(sendContactForm).not.toHaveBeenCalled();
    expect(screen.queryByText(/dziękujemy za wiadomość/i)).not.toBeInTheDocument();

    sendContactForm.mockRestore();
  });
});
