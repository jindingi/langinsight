import React from 'react';
import ReactDOM from 'react-dom/client';
import Popup from './Popup.tsx';
import '@/assets/globals.css';
import { initConfig } from '@/config/config.ts';
import { initConfigFields } from '@/config/atom.ts';


async function initApp() {
  await initConfig()
  await initConfigFields()

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>,
  );
}


initApp()