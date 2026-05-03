/**
 * Crée un slug à partir du nom complet pour l'URL
 * Exemple: "Mahdi Soukli" => "mahdi-soukli"
 */
export const createNameSlug = (nomComplet) => {
  if (!nomComplet) return '';
  
  return nomComplet
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Remplacer les espaces par des tirets
    .replace(/[àáâãäå]/g, 'a')      // Remplacer les accents
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9\-]/g, '')    // Garder seulement lettres, chiffres et tirets
    .replace(/\-+/g, '-')           // Éviter les tirets multiples
    .replace(/^\-|\-$/g, '');       // Enlever les tirets au début et à la fin
};

/**
 * Décode un slug pour retrouver le nom original approximatif
 */
export const decodeSlug = (slug) => {
 if (!slug) return '';
  
  // Remplacer les tirets par des espaces
  let decoded = slug.replace(/-/g, ' ');
  
  // Décoder les caractères URL
  decoded = decodeURIComponent(decoded);
  
  // Capitaliser chaque mot
  decoded = decoded.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  return decoded;
};
export const encodeSlug = (name) => {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]/g, '')
    .replace(/\-\-+/g, '-');
};
export const getClientDashboardUrl = (user) => {
  if (!user?.nomComplet) return '/client/dashboard';
  
  const slug = encodeSlug(user.nomComplet);
  return `/client/${slug}/dashboard`;
};