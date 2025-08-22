// components/common/ShortcutsHelp/ShortcutsHelp.tsx
import React, { useState, useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';
import './ShortcutsHelp.scss';

interface Shortcut {
  key: string;
  description: string;
  category: string;
}

const ShortcutsHelp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts: Shortcut[] = [
    {
      key: 'Ctrl + N',
      description: 'Nowe wydarzenie',
      category: 'Wydarzenia'
    },
    {
      key: 'Ctrl + G',
      description: 'Dodaj gościa',
      category: 'Goście'
    },
    {
      key: 'Ctrl + A',
      description: 'Analityka',
      category: 'Nawigacja'
    },
    {
      key: 'Ctrl + K',
      description: 'Szybkie wyszukiwanie',
      category: 'Wyszukiwanie'
    },
    {
      key: 'Ctrl + S',
      description: 'Zapisz',
      category: 'Akcje'
    },
    {
      key: 'Escape',
      description: 'Zamknij modal',
      category: 'Nawigacja'
    }
  ];

  const categories = Array.from(new Set(shortcuts.map(s => s.category)));

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      setIsOpen(true);
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="shortcuts-help">
      <div className="shortcuts-help__overlay" onClick={() => setIsOpen(false)} />
      <div className="shortcuts-help__modal">
        <div className="shortcuts-help__header">
          <div className="shortcuts-help__title">
            <Keyboard size={24} />
            <h2>Skróty klawiszowe</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="shortcuts-help__close"
            aria-label="Zamknij"
          >
            <X size={20} />
          </button>
        </div>

        <div className="shortcuts-help__content">
          {categories.map(category => (
            <div key={category} className="shortcuts-help__category">
              <h3 className="shortcuts-help__category-title">{category}</h3>
              <div className="shortcuts-help__shortcuts">
                {shortcuts
                  .filter(shortcut => shortcut.category === category)
                  .map((shortcut, index) => (
                    <div key={index} className="shortcuts-help__shortcut">
                      <div className="shortcuts-help__key">
                        {shortcut.key.split(' + ').map((key, i) => (
                          <span key={i} className="shortcuts-help__key-part">
                            {key}
                          </span>
                        ))}
                      </div>
                      <span className="shortcuts-help__description">
                        {shortcut.description}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className="shortcuts-help__footer">
          <p>Naciśnij <kbd>Escape</kbd> aby zamknąć</p>
        </div>
      </div>
    </div>
  );
};

export default ShortcutsHelp;
