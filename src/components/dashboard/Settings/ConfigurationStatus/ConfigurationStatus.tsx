// components/dashboard/Settings/ConfigurationStatus/ConfigurationStatus.tsx
import React from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';
import autopayService from '../../../../services/autopayService';
import './ConfigurationStatus.scss';

interface ConfigurationStatusProps {
  className?: string;
}

const ConfigurationStatus: React.FC<ConfigurationStatusProps> = ({
  className,
}) => {
  const config = autopayService.getConfigStatus();

  const getStatusIcon = (configured: boolean) => {
    if (configured) {
      return <Check size={20} className="config-status__icon--success" />;
    }
    return <X size={20} className="config-status__icon--error" />;
  };

  const getSandboxIcon = (sandbox: boolean) => {
    if (sandbox) {
      return (
        <AlertTriangle size={20} className="config-status__icon--warning" />
      );
    }
    return <Check size={20} className="config-status__icon--success" />;
  };

  return (
    <div className={`config-status ${className || ''}`}>
      <h3 className="config-status__title">Autopay Configuration Status</h3>

      <div className="config-status__items">
        <div className="config-status__item">
          {getStatusIcon(config.configured)}
          <span className="config-status__label">Autopay Configuration</span>
          <span
            className={`config-status__value ${config.configured ? 'success' : 'error'}`}
          >
            {config.configured ? 'Configured' : 'Missing'}
          </span>
        </div>

        <div className="config-status__item">
          {getSandboxIcon(!config.sandbox)}
          <span className="config-status__label">Environment</span>
          <span
            className={`config-status__value ${config.sandbox ? 'warning' : 'success'}`}
          >
            {config.sandbox ? 'Sandbox (Development)' : 'Production'}
          </span>
        </div>

        {config.missing.length > 0 && (
          <div className="config-status__missing">
            <h4 className="config-status__missing-title">
              Missing Environment Variables:
            </h4>
            <ul className="config-status__missing-list">
              {config.missing.map(variable => (
                <li key={variable} className="config-status__missing-item">
                  <code>{variable}</code>
                </li>
              ))}
            </ul>
            <p className="config-status__missing-help">
              Add these variables to your <code>.env.local</code> file with
              values from your Autopay merchant dashboard.
            </p>
          </div>
        )}
      </div>

      {config.configured && (
        <div className="config-status__success">
          <p className="config-status__success-message">
            ✅ Autopay is properly configured and ready for payments.
            {config.sandbox &&
              ' You are in sandbox mode - perfect for testing!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ConfigurationStatus;
