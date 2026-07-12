import { createElement, type ReactNode } from 'react';
import { describe, expect, it, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { changeAppLanguage } from '../i18n';
import { useLandingSeo } from './useLandingSeo';
import { OG_IMAGE_URL } from '../utils/documentMeta';

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(I18nextProvider, { i18n }, children);

describe('useLandingSeo', () => {
  beforeEach(async () => {
    await changeAppLanguage('pl');
    document.head.innerHTML = '';
    document.title = '';
  });

  it('sets Polish document title and meta tags', () => {
    renderHook(() => useLandingSeo(), { wrapper });

    expect(document.title).toBe('PartyPass — organizacja wydarzeń i RSVP');
    expect(document.documentElement.lang).toBe('pl');
    expect(
      document.querySelector('meta[name="description"]')?.getAttribute('content')
    ).toContain('organizuj wydarzenia');
    expect(
      document.querySelector('meta[property="og:locale"]')?.getAttribute('content')
    ).toBe('pl_PL');
    expect(
      document.querySelector('meta[property="og:image"]')?.getAttribute('content')
    ).toBe(OG_IMAGE_URL);
  });

  it('updates meta tags when language switches to English', async () => {
    const { rerender } = renderHook(() => useLandingSeo(), { wrapper });

    await changeAppLanguage('en');
    rerender();

    expect(document.title).toBe('PartyPass — event management and RSVP');
    expect(document.documentElement.lang).toBe('en');
    expect(
      document.querySelector('meta[property="og:description"]')?.getAttribute('content')
    ).toContain('Manage guests');
    expect(
      document.querySelector('meta[property="og:locale"]')?.getAttribute('content')
    ).toBe('en_US');
    expect(
      document.querySelector('meta[property="og:url"]')?.getAttribute('content')
    ).toBe('https://partypass.pl/?lang=en');
  });
});
