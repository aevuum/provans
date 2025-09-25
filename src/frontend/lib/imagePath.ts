// Избегаем alias для совместимости: импортируем normalizeImageUrl из корня типов
import { normalizeImageUrl } from '../types/index';

interface PhotosManifest {
  generatedAt: string;
  total: number;
  files: string[];
  index: Record<string, string>;
}

let manifestPromise: Promise<PhotosManifest | null> | null = null;

export function loadPhotosManifest(): Promise<PhotosManifest | null> {
  if (!manifestPromise) {
    manifestPromise = fetch('/photos-manifest.json')
      .then(r => (r.ok ? r.json() : null))
      .catch(() => null);
  }
  return manifestPromise;
}

export async function resolveImageWithManifest(raw?: string | null): Promise<string> {
  // Сначала стандартная нормализация
  const norm = normalizeImageUrl(raw || undefined);
  if (norm && norm !== '/fon.png' && /\/[^\/]+\.[a-zA-Z]{2,5}$/.test(norm)) {
    return norm;
  }
  const input = (raw || '').trim();
  if (!input) return '/fon.png';
  const baseName = input.split(/[\\/]/).pop() || input;
  const key = baseName
    .toLowerCase()
    .replace(/%20/g, '')
    .replace(/\s+/g, '')
    .replace(/\.(jpe?g|png|webp)$/i, '');
  try {
  const manifest: PhotosManifest | null = await loadPhotosManifest();
  if (manifest) {
    if (manifest.index[key]) return manifest.index[key];
    // fallback: по окончанию имени (вдруг в данных добавлены пробелы/регистры)
    const candidates = manifest.files.filter(f => f.toLowerCase().replace(/%20/g,'').includes(key));
    if (candidates.length === 1) return candidates[0];
    // если несколько, берём самый короткий путь
    if (candidates.length > 1) {
      return candidates.sort((a,b)=>a.length-b.length)[0];
    }
  }
  } catch {}
  return norm;
}
