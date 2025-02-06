import React from 'react';
import { createRoot } from 'react-dom/client';
import AdminPanel from './AdminPanel';
import './styles.css';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AdminPanel />
  </React.StrictMode>
);