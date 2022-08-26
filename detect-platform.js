const os = require('os');
const process = require('process');

const isWindowsWSL = Object.keys(process.env).some(str => str.includes('WSL'));

const MAC = 'mac';
const WINDOWS = 'windows';
const LINUX = 'linux';

const isMac = os.platform() === "darwin";
const isWindows = os.platform() === "win32" || isWindowsWSL;
const isLinux = os.platform() === "linux" && !isWindowsWSL;

let platform;
if (isMac) {
    platform = MAC;
} else if (isWindows) {
    platform = WINDOWS;
} else if (isLinux) {
    platform = LINUX;
}

module.exports = {
  MAC,
  WINDOWS,
  LINUX,
  isMac,
  isWindows,
  isLinux,
  platform,
};
