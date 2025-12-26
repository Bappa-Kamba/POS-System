import { Bonjour } from 'bonjour-service';

const bonjour = new Bonjour();

const service = bonjour.publish({
  name: 'pos-server',
  type: 'http',
  port: 3333,
  host: 'pos-server.local',
});

service.on('up', () => {
  console.log('mDNS: pos-server.local advertised');
});

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

function shutdown() {
  console.log('mDNS: shutting down');
  service.stop?.();
  bonjour.destroy();
  process.exit(0);
}
