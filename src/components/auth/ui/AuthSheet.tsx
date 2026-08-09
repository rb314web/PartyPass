import React from 'react';

export interface AuthSheetProps {
  title: string;
  subtitle: string;
  headerExtra?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/** Sheet content for auth routes rendered inside AuthShell. */
const AuthSheet: React.FC<AuthSheetProps> = ({
  title,
  subtitle,
  headerExtra,
  footer,
  children,
}) => (
  <>
    <header className="gate__sheet-head">
      <h1 className="gate__sheet-title">{title}</h1>
      <p className="gate__sheet-subtitle">{subtitle}</p>
      {headerExtra}
    </header>

    <div className="gate__sheet-body">{children}</div>

    {footer && <div className="gate__sheet-foot">{footer}</div>}
  </>
);

export default AuthSheet;
