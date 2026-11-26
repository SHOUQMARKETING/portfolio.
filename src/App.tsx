import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ProjectEditorModal} from './components/ProjectEditorModal';
import {ProjectLightbox} from './components/ProjectLightbox';
import {CONTACTS, FOLDERS, LOGO, SERVICE_FOLDER_MAP, T, TOOLS} from './data/portfolioData';
import {STATIC_PROJECTS} from './data/staticProjects';
import type {FolderId, Lang, ProjectItem, WorkSectionId} from './types/portfolio';

const SECTION_IDS = ['hero', 'work', 'services', 'tools', 'contact'] as const;

const MENU_ITEMS = [
  {href: '#work', num: '01', bg: '#EBD9DD', fg: '#4E172A', ln: 'rgba(112,32,57,.07)', key: 'nw' as const},
  {href: '#services', num: '02', bg: '#CCABB4', fg: '#4E172A', ln: 'rgba(78,23,42,.08)', key: 'ns' as const},
  {href: '#tools', num: '03', bg: '#702039', fg: '#FFFFFF', ln: 'rgba(255,255,255,.07)', key: 'th' as const},
  {href: '#contact', num: '04', bg: '#581A2E', fg: '#FFFFFF', ln: 'rgba(255,255,255,.06)', key: 'nc' as const},
];

export default function App() {
  const isAdminUrl = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const path = window.location.pathname.replace(/\/+$/, '');
    return (
      path === '/shouq-edit' ||
      params.has('edit') ||
      params.get('manage') === '1' ||
      params.get('manage') === 'shouq'
    );
  }, []);

  const [lang, setLang] = useState<Lang>('ar');
  const [dark, setDark] = useState(false);
  const [openFolder, setOpenFolder] = useState<FolderId | null>('about');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [projects, setProjects] = useState<ProjectItem[]>(STATIC_PROJECTS);
  const [editMode, setEditMode] = useState(() => isAdminUrl);
  const [lightboxProject, setLightboxProject] = useState<ProjectItem | null>(null);
  const [editorState, setEditorState] = useState<{
    open: boolean;
    section: WorkSectionId;
    editing: ProjectItem | null;
  }>({open: false, section: 'social', editing: null});

  const pgRef = useRef<HTMLElement | null>(null);
  const toolsListRef = useRef<HTMLUListElement | null>(null);
  const contactListRef = useRef<HTMLUListElement | null>(null);
  const finRef = useRef<HTMLDivElement | null>(null);
  const menuBtnRef = useRef<HTMLButtonElement | null>(null);
  const firstMenuLinkRef = useRef<HTMLAnchorElement | null>(null);
  const folderRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const t = T[lang];

  // Fetch live projects from backend when available; otherwise keep baked STATIC_PROJECTS
  useEffect(() => {
    let active = true;
    fetch('/api/projects')
      .then((res) => {
        const contentType = res.headers.get('content-type') || '';
        if (!res.ok || !contentType.includes('application/json')) {
          return null;
        }
        return res.json() as Promise<{projects?: ProjectItem[]}>;
      })
      .then((data) => {
        if (active && data && Array.isArray(data.projects)) {
          setProjects(data.projects);
        }
      })
      .catch(() => {
        // Static hosting fallback uses STATIC_PROJECTS
      });
    return () => {
      active = false;
    };
  }, []);

  // Sync html lang, dir, title
  useEffect(() => {
    const h = document.documentElement;
    h.lang = lang;
    h.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title =
      lang === 'ar'
        ? 'شوق. | Social Media Manager & Content Creator'
        : 'Shouq. | Social Media Manager & Content Creator';
  }, [lang]);

  // Sync dark theme attribute
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, [dark]);

  // Initial scroll top reset matching original behavior
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    if (location.hash) {
      try {
        history.replaceState(null, '', location.pathname + location.search);
      } catch {
        // Ignore
      }
    }
    window.scrollTo(0, 0);
    const timer = window.setTimeout(() => window.scrollTo(0, 0), 60);
    return () => window.clearTimeout(timer);
  }, []);

  const toggleFolder = useCallback((id: FolderId, force?: boolean, quiet?: boolean) => {
    setOpenFolder((prev) => {
      const nextOn = force === undefined ? prev !== id : force;
      const next = nextOn ? id : null;
      if (!quiet && nextOn) {
        const reduced = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
        window.setTimeout(
          () => {
            folderRefs.current[id]?.scrollIntoView({
              behavior: reduced ? 'auto' : 'smooth',
              block: 'start',
            });
          },
          reduced ? 0 : 480,
        );
      }
      return next;
    });
  }, []);

  // Hashchange listener for opening folders
  useEffect(() => {
    const onHash = () => {
      const id = location.hash.slice(1) as FolderId;
      if (FOLDERS.some((f) => f.id === id)) {
        toggleFolder(id, true);
      }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [toggleFolder]);

  // Menu keyboard & body scroll lock
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    if (menuOpen) {
      firstMenuLinkRef.current?.focus();
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
        menuBtnRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  // IntersectionObservers & scroll progress & 3D tool blocks
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion:reduce)');

    const h2Io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('v');
          h2Io.unobserve(e.target);
        }
      });
    });
    document.querySelectorAll('h2').forEach((h) => {
      h.classList.add('rv');
      h2Io.observe(h);
    });

    const folderIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('v');
            folderIo.unobserve(e.target);
          }
        });
      },
      {threshold: 0.05},
    );
    document.querySelectorAll<HTMLElement>('.fd').forEach((f, i) => {
      f.style.setProperty('--dl', `${i * 90}ms`);
      f.classList.add('dr');
      folderIo.observe(f);
    });

    const cm = contactListRef.current;
    const fn = finRef.current;
    let cmIo: IntersectionObserver | null = null;
    let fnIo: IntersectionObserver | null = null;
    if (!mq.matches) {
      toolsListRef.current?.classList.add('pre');
      if (cm) {
        cm.classList.add('pre');
        cmIo = new IntersectionObserver(
          (entries) => entries.forEach((e) => e.target.classList.toggle('v', e.isIntersecting)),
          {threshold: 0.2},
        );
        cmIo.observe(cm);
      }
      if (fn) {
        fn.classList.add('pre');
        fnIo = new IntersectionObserver(
          (entries) => entries.forEach((e) => e.target.classList.toggle('v', e.isIntersecting)),
          {threshold: 0.3},
        );
        fnIo.observe(fn);
      }
    }

    const updateProgressAndTools = () => {
      const m = document.documentElement.scrollHeight - window.innerHeight;
      if (pgRef.current) {
        pgRef.current.style.transform = `scaleX(${m > 0 ? Math.min(window.scrollY / m, 1) : 0})`;
      }
      if (!mq.matches && toolsListRef.current) {
        const vh = window.innerHeight;
        const b = toolsListRef.current.getBoundingClientRect().top;
        toolsListRef.current.querySelectorAll<HTMLElement>('.tk').forEach((tk, i) => {
          let p = Math.min(1, Math.max(0, (vh * 0.92 - b - i * 60) / (vh * 0.38)));
          p = Math.max(Number(tk.dataset.p) || 0, p);
          tk.dataset.p = String(p);
          const q = 1 - p;
          tk.style.opacity = String(p);
          tk.style.transform = `translateZ(${-340 * q}px) translateY(${70 * q}px) scale(${0.7 + 0.3 * p})`;
          tk.style.filter = q > 0.01 ? `blur(${10 * q}px)` : 'none';
        });
      }
    };
    window.addEventListener('scroll', updateProgressAndTools, {passive: true});
    window.addEventListener('resize', updateProgressAndTools);
    updateProgressAndTools();

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = SECTION_IDS.indexOf(e.target.id as (typeof SECTION_IDS)[number]);
            if (idx !== -1) {
              setActiveSectionIndex(idx);
            }
          }
        });
      },
      {rootMargin: '-45% 0px -50% 0px'},
    );
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        sectionObserver.observe(el);
      }
    });

    return () => {
      h2Io.disconnect();
      folderIo.disconnect();
      cmIo?.disconnect();
      fnIo?.disconnect();
      sectionObserver.disconnect();
      window.removeEventListener('scroll', updateProgressAndTools);
      window.removeEventListener('resize', updateProgressAndTools);
    };
  }, []);

  const sectionLabels = useMemo(() => ['شوق.', t.nw, t.ns, t.th, t.nc], [t]);

  const projectsBySection = useMemo(() => {
    const grouped: Record<WorkSectionId, ProjectItem[]> = {social: [], content: [], ugc: []};
    for (const p of projects) {
      if (grouped[p.section]) {
        grouped[p.section].push(p);
      }
    }
    return grouped;
  }, [projects]);

  async function handleDeleteProject(project: ProjectItem) {
    try {
      const res = await fetch(`/api/projects/${project.id}`, {method: 'DELETE'});
      if (res.ok) {
        setProjects((prev) => prev.filter((item) => item.id !== project.id));
      }
    } catch {
      // Ignore network errors
    }
  }

  function handleSavedProject(saved: ProjectItem, isEdit: boolean) {
    setProjects((prev) =>
      isEdit ? prev.map((item) => (item.id === saved.id ? saved : item)) : [...prev, saved],
    );
    setOpenFolder(saved.section);
  }

  function renderAboutContent() {
    return (
      <>
        <div className="ap" id="abp">
          <p>
            {t.abp.map((sentence, idx) => {
              const parts = sentence.split(/(\*[^*]+\*)/g);
              return (
                <span key={idx} className="ps">
                  {idx > 0 ? ' ' : ''}
                  {parts.map((part, pIdx) =>
                    part.startsWith('*') && part.endsWith('*') ? (
                      <span key={pIdx} className="hl">
                        {part.slice(1, -1)}
                      </span>
                    ) : (
                      part
                    ),
                  )}
                </span>
              );
            })}
          </p>
        </div>
        <div className="pm">
          <p>{t.pm[0]}</p>
          <p>{t.pm[1]}</p>
          <p className="pa">{t.pm[2]}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <header>
        <div className="w">
          <a className="lg" href="#top" aria-label="شوق">
            <i className="lgm" style={{'--m': `url(${LOGO})`} as React.CSSProperties} />
          </a>
          <nav>
            <button
              ref={menuBtnRef}
              id="mb"
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mn"
              onClick={() => setMenuOpen(true)}
            >
              {t.mm}
            </button>
            <a className="hide" href="#contact">
              {t.nc}
            </a>
            <button
              id="tm"
              type="button"
              aria-pressed={dark}
              aria-label="Toggle dark mode / الوضع الداكن"
              onClick={() => setDark((d) => !d)}
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {dark ? (
                  <>
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                  </>
                ) : (
                  <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
                )}
              </svg>
            </button>
            <button
              id="lb"
              type="button"
              data-l={lang}
              aria-label="Switch language / تبديل اللغة"
              onClick={() => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'))}
            >
              <span>AR</span> / <span>EN</span>
            </button>
          </nav>
        </div>
        <i ref={pgRef} id="pg" />
      </header>

      <main id="top">
        <div className="w hero" id="hero">
          <p className="rl" lang="en" dir="ltr">
            Social Media Manager &amp; Content Creator
          </p>
          <h1 key={lang}>
            {t.tag.split(' ').map((word, i) => (
              <span key={i}>
                {i > 0 ? ' ' : ''}
                <span className="wd" style={{'--d': `${i * 90}ms`} as React.CSSProperties}>
                  {word}
                </span>
              </span>
            ))}
          </h1>
          <p className="ds">{t.desc}</p>
          <div className="cta">
            <a className="bt" href="#work">
              {t.nw}
            </a>
            <a className="lk" href="#contact">
              {t.nc}
            </a>
          </div>
          <p className="lc">{t.loc}</p>
          <p className="cue">{t.cue}</p>
        </div>

        <section id="work">
          <div className="w">
            <h2>{t.nw}</h2>
            <div
              id="fl"
              onKeyDown={(e) => {
                const target = e.target as HTMLElement;
                if (!target.classList.contains('tb')) {
                  return;
                }
                const tabs = Array.from(
                  e.currentTarget.querySelectorAll<HTMLButtonElement>('.tb'),
                );
                const idx = tabs.indexOf(target as HTMLButtonElement);
                const delta = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
                if (delta) {
                  e.preventDefault();
                  tabs[(idx + delta + tabs.length) % tabs.length]?.focus();
                }
              }}
            >
              {FOLDERS.map((folder, i) => {
                const isOpen = openFolder === folder.id;
                const isWorkSection = folder.id !== 'about';
                const sectionId = folder.id as WorkSectionId;
                const sectionProjects = isWorkSection ? projectsBySection[sectionId] : [];
                const folderText = t.f[i];

                return (
                  <div
                    key={folder.id}
                    id={folder.id}
                    ref={(el) => {
                      folderRefs.current[folder.id] = el;
                    }}
                    className={`fd ${isOpen ? 'open' : ''}`}
                    style={
                      {
                        '--bg': folder.bg,
                        '--fg': folder.fg,
                        '--ln': folder.ln,
                        '--ph': folder.ph,
                        '--o': folder.o,
                      } as React.CSSProperties
                    }
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (target.closest('button.fd-btn, button.cv-wrap, button.prj-act, a.ugc-clip-link')) {
                        return;
                      }
                      if (target.closest('.tb') || !isOpen) {
                        toggleFolder(folder.id);
                      }
                    }}
                  >
                    <button
                      className="tb tx"
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`p-${folder.id}`}
                    >
                      <span className="n">0{i + 1}</span>
                      <span className="t">{folderText[0]}</span>
                      <span className="ch" aria-hidden="true" />
                    </button>

                    <div className="bd tx">
                      <p className="pk" aria-hidden="true">
                        {folderText[2]}
                      </p>
                      <div className="in" id={`p-${folder.id}`} inert={!isOpen}>
                        <div>
                          <div className="fd-hd">
                            <div>
                              <h3 className="h">{folderText[1]}</h3>
                              <p className="d">{folderText[2]}</p>
                            </div>

                            {isWorkSection && isAdminUrl && (
                              <div className="fd-bar">
                                {(sectionProjects.length === 0 || editMode) && (
                                  <button
                                    type="button"
                                    className="fd-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditorState({
                                        open: true,
                                        section: sectionId,
                                        editing: null,
                                      });
                                    }}
                                  >
                                    {t.ui.addProject}
                                  </button>
                                )}
                                {sectionProjects.length > 0 && (
                                  <button
                                    type="button"
                                    className="fd-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditMode((m) => !m);
                                    }}
                                  >
                                    {editMode ? t.ui.doneEditing : t.ui.editProjects}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {isWorkSection ? (
                            <>
                              <div className="g" data-p={folder.id}>
                                {sectionProjects.length > 0 ? (
                                  sectionProjects.map((project) => {
                                    const cover = project.media[0];
                                    const videos = project.media.filter((m) => m.type === 'video');
                                    const hasMultiVideos = videos.length > 1;
                                    const isSocialSection = sectionId === 'social';
                                    const isContentSection = sectionId === 'content';
                                    const isUgcSection = sectionId === 'ugc';
                                    const showContentBento = isContentSection && project.media.length > 1;
                                    const bentoItems = showContentBento ? project.media.slice(0, 5) : [];
                                    const projectTitle = isUgcSection
                                      ? ''
                                      : project.title[lang] || project.title.ar || project.title.en;
                                    const socialLogoUrl = isSocialSection
                                      ? project.coverLogo || (cover.type === 'image' ? cover.url : '')
                                      : '';
                                    const ugcVideoLinks = isUgcSection
                                      ? (hasMultiVideos ? videos.slice(0, 3) : cover.type === 'video' ? [cover] : [])
                                      : [];
                                    const hasAnyUgcLink = ugcVideoLinks.some((v) => Boolean(v.link));

                                    return (
                                      <figure key={project.id}>
                                        <button
                                          type="button"
                                          className="cv-wrap"
                                          onClick={() => setLightboxProject(project)}
                                          aria-label={projectTitle || folderText[1]}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.querySelectorAll('video').forEach((v) => {
                                              void v.play().catch(() => {});
                                            });
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.querySelectorAll('video').forEach((v) => {
                                              v.pause();
                                              v.currentTime = 0;
                                            });
                                          }}
                                        >
                                          {isSocialSection && socialLogoUrl ? (
                                            <img
                                              src={socialLogoUrl}
                                              alt={projectTitle}
                                              loading="lazy"
                                            />
                                          ) : showContentBento ? (
                                            <div className={`cv-bento b${bentoItems.length}`}>
                                              {bentoItems.map((item) => (
                                                <div key={item.id} className="cv-bento-item">
                                                  {item.type === 'video' ? (
                                                    <>
                                                      <video
                                                        src={item.url}
                                                        muted
                                                        playsInline
                                                        loop
                                                        preload="metadata"
                                                      />
                                                      <span className="cv-bento-play" aria-hidden="true">
                                                        ▶
                                                      </span>
                                                    </>
                                                  ) : (
                                                    <img src={item.url} alt="" loading="lazy" />
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          ) : hasMultiVideos ? (
                                            <div className={`cv-split ${videos.length === 2 ? 'n2' : 'n3'}`}>
                                              {videos.slice(0, 3).map((vid) => (
                                                <video
                                                  key={vid.id}
                                                  src={vid.url}
                                                  muted
                                                  playsInline
                                                  loop
                                                  preload="metadata"
                                                />
                                              ))}
                                            </div>
                                          ) : cover.type === 'video' ? (
                                            <video
                                              src={cover.url}
                                              muted
                                              playsInline
                                              loop
                                              preload="metadata"
                                            />
                                          ) : (
                                            <img src={cover.url} alt={projectTitle} loading="lazy" />
                                          )}

                                          {isSocialSection ? (
                                            <span className="cv-open-btn" aria-hidden="true">
                                              <svg
                                                viewBox="0 0 24 24"
                                                width="14"
                                                height="14"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                              >
                                                <polyline points="15 3 21 3 21 9" />
                                                <polyline points="9 21 3 21 3 15" />
                                                <line x1="21" y1="3" x2="14" y2="10" />
                                                <line x1="3" y1="21" x2="10" y2="14" />
                                              </svg>
                                              {t.ui.openWorks}
                                            </span>
                                          ) : (
                                            !showContentBento &&
                                            (cover.type === 'video' || hasMultiVideos) && (
                                              <span className="cv-badge" aria-hidden="true">
                                                ▶ {t.ui.videoBadge}
                                              </span>
                                            )
                                          )}

                                          {project.media.length > 1 && (
                                            <span className="cv-cnt" aria-hidden="true">
                                              {t.ui.photosVideosCount(project.media.length)}
                                            </span>
                                          )}
                                        </button>

                                        {!isUgcSection && projectTitle && (
                                          <figcaption>{projectTitle}</figcaption>
                                        )}

                                        {isUgcSection && hasAnyUgcLink && (
                                          <div
                                            className={`ugc-links-row ${
                                              ugcVideoLinks.length === 2
                                                ? 'n2'
                                                : ugcVideoLinks.length >= 3
                                                  ? 'n3'
                                                  : ''
                                            }`}
                                          >
                                            {ugcVideoLinks.map((vid) => (
                                              <div key={vid.id} className="ugc-clip-slot">
                                                {vid.link && (
                                                  <a
                                                    href={vid.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="ugc-clip-link"
                                                    aria-label={t.ui.openVideoLink}
                                                    title={vid.link}
                                                  >
                                                    <svg
                                                      viewBox="0 0 24 24"
                                                      width="15"
                                                      height="15"
                                                      fill="none"
                                                      stroke="currentColor"
                                                      strokeWidth="2"
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                      aria-hidden="true"
                                                    >
                                                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                                                    </svg>
                                                  </a>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        {isAdminUrl && editMode && (
                                          <div className="prj-acts">
                                            <button
                                              type="button"
                                              className="prj-act"
                                              onClick={() =>
                                                setEditorState({
                                                  open: true,
                                                  section: project.section,
                                                  editing: project,
                                                })
                                              }
                                            >
                                              {t.ui.edit}
                                            </button>
                                            <button
                                              type="button"
                                              className="prj-act"
                                              onClick={() => void handleDeleteProject(project)}
                                            >
                                              {t.ui.remove}
                                            </button>
                                          </div>
                                        )}
                                      </figure>
                                    );
                                  })
                                ) : (
                                  <>
                                    <i />
                                    <i />
                                    <i />
                                  </>
                                )}
                              </div>
                              {sectionProjects.length === 0 && isAdminUrl && <p className="cp">{t.ph}</p>}
                            </>
                          ) : (
                            renderAboutContent()
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="services">
          <div className="w">
            <h2>{t.ns}</h2>
            <div id="sv">
              {t.sv.map((service, i) => {
                const targetId = SERVICE_FOLDER_MAP[i];
                return (
                  <article key={targetId} className="sr">
                    <h3>{service[0]}</h3>
                    <ul>
                      {service[1].map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>
                    <a
                      href={`#${targetId}`}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleFolder(targetId, true);
                      }}
                    >
                      {t.sl}
                    </a>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="tools">
          <div className="w">
            <h2>{t.th}</h2>
            <p className="tn">{t.tt}</p>
            <ul className="tl" id="tl" ref={toolsListRef}>
              {TOOLS.map((tool, i) => (
                <li
                  key={tool.n}
                  className="tk"
                  style={
                    {
                      '--i': i,
                      '--a': tool.a,
                      '--b': tool.b,
                    } as React.CSSProperties
                  }
                >
                  <div className="sc">
                    <div className="cb">
                      <i className="ly" style={{'--z': '-5px'} as React.CSSProperties} />
                      <i className="ly" style={{'--z': '-10px'} as React.CSSProperties} />
                      <i className="ly" style={{'--z': '-15px'} as React.CSSProperties} />
                      <i className="ly" style={{'--z': '-20px'} as React.CSSProperties} />
                      <div className="fc" />
                      <div className="gl">
                        <svg viewBox="0 0 48 48" aria-hidden="true" dangerouslySetInnerHTML={{__html: tool.g}} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <b>{tool.n}</b>
                    <span className="r">{tool.r[lang]}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="contact">
          <div className="w">
            <div className="ow">
              <svg className="orb" viewBox="-200 -150 400 300" aria-hidden="true">
                <defs>
                  <radialGradient id="og">
                    <stop offset="0" stopColor="#702039" stopOpacity=".32" />
                    <stop offset="1" stopColor="#702039" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle r="120" fill="url(#og)" />
                <g transform="rotate(-18)">
                  <g transform="scale(1 .42)">
                    <g className="sp">
                      <circle r="170" className="rg" />
                      <circle cx="170" r="5" className="dt" />
                    </g>
                  </g>
                </g>
                <g transform="rotate(26)">
                  <g transform="scale(1 .55)">
                    <g className="sp r2">
                      <circle r="140" className="rg" />
                      <circle cx="-140" r="4" className="dt" />
                    </g>
                  </g>
                </g>
                <g transform="rotate(72)">
                  <g transform="scale(1 .34)">
                    <g className="sp r3">
                      <circle r="165" className="rg" />
                      <circle cy="165" r="3.5" className="dt" />
                    </g>
                  </g>
                </g>
              </svg>

              <div className="oc">
                <h2>{t.ch}</h2>
                <p>{t.cp}</p>
              </div>

              <ul className="cl" id="cl" ref={contactListRef}>
                {CONTACTS.map((c, i) => (
                  <li
                    key={c.u}
                    className="tk"
                    style={
                      {
                        '--i': i,
                        '--a': c.a,
                        '--b': c.b,
                      } as React.CSSProperties
                    }
                  >
                    <a href={c.u} target="_blank" rel="noopener" aria-label={c.n[lang]}>
                      <div className="sc">
                        <div className="cb">
                          <i className="ly" style={{'--z': '-5px'} as React.CSSProperties} />
                          <i className="ly" style={{'--z': '-10px'} as React.CSSProperties} />
                          <i className="ly" style={{'--z': '-15px'} as React.CSSProperties} />
                          <i className="ly" style={{'--z': '-20px'} as React.CSSProperties} />
                          <div className="fc" />
                          <div className="gl">
                            <svg
                              viewBox="0 0 48 48"
                              aria-hidden="true"
                              dangerouslySetInnerHTML={{__html: c.g}}
                            />
                          </div>
                        </div>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <p className="hn">{t.hn}</p>

            <div className="fin" ref={finRef}>
              <p>{t.fin}</p>
              <i
                className="lgm2"
                role="img"
                aria-label="شوق"
                style={{'--m': `url(${LOGO})`} as React.CSSProperties}
              />
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="w">
          <span>{t.loc}</span>
        </div>
      </footer>

      <div id="mn" className={menuOpen ? 'o' : ''} role="dialog" aria-modal="true" aria-label="Menu" hidden={!menuOpen}>
        <button
          id="mx"
          type="button"
          onClick={() => {
            setMenuOpen(false);
            menuBtnRef.current?.focus();
          }}
        >
          {t.mc}
        </button>
        <ul>
          {MENU_ITEMS.map((item, idx) => (
            <li
              key={item.href}
              style={
                {
                  '--i': idx,
                  '--bg': item.bg,
                  '--fg': item.fg,
                  '--ln': item.ln,
                } as React.CSSProperties
              }
            >
              <a
                ref={idx === 0 ? firstMenuLinkRef : undefined}
                className="tx"
                href={item.href}
                onClick={() => setMenuOpen(false)}
              >
                <span className="n">{item.num}</span>
                <span className="mt">{t[item.key]}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div id="ct" aria-hidden="true">
        <b>0{activeSectionIndex + 1}</b> / 0{SECTION_IDS.length} · <bdi>{sectionLabels[activeSectionIndex]}</bdi>
      </div>

      <ProjectLightbox
        project={lightboxProject}
        lang={lang}
        sectionTitle={
          lightboxProject
            ? t.f[FOLDERS.findIndex((f) => f.id === lightboxProject.section)]?.[1] ?? ''
            : ''
        }
        onClose={() => setLightboxProject(null)}
      />

      <ProjectEditorModal
        isOpen={editorState.open}
        lang={lang}
        initialSection={editorState.section}
        editingProject={editorState.editing}
        onClose={() => setEditorState((prev) => ({...prev, open: false, editing: null}))}
        onSaved={handleSavedProject}
      />
    </>
  );
}
