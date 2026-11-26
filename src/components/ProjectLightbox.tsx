import {useEffect, useState} from 'react';
import {T} from '../data/portfolioData';
import type {Lang, ProjectItem} from '../types/portfolio';

interface ProjectLightboxProps {
  project: ProjectItem | null;
  lang: Lang;
  sectionTitle: string;
  onClose: () => void;
}

function PaperclipIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

export function ProjectLightbox({project, lang, sectionTitle, onClose}: ProjectLightboxProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [project?.id]);

  useEffect(() => {
    if (!project) {
      return;
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        setActiveIndex((prev) =>
          lang === 'ar'
            ? (prev - 1 + project.media.length) % project.media.length
            : (prev + 1) % project.media.length,
        );
      } else if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) =>
          lang === 'ar'
            ? (prev + 1) % project.media.length
            : (prev - 1 + project.media.length) % project.media.length,
        );
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [project, lang, onClose]);

  if (!project) {
    return null;
  }

  const ui = T[lang].ui;
  const isUgc = project.section === 'ugc';
  const videos = project.media.filter((m) => m.type === 'video');
  const images = project.media.filter((m) => m.type === 'image');
  const multiVideoMode = videos.length > 1;
  const current = project.media[activeIndex] ?? project.media[0];
  const hasMultiple = project.media.length > 1;
  const title = isUgc ? '' : project.title[lang] || project.title.ar || project.title.en;
  const desc = isUgc ? '' : project.description[lang] || project.description.ar || project.description.en;

  const goPrev = () => setActiveIndex((prev) => (prev - 1 + project.media.length) % project.media.length);
  const goNext = () => setActiveIndex((prev) => (prev + 1) % project.media.length);

  const gridClass = videos.length === 2 ? 'c2' : videos.length >= 3 ? 'c3' : '';

  return (
    <div
      className="sh-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={title || sectionTitle}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={`sh-modal ${multiVideoMode ? 'wide' : ''}`}>
        <div className="sh-modal-head">
          <div>
            <span style={{fontSize: '.75rem', color: 'var(--mu)', display: 'block'}}>{sectionTitle}</span>
            {title && <h3>{title}</h3>}
          </div>
          <button type="button" className="sh-close" onClick={onClose}>
            {ui.close}
          </button>
        </div>

        <div className="sh-modal-body">
          {multiVideoMode ? (
            <>
              <div className={`sh-videos-grid ${gridClass}`}>
                {videos.map((vid) => (
                  <div key={vid.id} className="sh-video-col">
                    <div className="sh-video-cell">
                      <video src={vid.url} controls playsInline preload="metadata" />
                    </div>
                    {isUgc && vid.link && (
                      <a
                        href={vid.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sh-modal-clip"
                        aria-label={ui.openVideoLink}
                        title={vid.link}
                      >
                        <PaperclipIcon />
                      </a>
                    )}
                  </div>
                ))}
              </div>
              {images.length > 0 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: '10px',
                    marginTop: '14px',
                  }}
                >
                  {images.map((img) => (
                    <div
                      key={img.id}
                      style={{
                        borderRadius: '12px',
                        overflow: 'hidden',
                        background: '#260A14',
                        aspectRatio: '4/5',
                      }}
                    >
                      <img
                        src={img.url}
                        alt={title || sectionTitle}
                        style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="sh-stage">
                {current.type === 'video' ? (
                  <video key={current.url} src={current.url} controls autoPlay playsInline />
                ) : (
                  <img src={current.url} alt={title || sectionTitle} />
                )}

                {hasMultiple && (
                  <>
                    <button
                      type="button"
                      className="sh-nav-btn prev"
                      aria-label={ui.prev}
                      onClick={goPrev}
                    >
                      {lang === 'ar' ? '›' : '‹'}
                    </button>
                    <button
                      type="button"
                      className="sh-nav-btn next"
                      aria-label={ui.next}
                      onClick={goNext}
                    >
                      {lang === 'ar' ? '‹' : '›'}
                    </button>
                  </>
                )}
              </div>

              {isUgc && current.type === 'video' && current.link && (
                <div style={{display: 'flex', justifyContent: 'center', marginTop: '12px'}}>
                  <a
                    href={current.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sh-modal-clip"
                    aria-label={ui.openVideoLink}
                    title={current.link}
                  >
                    <PaperclipIcon />
                  </a>
                </div>
              )}

              {hasMultiple && (
                <div className="sh-thumbs">
                  {project.media.map((item, idx) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`sh-thumb ${idx === activeIndex ? 'active' : ''}`}
                      onClick={() => setActiveIndex(idx)}
                      aria-label={`${idx + 1}`}
                    >
                      {item.type === 'video' ? (
                        <video src={item.url} muted playsInline preload="metadata" />
                      ) : (
                        <img src={item.url} alt="" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {desc && (
            <p style={{margin: '16px 0 0', color: 'var(--mu)', fontSize: '.9375rem', lineHeight: 1.75}}>
              {desc}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
