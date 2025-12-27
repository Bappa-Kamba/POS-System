import os from 'os';

export function getLanIp(): string | null {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    if (!iface) continue;

    for (const net of iface) {
      if (
        net.family === 'IPv4' &&
        !net.internal &&
        !net.address.startsWith('169.254')
      ) {
        return net.address;
      }
    }
  }

  return null;
}
