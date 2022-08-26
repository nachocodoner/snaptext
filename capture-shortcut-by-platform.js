const { MAC, WINDOWS, LINUX } = require("./detect-platform");

const CaptureShorcutByPlatform = {
    [MAC]: 'Control+Command+Shift+4',
    [WINDOWS]: 'Super+Shift+S',
    [LINUX]: 'Alt+PrintScreen',
};

module.exports = {
  CaptureShorcutByPlatform
};
