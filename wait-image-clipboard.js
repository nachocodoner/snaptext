const {clipboard} = require('electron')

const waitImageClipboard = function({ prevClipboard, onImageCaptured }) {
    if (!prevClipboard) {
        prevClipboard = clipboard.readImage();
    }
    const currentClipboard = clipboard.readImage();
    const shouldBeImage = !currentClipboard.isEmpty();
    const shouldHaveBeenCaptured = shouldBeImage && currentClipboard.toDataURL() !== prevClipboard.toDataURL();

    if (shouldHaveBeenCaptured) {
        onImageCaptured(currentClipboard);
        return;
    }

    setTimeout(function () {
        waitImageClipboard({ prevClipboard, onImageCaptured });
    }, 1_000);
};

module.exports = {
    waitImageClipboard
}