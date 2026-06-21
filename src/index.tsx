import React from 'react';
import ReactDOM from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import './styles/globals/_index.scss';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { setupConsole } from './utils/setupConsole';
import i18n from './i18n';

setupConsole();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(metric => {
  if (process.env.NODE_ENV === 'development') {
    console.debug(`[Web Vitals] ${metric.name}:`, Math.round(metric.value));
  }
});
