export const coverStyle = (p) => ({
  backgroundImage: p.cover
    ? `url(${p.cover})`
    : `linear-gradient(160deg, ${p.colors[0]}, ${p.colors[1]})`,
});
