import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './modules/app/App';
import './styles/tailwind.css';

const applicationRootElement = document.getElementById('root');

if (!applicationRootElement) {
  throw new Error('Root element with id "root" not found');
}

const queryClient = new QueryClient();

ReactDOM.createRoot(applicationRootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
