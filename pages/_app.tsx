import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '../components/CartContext';
import Toast from '../components/Toast';
import AddModal from '../components/AddModal';

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <CartProvider>
        <Toast />
        <AddModal />
        <Component {...pageProps} />
      </CartProvider>
    </SessionProvider>
  );
}
