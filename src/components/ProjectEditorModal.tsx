import {useEffect, useRef, useState} from 'react';
import {T} from '../data/portfolioData';
import type {Lang, MediaItem, ProjectItem, WorkSectionId} from '../types/portfolio';

interface ProjectEditorModalProps {
  isOpen: boolean;
  lang: Lang;
  initialSection: WorkSectionId;
  editingProject: ProjectItem | null;
  onClose: () => void;
  onSaved: (project: ProjectItem, isEdit: boolean) => void;
}

export function ProjectEditorModal({
  isOpen,
  lang,
  initialSection,
  editingProject,
  onClose,
  onSaved,
}: ProjectEditorModalProps) {
  const [section, setSection] = useState<WorkSectionId>(initialSection);
  const [coverLogo, setCoverLogo] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descAr, setDescAr] = useState('');
  const [descEn, setDescEn] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setError('');
    setUrlInput('');
    if (editingProject) {
      setSection(editingProject.section);
      setCoverLogo(editingProject.coverLogo ?? '');
      setTitleAr(editingProject.title.ar);
      setTitleEn(editingProject.title.en);
      setDescAr(editingProject.description.ar);
      setDescEn(editingProject.description.en);
      setMedia(editingProject.media);
    } else {
      setSection(initialSection);
      setCoverLogo('');
      setTitleAr('');
      setTitleEn('');
      setDescAr('');
      setDescEn('');
      setMedia([]);
    }
  }, [isOpen, initialSection, editingProject]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const ui = T[lang].ui;
  const isSocial = section === 'social';
  const isUgc = section === 'ugc';
  const sections: {id: WorkSectionId; label: string}[] = [
    {id: 'social', label: T[lang].f[0][1]},
    {id: 'content', label: T[lang].f[1][1]},
    {id: 'ugc', label: T[lang].f[2][1]},
  ];

  async function uploadSingleFile(file: File): Promise<MediaItem> {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'x-filename': encodeURIComponent(file.name),
        'x-mimetype': file.type || 'application/octet-stream',
      },
      body: file,
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as {error?: string};
      throw new Error(data.error || 'Upload failed');
    }
    return (await res.json()) as MediaItem;
  }

  async function uploadLogo(file: File) {
    if (!file.type.startsWith('image/')) {
      return;
    }
    setUploading(true);
    setError('');
    try {
      const uploaded = await uploadSingleFile(file);
      setCoverLogo(uploaded.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function uploadFiles(files: FileList | File[]) {
    const fileArr = Array.from(files).filter(
      (f) => f.type.startsWith('image/') || f.type.startsWith('video/'),
    );
    if (fileArr.length === 0) {
      return;
    }
    setUploading(true);
    setError('');
    try {
      const uploaded: MediaItem[] = [];
      for (const file of fileArr) {
        uploaded.push(await uploadSingleFile(file));
      }
      setMedia((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function handleAddUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      return;
    }
    const isVideo = /\.(mp4|webm|mov|m4v|ogg)(\?|#|$)/i.test(trimmed);
    setMedia((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: isVideo ? 'video' : 'image',
        url: trimmed,
      },
    ]);
    setUrlInput('');
    setError('');
  }

  function moveCover(index: number) {
    setMedia((prev) => {
      if (index <= 0 || index >= prev.length) {
        return prev;
      }
      const next = [...prev];
      const [picked] = next.splice(index, 1);
      next.unshift(picked);
      return next;
    });
  }

  function updateMediaLink(id: string, link: string) {
    setMedia((prev) => prev.map((m) => (m.id === id ? {...m, link} : m)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isUgc && !titleAr.trim() && !titleEn.trim()) {
      setError(ui.emptyTitleError);
      return;
    }
    if (media.length === 0) {
      setError(ui.emptyMediaError);
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = {
        section,
        coverLogo: isSocial ? coverLogo.trim() || undefined : undefined,
        title: isUgc ? {ar: '', en: ''} : {ar: titleAr.trim(), en: titleEn.trim()},
        description: isUgc ? {ar: '', en: ''} : {ar: descAr.trim(), en: descEn.trim()},
        media: media.map((m) => ({
          ...m,
          link: isUgc && m.type === 'video' ? m.link?.trim() || undefined : undefined,
        })),
      };
      const endpoint = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects';
      const method = editingProject ? 'PUT' : 'POST';
      const res = await fetch(endpoint, {
        method,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {error?: string};
        throw new Error(data.error || 'Failed to save');
      }
      const data = (await res.json()) as {project: ProjectItem};
      onSaved(data.project, Boolean(editingProject));
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="sh-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={editingProject ? ui.modalEditTitle : ui.modalAddTitle}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="sh-modal">
        <div className="sh-modal-head">
          <h3>{editingProject ? ui.modalEditTitle : ui.modalAddTitle}</h3>
          <button type="button" className="sh-close" onClick={onClose}>
            {ui.cancel}
          </button>
        </div>

        <form className="sh-modal-body" onSubmit={handleSubmit}>
          <div className="sh-field">
            <label htmlFor="prj-section">{ui.sectionLabel}</label>
            <select
              id="prj-section"
              className="sh-select"
              value={section}
              onChange={(e) => setSection(e.target.value as WorkSectionId)}
            >
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {isSocial && (
            <div className="sh-field">
              <label>{ui.coverLogoLabel}</label>
              <div className="sh-logo-row">
                {coverLogo && (
                  <div className="sh-logo-preview">
                    <img src={coverLogo} alt="" />
                  </div>
                )}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      void uploadLogo(f);
                      e.target.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  className="sh-close"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? ui.uploading : ui.chooseLogo}
                </button>
                {coverLogo && (
                  <button
                    type="button"
                    className="sh-close"
                    onClick={() => setCoverLogo('')}
                  >
                    {ui.removeLogo}
                  </button>
                )}
              </div>
            </div>
          )}

          {!isUgc && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '12px',
              }}
            >
              <div className="sh-field">
                <label htmlFor="prj-title-ar">{ui.titleAr}</label>
                <input
                  id="prj-title-ar"
                  className="sh-input"
                  type="text"
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  placeholder={lang === 'ar' ? 'مثال: حساب متجر...' : 'e.g. Brand account'}
                />
              </div>
              <div className="sh-field">
                <label htmlFor="prj-title-en">{ui.titleEn}</label>
                <input
                  id="prj-title-en"
                  className="sh-input"
                  type="text"
                  dir="ltr"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="Optional English title"
                />
              </div>
            </div>
          )}

          <div className="sh-field">
            <label>
              {isSocial ? ui.worksMediaLabel : isUgc ? ui.ugcMediaLabel : ui.mediaLabel}
            </label>
            <div
              className={`sh-drop ${isDragging ? 'drag' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files?.length) {
                  void uploadFiles(e.dataTransfer.files);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                hidden
                onChange={(e) => {
                  if (e.target.files?.length) {
                    void uploadFiles(e.target.files);
                    e.target.value = '';
                  }
                }}
              />
              <p style={{margin: '0 0 10px', color: 'var(--mu)', fontSize: '.9rem'}}>{ui.dropHint}</p>
              <button
                type="button"
                className="sh-close"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                {uploading ? ui.uploading : ui.chooseFiles}
              </button>
            </div>

            <div style={{display: 'flex', gap: '8px', marginTop: '10px'}}>
              <input
                type="url"
                className="sh-input"
                dir="ltr"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder={ui.orUrl}
              />
              <button type="button" className="sh-close" onClick={handleAddUrl} style={{whiteSpace: 'nowrap'}}>
                {ui.addUrl}
              </button>
            </div>

            {media.length > 0 && (
              <div className="sh-media-grid">
                {media.map((item, idx) => (
                  <div key={item.id} className="sh-media-card">
                    <div className="sh-media-tile">
                      {item.type === 'video' ? (
                        <video src={item.url} muted playsInline preload="metadata" />
                      ) : (
                        <img src={item.url} alt="" />
                      )}
                      <div className="sh-media-tile-bar">
                        {!isSocial && !isUgc ? (
                          idx === 0 ? (
                            <span className="sh-mini-btn">{ui.coverBadge}</span>
                          ) : (
                            <button type="button" className="sh-mini-btn" onClick={() => moveCover(idx)}>
                              {ui.setCover}
                            </button>
                          )
                        ) : (
                          <span />
                        )}
                        <button
                          type="button"
                          className="sh-mini-btn"
                          onClick={() => setMedia((prev) => prev.filter((m) => m.id !== item.id))}
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {isUgc && item.type === 'video' && (
                      <input
                        type="url"
                        className="sh-link-input"
                        dir="ltr"
                        value={item.link ?? ''}
                        onChange={(e) => updateMediaLink(item.id, e.target.value)}
                        placeholder={ui.videoLinkPlaceholder}
                        aria-label={ui.videoLinkPlaceholder}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {!isUgc && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '12px',
              }}
            >
              <div className="sh-field">
                <label htmlFor="prj-desc-ar">{ui.descAr}</label>
                <textarea
                  id="prj-desc-ar"
                  className="sh-textarea"
                  rows={2}
                  value={descAr}
                  onChange={(e) => setDescAr(e.target.value)}
                />
              </div>
              <div className="sh-field">
                <label htmlFor="prj-desc-en">{ui.descEn}</label>
                <textarea
                  id="prj-desc-en"
                  className="sh-textarea"
                  rows={2}
                  dir="ltr"
                  value={descEn}
                  onChange={(e) => setDescEn(e.target.value)}
                />
              </div>
            </div>
          )}

          {error && (
            <p style={{color: '#B42318', fontSize: '.875rem', margin: '0 0 12px'}} role="alert">
              {error}
            </p>
          )}

          <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px'}}>
            <button type="button" className="sh-close" onClick={onClose}>
              {ui.cancel}
            </button>
            <button type="submit" className="sh-primary" disabled={saving || uploading}>
              {saving ? ui.saving : ui.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
