import { Deque } from './polyfill';
import { wrap } from './threading';

const Threading = Java.type('gg.essential.api.utils.Multithreading');
const MILLISECONDS = Java.type('java.util.concurrent.TimeUnit').MILLISECONDS;
const timers = [];
// index will always be truthy
let i = 1;
export const _setTimeout = function(cb, t, thisCtx, ...args) {
  timers[i] = Threading.schedule(wrap(cb.bind(thisCtx, ...(args || []))), t, MILLISECONDS);
  return i++;
};
export const _clearTimeout = function(index) {
  timers[index].cancel(false);
};

export class FrameTimer {
  fps;
  target = 0;
  lastRender = 0;
  constructor(targetFps) {
    this.target = 1000 / targetFps;
    this.fps = new Deque();
  }
  shouldRender() {
    const t = Date.now();
    while (this.fps.length > 0 && this.fps.getFirst() < t - 1000) this.fps.shift();
    this.fps.push(t);
    if (this.fps.length === 1) {
      this.lastRender = t;
      return true;
    }
    // const dt = t - this.fps[this.fps.length - 2];
    const dt = 1000 / this.fps.length;
    const dr = t - this.lastRender;
    if (dt + dr < this.target) return false;
    this.lastRender = t;
    return true;
  }
}

export class DelayTimer {
  delay = 0;
  lastTick = 0;
  constructor(delay) {
    this.delay = delay;
  }
  shouldTick() {
    const t = Date.now();
    if (t - this.lastTick > this.delay) {
      this.lastTick = t;
      return true;
    }
    return false;
  }
}