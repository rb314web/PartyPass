import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactSection from './ContactSection';

// Mock EmailJS
jest.mock('@emailjs/browser', () => ({
  send: jest.fn(),
  init: jest.fn(),
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
    expect(screen.getByPlaceholderText('twoj@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('W czym możemy Ci pomóc?')).toBeInTheDocument();
  });

  it('renders section with proper structure', () => {
    render(<ContactSection />);

    const section = document.getElementById('contact');
    expect(section).toBeInTheDocument();
    expect(section?.tagName).toBe('SECTION');
  });
});
