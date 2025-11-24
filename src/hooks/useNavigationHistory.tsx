// hooks/useNavigationHistory.tsx
import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavigationHistoryItem {
  path: string;
  title: string;
  timestamp: number;
}

export const useNavigationHistory = () => {
  const [history, setHistory] = useState<NavigationHistoryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const location = useLocation();
  const navigate = useNavigate();

  // Mapowanie ścieżek na tytuły
  const getPageTitle = (path: string): string => {
    const titleMap: Record<string, string> = {
      '/': 'Strona główna',
      '/dashboard': 'Dashboard',
      '/dashboard/events': 'Wydarzenia',
      '/dashboard/guests': 'Goście',
      '/dashboard/analytics': 'Analityka',
      '/dashboard/settings': 'Ustawienia',
      '/login': 'Logowanie',
      '/register': 'Rejestracja',
    };

    // Sprawdź dokładne dopasowanie
    if (titleMap[path]) {
      return titleMap[path];
    }

    // Sprawdź częściowe dopasowania
    for (const [route, title] of Object.entries(titleMap)) {
      if (path.startsWith(route) && route !== '/') {
        return title;
      }
    }

    // Domyślny tytuł
    return 'Strona';
  };

  // Dodaj nową pozycję do historii
  const addToHistory = useCallback((path: string) => {
    const title = getPageTitle(path);
    const newItem: NavigationHistoryItem = {
      path,
      title,
      timestamp: Date.now(),
    };

    setHistory(prev => {
      // Usuń duplikaty
      const filtered = prev.filter(item => item.path !== path);
      return [...filtered, newItem];
    });
    setCurrentIndex(prev => prev + 1);
  }, []);

  // Przejdź wstecz
  const goBack = useCallback(() => {
    if (currentIndex > 0) {
      const previousItem = history[currentIndex - 1];
      if (previousItem) {
        navigate(previousItem.path);
        setCurrentIndex(prev => prev - 1);
      }
    }
  }, [history, currentIndex, navigate]);

  // Przejdź do przodu
  const goForward = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const nextItem = history[currentIndex + 1];
      if (nextItem) {
        navigate(nextItem.path);
        setCurrentIndex(prev => prev + 1);
      }
    }
  }, [history, currentIndex, navigate]);

  // Sprawdź czy można iść wstecz
  const canGoBack = currentIndex > 0;

  // Sprawdź czy można iść do przodu
  const canGoForward = currentIndex < history.length - 1;

  // Dodaj aktualną lokalizację do historii przy zmianie
  useEffect(() => {
    addToHistory(location.pathname);
  }, [location.pathname, addToHistory]);

  // Zapisz historię w localStorage
  useEffect(() => {
    const historyData = {
      history,
      currentIndex,
      timestamp: Date.now(),
    };
    localStorage.setItem('navigationHistory', JSON.stringify(historyData));
  }, [history, currentIndex]);

  // Wczytaj historię z localStorage przy starcie
  useEffect(() => {
    const saved = localStorage.getItem('navigationHistory');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // Sprawdź czy dane nie są starsze niż 24h
        if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
          setHistory(data.history || []);
          setCurrentIndex(data.currentIndex || -1);
        }
      } catch (error) {
        console.warn('Nie udało się wczytać historii nawigacji:', error);
      }
    }
  }, []);

  return {
    history,
    currentIndex,
    canGoBack,
    canGoForward,
    goBack,
    goForward,
    getPageTitle,
  };
};
