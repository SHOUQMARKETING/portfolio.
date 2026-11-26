import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import express from 'express';
import type {Request, Response} from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');

const VALID_SECTIONS = new Set(['social', 'content', 'ugc']);

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  name?: string;
  link?: string;
}

interface ProjectRecord {
  id: string;
  section: 'social' | 'content' | 'ugc';
  coverLogo?: string;
  title: {
    ar: string;
    en: string;
  };
  description: {
    ar: string;
    en: string;
  };
  media: MediaItem[];
  createdAt: number;
}

function ensureStorage(): void {
  fs.mkdirSync(UPLOADS_DIR, {recursive: true});
  if (!fs.existsSync(PROJECTS_FILE)) {
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify([], null, 2), 'utf8');
  }
}

function readProjects(): ProjectRecord[] {
  ensureStorage();
  try {
    const raw = fs.readFileSync(PROJECTS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeProjects(projects: ProjectRecord[]): void {
  ensureStorage();
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf8');
}

function extensionFromMimeOrName(mime: string, filename: string): string {
  const lower = filename.toLowerCase();
  const extMatch = lower.match(/\.(jpg|jpeg|png|webp|gif|avif|svg|mp4|webm|mov|m4v|ogg)$/);
  if (extMatch) {
    return `.${extMatch[1]}`;
  }
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/avif': '.avif',
    'image/svg+xml': '.svg',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'video/quicktime': '.mov',
    'video/x-m4v': '.m4v',
    'video/ogg': '.ogg',
  };
  return map[mime] ?? (mime.startsWith('video/') ? '.mp4' : '.jpg');
}

function sanitizeOptionalLink(raw: unknown): string | undefined {
  if (typeof raw !== 'string') {
    return undefined;
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    return undefined;
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function sanitizeMediaList(raw: unknown): MediaItem[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const result: MediaItem[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') {
      continue;
    }
    const rec = item as Record<string, unknown>;
    const url = typeof rec.url === 'string' ? rec.url.trim() : '';
    const type = rec.type === 'video' ? 'video' : rec.type === 'image' ? 'image' : null;
    if (!url || !type) {
      continue;
    }
    const id = typeof rec.id === 'string' && rec.id.trim() ? rec.id.trim() : crypto.randomUUID();
    const name = typeof rec.name === 'string' ? rec.name.slice(0, 160) : undefined;
    const link = type === 'video' ? sanitizeOptionalLink(rec.link) : undefined;
    result.push({id, type, url, name, ...(link ? {link} : {})});
  }
  return result;
}

function cleanupUnusedUploads(removedUrls: string[], remainingProjects: ProjectRecord[]): void {
  const activeUrls = new Set<string>();
  for (const project of remainingProjects) {
    if (project.coverLogo) {
      activeUrls.add(project.coverLogo);
    }
    for (const m of project.media) {
      activeUrls.add(m.url);
    }
  }
  for (const url of removedUrls) {
    if (!url.startsWith('/uploads/') || activeUrls.has(url)) {
      continue;
    }
    const fileName = path.basename(url);
    const fullPath = path.join(UPLOADS_DIR, fileName);
    if (fullPath.startsWith(UPLOADS_DIR) && fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch {
        // Ignore cleanup failure
      }
    }
  }
}

async function startServer(): Promise<void> {
  ensureStorage();
  const app = express();

  app.use('/uploads', express.static(UPLOADS_DIR, {maxAge: '7d'}));

  app.post(
    '/api/upload',
    express.raw({type: '*/*', limit: '250mb'}),
    (req: Request, res: Response) => {
      try {
        const buf = req.body;
        if (!Buffer.isBuffer(buf) || buf.length === 0) {
          res.status(400).json({error: 'Empty file payload'});
          return;
        }
        const rawName = decodeURIComponent(String(req.headers['x-filename'] ?? 'media'));
        const mime = String(req.headers['x-mimetype'] ?? 'application/octet-stream').toLowerCase();
        if (!mime.startsWith('image/') && !mime.startsWith('video/')) {
          res.status(400).json({error: 'Only image and video files are supported'});
          return;
        }
        const ext = extensionFromMimeOrName(mime, rawName);
        const storedName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}${ext}`;
        fs.writeFileSync(path.join(UPLOADS_DIR, storedName), buf);
        res.status(201).json({
          id: crypto.randomUUID(),
          url: `/uploads/${storedName}`,
          type: mime.startsWith('video/') ? 'video' : 'image',
          name: rawName,
        });
      } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({error: 'Failed to store uploaded file'});
      }
    },
  );

  app.use('/api', express.json({limit: '5mb'}));

  app.get('/api/projects', (_req: Request, res: Response) => {
    res.json({projects: readProjects()});
  });

  app.post('/api/projects', (req: Request, res: Response) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const section = String(body.section ?? '');
    if (!VALID_SECTIONS.has(section)) {
      res.status(400).json({error: 'Invalid project section'});
      return;
    }
    const titleObj = (body.title ?? {}) as Record<string, unknown>;
    const descObj = (body.description ?? {}) as Record<string, unknown>;
    const arTitle = typeof titleObj.ar === 'string' ? titleObj.ar.trim() : '';
    const enTitle = typeof titleObj.en === 'string' ? titleObj.en.trim() : '';
    if (section !== 'ugc' && !arTitle && !enTitle) {
      res.status(400).json({error: 'Project title is required'});
      return;
    }
    const media = sanitizeMediaList(body.media);
    if (media.length === 0) {
      res.status(400).json({error: 'At least one image or video is required'});
      return;
    }
    const coverLogo =
      section === 'social' && typeof body.coverLogo === 'string' && body.coverLogo.trim()
        ? body.coverLogo.trim()
        : undefined;
    const project: ProjectRecord = {
      id: crypto.randomUUID(),
      section: section as 'social' | 'content' | 'ugc',
      ...(coverLogo ? {coverLogo} : {}),
      title:
        section === 'ugc'
          ? {ar: '', en: ''}
          : {
              ar: arTitle || enTitle,
              en: enTitle || arTitle,
            },
      description:
        section === 'ugc'
          ? {ar: '', en: ''}
          : {
              ar: typeof descObj.ar === 'string' ? descObj.ar.trim() : '',
              en: typeof descObj.en === 'string' ? descObj.en.trim() : '',
            },
      media,
      createdAt: Date.now(),
    };
    const projects = readProjects();
    projects.push(project);
    writeProjects(projects);
    res.status(201).json({project});
  });

  app.put('/api/projects/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    const body = (req.body ?? {}) as Record<string, unknown>;
    const projects = readProjects();
    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) {
      res.status(404).json({error: 'Project not found'});
      return;
    }
    const existing = projects[index];
    const section =
      typeof body.section === 'string' && VALID_SECTIONS.has(body.section)
        ? (body.section as 'social' | 'content' | 'ugc')
        : existing.section;
    const titleObj = (body.title ?? {}) as Record<string, unknown>;
    const descObj = (body.description ?? {}) as Record<string, unknown>;
    const arTitle = typeof titleObj.ar === 'string' ? titleObj.ar.trim() : existing.title.ar;
    const enTitle = typeof titleObj.en === 'string' ? titleObj.en.trim() : existing.title.en;
    if (section !== 'ugc' && !arTitle && !enTitle) {
      res.status(400).json({error: 'Project title is required'});
      return;
    }
    const media = body.media !== undefined ? sanitizeMediaList(body.media) : existing.media;
    if (media.length === 0) {
      res.status(400).json({error: 'At least one image or video is required'});
      return;
    }
    const nextCoverLogo =
      section === 'social'
        ? typeof body.coverLogo === 'string'
          ? body.coverLogo.trim() || undefined
          : existing.coverLogo
        : undefined;

    const removedUrls = [
      ...(existing.coverLogo && existing.coverLogo !== nextCoverLogo ? [existing.coverLogo] : []),
      ...existing.media.map((m) => m.url).filter((url) => !media.some((next) => next.url === url)),
    ];

    const updated: ProjectRecord = {
      ...existing,
      section,
      ...(nextCoverLogo ? {coverLogo: nextCoverLogo} : {coverLogo: undefined}),
      title:
        section === 'ugc'
          ? {ar: '', en: ''}
          : {
              ar: arTitle || enTitle,
              en: enTitle || arTitle,
            },
      description:
        section === 'ugc'
          ? {ar: '', en: ''}
          : {
              ar: typeof descObj.ar === 'string' ? descObj.ar.trim() : existing.description.ar,
              en: typeof descObj.en === 'string' ? descObj.en.trim() : existing.description.en,
            },
      media,
    };
    if (!updated.coverLogo) {
      delete updated.coverLogo;
    }
    projects[index] = updated;
    writeProjects(projects);
    cleanupUnusedUploads(removedUrls, projects);
    res.json({project: updated});
  });

  app.delete('/api/projects/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    const projects = readProjects();
    const target = projects.find((p) => p.id === id);
    if (!target) {
      res.status(404).json({error: 'Project not found'});
      return;
    }
    const remaining = projects.filter((p) => p.id !== id);
    writeProjects(remaining);
    cleanupUnusedUploads(
      [...(target.coverLogo ? [target.coverLogo] : []), ...target.media.map((m) => m.url)],
      remaining,
    );
    res.json({ok: true});
  });

  const distDir = path.resolve(__dirname, 'dist');
  const isDev =
    process.argv.includes('--dev') ||
    process.env.npm_lifecycle_event === 'dev';
  const useProdStatic = !isDev && fs.existsSync(distDir);
  const PORT = isDev ? 3000 : Number(process.env.PORT) || 3000;

  if (!useProdStatic) {
    const {createServer: createViteServer} = await import('vite');
    const vite = await createViteServer({
      server: {middlewareMode: true},
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
