// Modules to control application life and create native browser window
const {app, BrowserWindow, globalShortcut, clipboard} = require('electron')
const path = require('path');
const { RekognitionClient, DetectTextCommand } = require("@aws-sdk/client-rekognition");
const { CaptureShorcutByPlatform } = require('./capture-shortcut-by-platform');
const { platform } = require('./detect-platform')
const { waitImageClipboard } = require("./wait-image-clipboard");

const GlobalCaptureShortcut = CaptureShorcutByPlatform[platform];

const rekognition = new RekognitionClient({
  credentials: {
    accessKeyId: 'XXX',
    secretAccessKey: 'XXX'
  }
});

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
 mainWindow.webContents.openDevTools()

  return mainWindow;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

  function getCodeFragmentToRunOnRenderer(image, elementId) {
    return `document.getElementById('${elementId}').insertAdjacentHTML('beforeend', '<img src="${image.toDataURL()}" />');`;
  }

  const mainWindow = createWindow()
  const ret = globalShortcut.register(GlobalCaptureShortcut, () => {
    console.log(GlobalCaptureShortcut + ' was pressed');
    waitImageClipboard({
      onImageCaptured: function (imageCaptured) {
        const codeToRunOnRenderer = getCodeFragmentToRunOnRenderer(imageCaptured, 'preview-image')
        mainWindow.webContents.executeJavaScript(codeToRunOnRenderer);

        const bytesString = imageCaptured.toDataURL().split("data:image/png;base64,")[1];
        const image = atob(bytesString);
        const length = image.length;
        const imageBytes = new ArrayBuffer(length);
        const ua = new Uint8Array(imageBytes);
        for (let i = 0; i < length; i++) {
          ua[i] = image.charCodeAt(i);
        }

        rekognition.send(new DetectTextCommand({
          Image: {
            Bytes: ua
          }
        })).then(r => {
          const textDetections = r.TextDetections.reverse();
          const filteredLines = textDetections.filter(textDetection => textDetection.Type === 'LINE');
          console.log(filteredLines);
          if (!filteredLines.length) return;
          const capturedText = filteredLines.length > 1 ? filteredLines.reduce((str, textDetection, i) => {
            return `${textDetection.DetectedText}\n${str}`;
          }, '') : filteredLines[0].DetectedText;
          clipboard.writeText(capturedText);
        }).catch(e => {
          console.error(e);
        });
      }
    });
  })

  if (!ret) {
    console.log('registration failed')
  }

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', () => {
  // Unregister a shortcut.
  globalShortcut.unregister(GlobalCaptureShortcut)

  // Unregister all shortcuts.
  globalShortcut.unregisterAll()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

