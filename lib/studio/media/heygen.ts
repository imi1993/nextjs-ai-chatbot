import 'server-only';

const API = 'https://api.heygen.com/v3/videos';

function headers() {
  return {
    'X-Api-Key': process.env.HEYGEN_API_KEY ?? '',
    'Content-Type': 'application/json',
  };
}

export function heygenConfigured() {
  return Boolean(
    process.env.HEYGEN_API_KEY && process.env.HEYGEN_AVATAR_PORTRAIT_ID,
  );
}

/** Starts a vertical talking video of Imene's digital twin with her cloned voice. */
export async function startTwinVideo(script: string, title: string) {
  const res = await fetch(API, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      title,
      avatar_id: process.env.HEYGEN_AVATAR_PORTRAIT_ID,
      voice_id: process.env.HEYGEN_VOICE_ID || undefined,
      script,
      aspect_ratio: '4:5',
      resolution: '1080p',
      caption: { style: 'default' },
    }),
  });
  const json = await res.json().catch(() => null);
  const data = json?.data ?? json;
  const id = data?.video_id ?? data?.id;
  if (!res.ok || !id) {
    throw new Error(
      `HeyGen : ${json?.error?.message ?? json?.message ?? `HTTP ${res.status}`}`,
    );
  }
  return String(id);
}

export async function getTwinVideo(id: string): Promise<{
  status: 'processing' | 'completed' | 'failed';
  url?: string;
  error?: string;
}> {
  const res = await fetch(`${API}/${id}`, { headers: headers() });
  const json = await res.json().catch(() => null);
  const data = json?.data ?? json;
  const status = String(data?.status ?? '');
  if (status === 'completed' && data?.video_url) {
    return { status: 'completed', url: data.video_url };
  }
  if (status === 'failed' || !res.ok) {
    return {
      status: 'failed',
      error: data?.error?.message ?? data?.error ?? `HTTP ${res.status}`,
    };
  }
  return { status: 'processing' };
}
