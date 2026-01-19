import Cookies from 'js-cookie';
import { cookies } from 'next/headers';

// Salvar cookie no cliente
export const setCookie = (key: string, value: any) => {
  Cookies.set(key, JSON.stringify(value), { expires: 7 }); // Expira em 7 dias
};

// Ler cookie no cliente ou servidor
export const getCookie = async (key: string, ctx?: any) => {
  // Se estiver no servidor (Next.js 14+)
  if (typeof window === 'undefined') {
    try {
      const cookieStore = await cookies();
      const cookie = cookieStore.get(key);
      return cookie ? JSON.parse(cookie.value || 'null') : null;
    } catch {
      return null;
    }
  }
  // Se estiver no cliente
  const cookie = Cookies.get(key);
  return cookie ? JSON.parse(cookie || 'null') : null;
}; 