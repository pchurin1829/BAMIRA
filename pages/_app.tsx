import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '../components/CartContext';
import Toast from '../components/Toast';
import AddModal from '../components/AddModal';
import Head from 'next/head';

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <>
      <Head>
        <title>AIM Exchange</title>
      </Head>
      <SessionProvider session={session}>
        <CartProvider>
          <Toast />
          <AddModal />
          <Component {...pageProps} />
        </CartProvider>
      </SessionProvider>
    </>
  );
}
