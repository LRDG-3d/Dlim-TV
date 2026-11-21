export const coverStyle = (p) => ({
  backgroundSize: 'cover',
  backgroundImage: p.cover
    ? `url(${p.cover})`
    : `linear-gradient(160deg, ${(p.colors || [])[0] || '#3b2a7a'}, ${(p.colors || [])[1] || '#10102a'})`,
});
