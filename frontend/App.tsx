import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, Facebook, Instagram, Music2, Pause, Play, Users, X, Youtube } from 'lucide-react';
import './index.css';

const trackId = 'wFwkPl7iSNI';
const musicUrl = 'https://music.youtube.com/watch?v=wFwkPl7iSNI&feature=gws_kp_track';
const playerUrl = 'https://www.youtube-nocookie.com/embed/' + trackId + '?enablejsapi=1&playsinline=1&rel=0&origin=' + encodeURIComponent(location.origin);
const bookingUrl = 'https://wa.me/201114880069';
const navigation = [
  ['الأعمال', './work/'], ['الخدمات', './services/'], ['بلاي ليست فرحك', './playlist/'],
  ['ليه كاريكا؟', '#about'], ['التواصل', './contact/'],
];
const aboutHashes = new Set(['about', 'why', 'essam-karika', 'mohamed-karika', 'social-links']);
const legacyPaths = { work: 'work/', services: 'services/', booking: 'booking/', contact: 'contact/' };
const profiles = [
  { id: 'essam', name: 'عصام كاريكا', links: [
    ['فيسبوك عصام', 'https://web.facebook.com/esam167', Facebook],
    ['صفحة الكتيبة', 'https://web.facebook.com/katibaevents', Users],
  ] },
  { id: 'mohamed', name: 'محمد كاريكا', links: [
    ['Instagram', 'https://www.instagram.com/djkarikaa/', Instagram],
    ['TikTok', 'https://www.tiktok.com/@djkarikaa', Music2],
    ['YouTube', 'https://www.youtube.com/@DJKARIKA', Youtube],
    ['Facebook', 'https://www.facebook.com/DJkarika.official', Facebook],
  ] },
] as const;
type ProfileId = (typeof profiles)[number]['id'];
type YoutubePlayer = { playVideo: () => void; destroy: () => void };
type YoutubeEvent = { target: YoutubePlayer; data?: number };
type YoutubeWindow = Window & {
  YT?: { Player: new (frame: HTMLIFrameElement, options: { events: Record<string, (event: YoutubeEvent) => void> }) => YoutubePlayer };
  onYouTubeIframeAPIReady?: () => void;
};

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [motion, setMotion] = useState(() => !matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [musicMode, setMusicMode] = useState<'auto' | 'manual' | 'closed'>(() => {
    try {
      if (sessionStorage.getItem('karika-music-dismissed')) return 'closed';
    } catch {}
    return 'auto';
  });
  const musicOpen = musicMode !== 'closed';
  const musicFrame = useRef<HTMLIFrameElement>(null);
  const [activeProfile, setActiveProfile] = useState<ProfileId | null>(null);
  function closeMusic() {
    setMusicMode('closed');
    try { sessionStorage.setItem('karika-music-dismissed', '1'); } catch {}
  }
  const musicButton = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDialogElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (musicMode !== 'auto') return;
    const yt = window as YoutubeWindow;
    let disposed = false;
    const closeBlocked = () => {
      if (!disposed) setMusicMode(current => current === 'auto' ? 'closed' : current);
    };
    const timeout = window.setTimeout(closeBlocked, 6500);
    const setup = () => {
      if (disposed || !musicFrame.current || !yt.YT?.Player) return;
      new yt.YT.Player(musicFrame.current, { events: {
        onReady: ({ target }) => {
          if (disposed) return;
          const attempt = () => {
            if (disposed || document.visibilityState !== 'visible') return;
            const rect = musicFrame.current?.getBoundingClientRect();
            if (rect && rect.top >= 0 && rect.bottom <= innerHeight) target.playVideo();
          };
          attempt();
        },
        onStateChange: ({ data }) => {
          if (data === 1) window.clearTimeout(timeout);
        },
        onAutoplayBlocked: closeBlocked,
        onError: closeBlocked,
      } });
    };
    if (yt.YT?.Player) setup();
    else {
      yt.onYouTubeIframeAPIReady = setup;
      if (!document.querySelector('#karika-yt-api')) {
        const script = document.createElement('script');
        script.id = 'karika-yt-api';
        script.src = 'https://www.youtube.com/iframe_api';
        document.head.append(script);
      }
    }
    return () => {
      disposed = true;
      window.clearTimeout(timeout);
      if (yt.onYouTubeIframeAPIReady === setup) delete yt.onYouTubeIframeAPIReady;
    };
  }, [musicMode]);

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
      <div className="stage-light" aria-hidden="true">
        <div className="event-photo" style={{ backgroundImage: "url('./assets/karika-amber-event.webp')" }} /><div className="event-beams" /><div className="event-haze" />
      </div>
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
        <p className="hero-kicker animate-fade-up" dir="rtl">صوت · إضاءة · تنظيم حفلات</p>
        <h1 className="font-podium animate-fade-up-delay-1" aria-label="FEEL THE BEAT">
          <span>FEEL<span className="mobile-heading-word"> THE</span></span><span><span className="desktop-heading-word">THE </span>BEAT</span>
        </h1>
        <p className="hero-names animate-fade-up-delay-2" dir="rtl">عصام كاريكا ومحمد كاريكا مع فريق الكتيبة</p>
      </div>
      <div className="visual" data-profile={activeProfile || undefined}
        onPointerLeave={event => {
          if (event.pointerType === 'mouse' && !event.currentTarget.matches(':focus-within')) setActiveProfile(null);
        }}
        onBlur={event => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) setActiveProfile(null);
        }}
        onKeyDown={event => {
          if (event.key === 'Escape') setActiveProfile(null);
        }}>
        <div className="portrait-halo" aria-hidden="true" />
        <picture className="approved-portrait" aria-hidden="true">
          <source media="(max-width: 900px), (orientation: portrait)" srcSet="./assets/karika-preview-mobile.webp" />
          <img src="./assets/karika-preview-desktop.webp" alt="" width="1585" height="992" fetchPriority="high" />
        </picture>
        {profiles.map(profile => (
          <div className={'portrait-control portrait-' + profile.id} key={profile.id}>
            <button className="portrait-hit" type="button" aria-label={'روابط ' + profile.name}
              aria-expanded={activeProfile === profile.id} aria-controls={'profile-' + profile.id}
              onPointerEnter={event => { if (event.pointerType === 'mouse') setActiveProfile(profile.id); }}
              onFocus={event => { if (event.currentTarget.matches(':focus-visible')) setActiveProfile(profile.id); }}
              onClick={event => {
                if (event.detail === 0 || (event.nativeEvent as PointerEvent).pointerType === 'mouse') setActiveProfile(profile.id);
                else setActiveProfile(current => current === profile.id ? null : profile.id);
              }}><span className="portrait-hint">{profile.name}</span></button>
            <div className="portrait-socials" id={'profile-' + profile.id} hidden={activeProfile !== profile.id}>
              {profile.links.map(([label, url, Icon]) => (
                <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                  <Icon size={17} aria-hidden="true" /><span>{label}</span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
      <img className="gold-logo" src="./assets/karika-gold-logo.webp" alt="Karika Party Planning" />
      <div className="hero-foot relative z-10 px-6 pb-6 sm:px-10 lg:px-16 lg:pb-8" dir="ltr">
        <div className="hero-actions animate-fade-up-delay-3">
          <a className="action action-primary" href={bookingUrl} target="_blank" rel="noopener noreferrer" dir="rtl">
            احجز على واتساب <ArrowUpRight size={18} aria-hidden="true" />
          </a>
          <a className="action action-outline" href="./work/" dir="rtl">الأعمال</a>
      <button ref={musicButton} className="music-trigger" type="button" aria-controls="music-player"
        aria-expanded={musicOpen} onClick={() => musicOpen ? closeMusic() : setMusicMode('manual')}>
        <Music2 size={16} aria-hidden="true" /> {musicOpen ? 'إغلاق المزيكا' : 'شغّل المزيكا'}
      </button>
        </div>
        <a className="playlist animate-fade-up-delay-4" href="./playlist/" dir="rtl">
          <Music2 size={17} aria-hidden="true" /> بلاي ليست فرحك <span aria-hidden="true" />
        </a>
      </div>
      {musicOpen && (
        <aside className="music-player" id="music-player" aria-label="مشغّل المزيكا">
          <div className="music-heading">
            <strong dir="ltr">YA KARIKA</strong>
            <button type="button" aria-label="إغلاق مشغّل المزيكا" onClick={() => {
              closeMusic();
              musicButton.current?.focus();
            }}><X size={20} aria-hidden="true" /></button>
          </div>
          <iframe ref={musicFrame} src={playerUrl + (musicMode === 'manual' ? '&autoplay=1' : '')} title="مشغّل التراك من يوتيوب" allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
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
