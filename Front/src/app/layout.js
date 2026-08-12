// src/app/layout.js


'use client';

import './globals.css';
import { Provider } from 'react-redux';
import store from '../lib/store';
import AuthWrapper from '../components/AuthWrapper';
import Head from 'next/head';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      
      </Head>
      <body>
        <Provider store={store}>
          <AuthWrapper>{children}</AuthWrapper>
        </Provider>
      </body>
    </html>
  );
}