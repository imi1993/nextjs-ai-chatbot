import { Cormorant_Garamond, Manrope } from 'next/font/google';

export const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--st-serif',
});

export const sans = Manrope({
  subsets: ['latin'],
  variable: '--st-sans',
});
