"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLanIp = getLanIp;
const os_1 = __importDefault(require("os"));
function getLanIp() {
    const interfaces = os_1.default.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        const iface = interfaces[name];
        if (!iface)
            continue;
        for (const net of iface) {
            if (net.family === 'IPv4' &&
                !net.internal &&
                !net.address.startsWith('169.254')) {
                return net.address;
            }
        }
    }
    return null;
}
//# sourceMappingURL=utils.js.map