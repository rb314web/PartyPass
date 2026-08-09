import React, { useEffect, useState } from 'react';

interface GateFieldErrorProps {
  id?: string;
  message?: string;
}

const EXIT_MS = 200;

/** Reserved error slot with fade in/out — layout stays stable. */
const GateFieldError: React.FC<GateFieldErrorProps> = ({ id, message }) => {
  const [display, setDisplay] = useState(message ?? '');
  const [visible, setVisible] = useState(Boolean(message));

  useEffect(() => {
    if (message) {
      setDisplay(message);
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    setVisible(false);
    const timeout = window.setTimeout(() => setDisplay(''), EXIT_MS);
    return () => window.clearTimeout(timeout);
  }, [message]);

  return (
    <p
      id={id}
      className={`gate__field-error${visible ? ' gate__field-error--visible' : ''}`}
      role={visible ? 'alert' : undefined}
      aria-hidden={!visible}
    >
      {display}
    </p>
  );
};

export default GateFieldError;
