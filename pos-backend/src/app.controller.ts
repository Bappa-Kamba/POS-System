import { Controller, Get } from '@nestjs/common';
import { getLanIp } from './common/utils';

@Controller('')
export class AppController {
  constructor() {}
  @Get('endpoint')
  getEndpoint() {
    return {
      mdns: 'pos-server.local',
      ip: getLanIp(),
      port: 3000,
      apiBase: '/api/v1',
    };
  }

  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
