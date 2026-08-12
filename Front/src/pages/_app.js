// src/pages/_app.js
'use client';

import '../app/globals.css';
import { Provider } from 'react-redux';
import store from '../lib/store';
import AuthWrapper from '../components/AuthWrapper';
import Head from 'next/head'; // Import Head from next/head

export function MyApp({ Component, pageProps }) {
  return (
    <>
   {/*    <Head> 
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
       <Provider store={store}>
        <AuthWrapper>
          <Component {...pageProps} />
        </AuthWrapper>
      </Provider> */}
    </>
  );
}

export default MyApp; 



