const HEALTH_PATH = '/api/v1/health';

async function probe(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function resolveBackend(): Promise<string> {
  // 1️⃣ Same-origin (best case)
  if (await probe(HEALTH_PATH)) {
    return '/api/v1';
  }

  // 2️⃣ mDNS
  const mdns = 'http://pos-server.local:3000/api/v1';
  if (await probe(`${mdns}/health`)) {
    return mdns;
  }

  // 3️⃣ Cached IP
  const cached = localStorage.getItem('pos_backend');
  if (cached && await probe(`${cached}/health`)) {
    return cached;
  }

  // 4️⃣ Ask backend directly via IP discovery endpoint
  try {
    const res = await fetch('/api/v1/endpoint');
    const data = await res.json();
    if (data?.ip) {
      const ipBase = `http://${data.ip}:${data.port}${data.apiBase}`;
      if (await probe(`${ipBase}/health`)) {
        return ipBase;
      }
    }
  } catch {}

  throw new Error('POS backend unreachable on this network');
}
