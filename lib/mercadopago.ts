import { MercadoPagoConfig, Preference, Payment, MerchantOrder } from 'mercadopago';

const accessToken = process.env.MP_ACCESS_TOKEN || '';

export const mpConfig = new MercadoPagoConfig({ accessToken });
export const mpPreference = new Preference(mpConfig);
export const mpPayment = new Payment(mpConfig);
export const mpMerchantOrder = new MerchantOrder(mpConfig);

export const isMpConfigured = () => Boolean(accessToken);
