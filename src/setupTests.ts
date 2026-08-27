import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement real media playback — stub it out so
// HTMLAudioElement.play() resolves instead of throwing "Not implemented".
window.HTMLMediaElement.prototype.play = () => Promise.resolve();
window.HTMLMediaElement.prototype.pause = () => {};
