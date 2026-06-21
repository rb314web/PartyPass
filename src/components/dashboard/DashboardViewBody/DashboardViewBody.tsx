import React from 'react';

export interface DashboardViewBodyProps {
  showLoader: boolean;
  showContent: boolean;
  loader: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Obszar treści pod nagłówkiem: spinner z fade-out, potem treść z fade-in (jak Ustawienia).
 */
const DashboardViewBody: React.FC<DashboardViewBodyProps> = ({
  showLoader,
  showContent,
  loader,
  children,
}) => (
  <div className="dashboard-view__body">
    {showLoader && (
      <div
        className={`dashboard-view__content-loading${
          showContent ? ' dashboard-view__content-loading--exit' : ''
        }`}
        role={showContent ? 'presentation' : 'status'}
        aria-live={showContent ? 'off' : 'polite'}
        aria-hidden={showContent}
      >
        {loader}
      </div>
    )}
    {showContent && (
      <div className="dashboard-view__content dashboard-view__content--enter">
        {children}
      </div>
    )}
  </div>
);

export default DashboardViewBody;
