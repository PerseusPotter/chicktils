// ????
const origSet = setTimeout;
const timers = [];
// index will always be truthy
let i = 1;
export const _setTimeout = function(cb, t, thisCtx, ...args) {
  const index = i;
  timers[index] = true;
  origSet(() => timers[index] && cb.apply(thisCtx || {}, args), t);
  return i++;
};
export const _clearTimeout = function(index) {
  timers[index] = false;
};

export class FrameTimer {
  fps = [];
  target = 0;
  lastRender = 0;
  constructor(targetFps) {
    this.target = 1000 / targetFps;
  }
  shouldRender() {
    const t = Date.now();
    while (this.fps.length > 0 && this.fps[0] < t - 1000) this.fps.shift();
    this.fps.push(t);
    if (this.fps.length === 1) return Boolean(this.lastRender = t);
    const dt = t - this.fps[this.fps.length - 2];
    const dr = t - this.lastRender;
    const r = (dt + dr) > this.target;
    this.lastRender = r ? t : this.lastRender;
    return r;
  }
}