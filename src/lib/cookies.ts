import Cookies from 'js-cookie';
import { parseCookies } from 'nookies';

// Salvar cookie no cliente
export const setCookie = (key: string, value: any) => {
  Cookies.set(key, JSON.stringify(value), { expires: 7 }); // Expira em 7 dias
};

// Ler cookie no cliente ou servidor
export const getCookie = (key: string, ctx?: any) => {
  const cookies = parseCookies(ctx);
  return cookies ? JSON.parse(cookies[key] || 'null') : null;
}; 