import { useEffect, useState } from 'react';

export default function SplashIntro({ onDone }) {
  const [out, setOut] = useState(false);
  useEffect(() => {
    const a = setTimeout(() => setOut(true), 2800);
    const b = setTimeout(onDone, 3500);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [onDone]);
  return (
    <div className={`intro ${out ? 'out' : ''}`}>
      <div className="intro-glow" />
      <div className="intro-logo">
        {'DLIM'.split('').map((ch, i) => <span key={i} style={{ animationDelay: `${0.3 + i * 0.14}s` }}>{ch}</span>)}
        <b>TV</b>
      </div>
      <div className="intro-line" />
    </div>
  );
}
