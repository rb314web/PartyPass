// components/common/ShortcutsHelp/ShortcutsHelp.tsx
import React, { useState, useEffect } from 'react';
import { Keyboard } from 'lucide-react';
import Modal from '../Modal/Modal';
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
      category: 'Wydarzenia',
    },
    {
      key: 'Ctrl + G',
      description: 'Dodaj gościa',
      category: 'Goście',
    },
    {
      key: 'Ctrl + A',
      description: 'Analityka',
      category: 'Nawigacja',
    },
    {
      key: 'Ctrl + K',
      description: 'Szybkie wyszukiwanie',
      category: 'Wyszukiwanie',
    },
    {
      key: 'Ctrl + S',
      description: 'Zapisz',
      category: 'Akcje',
    },
    {
      key: 'Escape',
      description: 'Zamknij modal',
      category: 'Nawigacja',
    },
  ];

  const categories = Array.from(new Set(shortcuts.map(s => s.category)));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Modal
      open={isOpen}
      onClose={() => setIsOpen(false)}
      title="Skróty klawiszowe"
      icon={<Keyboard size={20} />}
      size="md"
      footer={
        <p className="shortcuts-help__footer-hint">
          Naciśnij <kbd>Escape</kbd> aby zamknąć
        </p>
      }
    >
      <div className="shortcuts-help">
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
    </Modal>
  );
};

export default ShortcutsHelp;
