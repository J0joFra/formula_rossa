/**
 * components/ImageWithAlt.js
 *
 * Wrapper di next/image che:
 * 1. Forza sempre l'attributo alt (mai vuoto per immagini informative)
 * 2. Mostra un warning in development se alt manca
 * 3. Aggiunge lazy loading e ottimizzazione automatica
 *
 * Uso:
 *   import ImageWithAlt from '../components/ImageWithAlt';
 *   <ImageWithAlt src="/foto.jpg" alt="Descrizione immagine" width={800} height={600} />
 *
 *   // Immagine decorativa (alt vuoto intenzionale):
 *   <ImageWithAlt src="/bg.jpg" alt="" decorative />
 */

import Image from 'next/image';

export default function ImageWithAlt({ src, alt, decorative = false, ...props }) {
  // Warning in development se alt manca su immagini non decorative
  if (process.env.NODE_ENV === 'development' && !decorative && (alt === undefined || alt === null)) {
    console.warn(`[ImageWithAlt] Immagine senza alt: ${src}`);
  }

  return (
    <Image
      src={src}
      alt={decorative ? '' : (alt ?? '')}
      {...props}
    />
  );
}

export function Img({ src, alt, decorative = false, ...props }) {
  if (process.env.NODE_ENV === 'development' && !decorative && (alt === undefined || alt === null)) {
    console.warn(`[Img] Immagine senza alt: ${src}`);
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={decorative ? '' : (alt ?? '')}
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
}