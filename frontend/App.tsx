import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, AudioLines, Music2, Pause, Play, X } from 'lucide-react';
import './index.css';

const trackId = 'wFwkPl7iSNI';
const musicUrl = 'https://music.youtube.com/watch?v=wFwkPl7iSNI&feature=gws_kp_track';
const playerUrl = 'https://www.youtube-nocookie.com/embed/' + trackId + '?autoplay=1&playsinline=1&rel=0';
const bookingUrl = 'https://wa.me/201114880069';
const navigation = [
  ['الأعمال', './work/'], ['الخدمات', './services/'], ['بلاي ليست فرحك', './playlist/'],
  ['ليه كاريكا؟', '#about'], ['التواصل', './contact/'],
];
const aboutHashes = new Set(['about', 'why', 'essam-karika', 'mohamed-karika', 'social-links']);
const legacyPaths = { work: 'work/', services: 'services/', booking: 'booking/', contact: 'contact/' };
const meters = [14, 25, 36, 22, 39, 45, 32, 18, 30, 19, 12];
const pads = [[11, 75], [15, 75], [19, 75], [23, 75], [75, 75], [79, 75], [83, 75], [87, 75]];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [motion, setMotion] = useState(() => !matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [musicOpen, setMusicOpen] = useState(false);
  const musicButton = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDialogElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = (event: MediaQueryListEvent) => setMotion(!event.matches);
    preference.addEventListener('change', updateMotion);
    return () => preference.removeEventListener('change', updateMotion);
  }, []);


  useEffect(() => {
    if (menuOpen && !menu.current?.open) menu.current?.showModal();
    if (!menuOpen && menu.current?.open) menu.current.close();
  }, [menuOpen]);

  useEffect(() => {
    const desktop = matchMedia('(min-width: 768px)');
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false);
    };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  useEffect(() => {
    const about = document.querySelector<HTMLDialogElement>('#about');
    if (!about) return;
    function syncLocation() {
      const id = location.hash.slice(1);
      if (Object.hasOwn(legacyPaths, id)) {
        const target = new URL(legacyPaths[id as keyof typeof legacyPaths], location.href);
        target.search = location.search;
        location.replace(target.href);
      } else if (aboutHashes.has(id)) {
        setMenuOpen(false);
        if (!about!.open) about!.showModal();
        if (id !== 'about' && id !== 'why') document.getElementById(id)?.scrollIntoView({ block: 'nearest' });
      } else if (about!.open) {
        about!.close();
      }
    }
    function clearHash() {
      if (aboutHashes.has(location.hash.slice(1))) history.replaceState(history.state, '', location.pathname + location.search);
    }
    syncLocation();
    window.addEventListener('hashchange', syncLocation);
    about.addEventListener('close', clearHash);
    return () => {
      window.removeEventListener('hashchange', syncLocation);
      about.removeEventListener('close', clearHash);
    };
  }, []);

  return (
    <main className="hero relative isolate overflow-hidden text-white" data-motion={motion ? 'on' : 'off'}>
      <div className="stage-light" aria-hidden="true" />
      <div className="stage-shade absolute inset-0" aria-hidden="true" />
      <header className="site-nav relative z-20 flex items-center justify-between gap-4 px-6 py-4 sm:px-10 lg:px-16 lg:py-5" dir="ltr">
        <a href="./" className="wordmark inline-flex items-center gap-3" aria-label="دي جي كاريكا الرئيسية">
          <span className="font-podium">DJ KARIKA</span><span className="brand-sub" dir="rtl">الكتيبة</span>
        </a>
        <nav className="hidden items-center gap-5 md:flex lg:gap-8" dir="rtl" aria-label="روابط الموقع">
          {navigation.map(([label, url]) => <a key={url} href={url}>{label}</a>)}
        </nav>
        <a className="action action-outline hidden md:inline-flex" dir="rtl" href={bookingUrl} target="_blank" rel="noopener noreferrer">
          احجز على واتساب <ArrowUpRight size={18} aria-hidden="true" />
        </a>
        <button ref={menuButton} className="menu-trigger md:hidden" type="button" aria-label="افتح القائمة" aria-expanded={menuOpen}
          aria-controls="mobile-menu" onClick={() => setMenuOpen(true)}>
          <span /><span /><span />
        </button>
      </header>

      <div className="hero-copy relative z-10 px-6 sm:px-10 lg:px-16" dir="ltr">
        <p className="hero-kicker animate-fade-up" dir="rtl"><AudioLines size={16} /> صوت · إضاءة · تنظيم حفلات</p>
        <h1 className="font-podium animate-fade-up-delay-1" aria-label="FEEL THE BEAT">
          <span>FEEL.</span><span>THE.</span><span>BEAT.</span>
        </h1>
        <p className="hero-names animate-fade-up-delay-2" dir="rtl">عصام كاريكا ومحمد كاريكا مع فريق الكتيبة</p>
      </div>
      <div className="visual" aria-hidden="true">
        <div className="portrait-halo" />
        <div className="portrait-sweep" />
        <img className="duo" src="./assets/karika-duo.webp" width="900" height="600" alt="" fetchPriority="high" />
        <div className="controller">
          <img src="./assets/karika-controller.webp" alt="" />
          <div className="jog jog-left" /><div className="jog jog-right" />
          <div className="levels">{meters.map((height, i) => (
            <span key={i} style={{ '--height': height, '--i': i } as React.CSSProperties} />
          ))}</div>
          {pads.map(([x, y], i) => <span className="pad" key={i} style={{ '--x': x, '--y': y, '--i': i } as React.CSSProperties} />)}
        </div>
      </div>
      <div className="hero-foot relative z-10 px-6 pb-6 sm:px-10 lg:px-16 lg:pb-8" dir="ltr">
        <div className="hero-actions animate-fade-up-delay-3">
          <a className="action action-primary" href={bookingUrl} target="_blank" rel="noopener noreferrer" dir="rtl">
            احجز على واتساب <ArrowUpRight size={18} aria-hidden="true" />
          </a>
          <a className="action action-outline" href="./work/" dir="rtl">شوف أعمالنا</a>
        </div>
        <a className="playlist animate-fade-up-delay-4" href="./playlist/" dir="rtl">
          <Music2 size={17} aria-hidden="true" /> بلاي ليست فرحك <span aria-hidden="true" />
        </a>
      </div>
      <button ref={musicButton} className="music-trigger" type="button" aria-controls="music-player"
        aria-expanded={musicOpen} onClick={() => setMusicOpen(open => !open)}>
        <Music2 size={16} aria-hidden="true" /> {musicOpen ? 'إغلاق المزيكا' : 'شغّل المزيكا'}
      </button>
      {musicOpen && (
        <aside className="music-player" id="music-player" aria-label="مشغّل المزيكا">
          <div className="music-heading">
            <strong>اسمع التراك</strong>
            <button type="button" aria-label="إغلاق مشغّل المزيكا" onClick={() => {
              setMusicOpen(false);
              musicButton.current?.focus();
            }}><X size={20} aria-hidden="true" /></button>
          </div>
          <iframe src={playerUrl} title="مشغّل التراك من يوتيوب" allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
          <a href={musicUrl} target="_blank" rel="noopener noreferrer">افتح التراك على YouTube Music <ArrowUpRight size={14} aria-hidden="true" /></a>
        </aside>
      )}
      <button className="motion-button" type="button" aria-label={motion ? 'أوقف حركة الخلفية' : 'شغّل حركة الخلفية'}
        title={motion ? 'أوقف الحركة' : 'شغّل الحركة'} onClick={() => setMotion(!motion)}>
        {motion ? <Pause size={14} /> : <Play size={14} />}
      </button>
      <dialog className="mobile-menu" id="mobile-menu" ref={menu} aria-label="القائمة الرئيسية"
        onClose={() => { setMenuOpen(false); menuButton.current?.focus(); }}>
        <div className="flex items-center justify-between px-6 py-5" dir="ltr">
          <a className="wordmark font-podium" href="./" onClick={() => setMenuOpen(false)}>DJ KARIKA</a>
          <button className="menu-close" type="button" aria-label="إغلاق القائمة" onClick={() => setMenuOpen(false)}><X size={29} /></button>
        </div>
        <nav aria-label="صفحات الموقع">
          {navigation.map(([label, url], index) => (
            <a href={url} key={url} onClick={() => setMenuOpen(false)} style={{ '--delay': index * 80 + 100 + 'ms' } as React.CSSProperties}>{label}</a>
          ))}
          <a className="action action-primary" href={bookingUrl} target="_blank" rel="noopener noreferrer"
            style={{ '--delay': navigation.length * 80 + 100 + 'ms' } as React.CSSProperties} onClick={() => setMenuOpen(false)}>
            احجز على واتساب <ArrowUpRight size={18} />
          </a>
        </nav>
      </dialog>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
