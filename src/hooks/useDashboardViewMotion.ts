import { useCallback, useEffect, useRef, useState } from 'react';

import {

  DASHBOARD_CONTENT_REVEAL_MS,

  DASHBOARD_MIN_LOADER_MS,

} from '../constants/dashboardMotion';

import { runAfterNextPaint } from '../utils/requestNextFrame';



export type DashboardViewMotionVariant = 'shell' | 'async';



/** Bufor (ms) po zakończeniu fade-out, zanim spinner zniknie z drzewa */

const LOADER_EXIT_BUFFER_MS = 80;



type ShellOptions = {

  variant: 'shell';

  pageClass: string;

};



type AsyncOptions = {

  variant: 'async';

  pageClass: string;

  minLoaderMs?: number;

  initialLoading?: boolean;

  loaderLayout?: 'fullscreen' | 'inline';

};



export type UseDashboardViewMotionOptions = ShellOptions | AsyncOptions;



export type DashboardViewMotionResult =

  | {

      variant: 'shell';

      isLoading: false;

      showLoader: false;

      showContent: true;

      className: string;

    }

  | {

      variant: 'async';

      isLoading: boolean;

      /** Spinner widoczny (z fade-out po załadowaniu) */

      showLoader: boolean;

      /** Treść zamontowana z animacją wejścia */

      showContent: boolean;

      className: string;

      startLoading: () => void;

      finishLoading: () => void;

      resetLoading: () => void;

    };



function buildViewClassName(pageClass: string, modifiers: string[] = []): string {

  return [pageClass, 'dashboard-view', ...modifiers].filter(Boolean).join(' ');

}



export function useDashboardViewMotion(

  options: ShellOptions

): Extract<DashboardViewMotionResult, { variant: 'shell' }>;

export function useDashboardViewMotion(

  options: AsyncOptions

): Extract<DashboardViewMotionResult, { variant: 'async' }>;

export function useDashboardViewMotion(

  options: UseDashboardViewMotionOptions

): DashboardViewMotionResult {

  // Uwaga: hooki muszą być wywoływane bezwarunkowo (rules-of-hooks),
  // dlatego wariant 'shell' obsługujemy dopiero PRZY zwracaniu wyniku,
  // a nie wczesnym returnem przed hookami.
  const pageClass = options.pageClass;

  const minLoaderMs =
    options.variant === 'async'
      ? options.minLoaderMs ?? DASHBOARD_MIN_LOADER_MS
      : DASHBOARD_MIN_LOADER_MS;

  const initialLoading =
    options.variant === 'async' ? options.initialLoading ?? false : false;

  const loaderLayout =
    options.variant === 'async' ? options.loaderLayout ?? 'inline' : 'inline';



  const [isLoading, setIsLoading] = useState(initialLoading);

  const [showLoader, setShowLoader] = useState(initialLoading);

  const [showContent, setShowContent] = useState(!initialLoading);

  const loaderStartedAt = useRef(Date.now());

  const finishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loaderHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const revealCancelRef = useRef<(() => void) | null>(null);



  const clearTimers = useCallback(() => {

    if (finishTimerRef.current) {

      clearTimeout(finishTimerRef.current);

      finishTimerRef.current = null;

    }

    if (loaderHideTimerRef.current) {

      clearTimeout(loaderHideTimerRef.current);

      loaderHideTimerRef.current = null;

    }

    if (revealCancelRef.current) {

      revealCancelRef.current();

      revealCancelRef.current = null;

    }

  }, []);



  useEffect(() => clearTimers, [clearTimers]);



  const startLoading = useCallback(() => {

    clearTimers();

    loaderStartedAt.current = Date.now();

    setShowContent(false);

    setShowLoader(true);

    setIsLoading(true);

  }, [clearTimers]);



  const revealContent = useCallback(() => {

    // Najpierw zamontuj treść (po malowaniu), a dopiero wtedy uruchom
    // licznik ukrycia spinnera — dzięki temu klasa `--exit` zdąży w pełni
    // odegrać fade-out, zanim element zniknie z drzewa.

    revealCancelRef.current = runAfterNextPaint(() => {

      setShowContent(true);

      loaderHideTimerRef.current = setTimeout(() => {

        loaderHideTimerRef.current = null;

        setShowLoader(false);

      }, DASHBOARD_CONTENT_REVEAL_MS + LOADER_EXIT_BUFFER_MS);

    });

  }, []);



  const finishLoading = useCallback(() => {

    clearTimers();



    const delay = Math.max(0, minLoaderMs - (Date.now() - loaderStartedAt.current));



    const complete = () => {

      setIsLoading(false);

      revealContent();

    };



    if (delay > 0) {

      finishTimerRef.current = setTimeout(() => {

        finishTimerRef.current = null;

        complete();

      }, delay);

      return;

    }



    complete();

  }, [minLoaderMs, clearTimers, revealContent]);



  const resetLoading = useCallback(() => {

    startLoading();

  }, [startLoading]);



  if (options.variant === 'shell') {

    return {

      variant: 'shell',

      isLoading: false,

      showLoader: false,

      showContent: true,

      className: buildViewClassName(pageClass, ['dashboard-view--ready']),

    };

  }



  const modifiers: string[] = ['dashboard-view--ready'];

  if (isLoading) {

    modifiers.push(

      loaderLayout === 'fullscreen'

        ? 'dashboard-view--loading'

        : 'dashboard-view--content-loading'

    );

  }



  return {

    variant: 'async',

    isLoading,

    showLoader,

    showContent,

    className: buildViewClassName(pageClass, modifiers),

    startLoading,

    finishLoading,

    resetLoading,

  };

}

