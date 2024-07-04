import { fastDistance, rescale } from './math';
import { streamToString } from './net';

const Base64 = Java.type('java.util.Base64');
const ByteArrayInputStream = Java.type('java.io.ByteArrayInputStream');
const ImageIO = Java.type('javax.imageio.ImageIO');
const URL = Java.type('java.net.URL');
const BufferedImage = Java.type('java.awt.image.BufferedImage');
const JImage = Java.type('java.awt.Image');
const ConvolveOp = Java.type('java.awt.image.ConvolveOp');
const Kernel = Java.type('java.awt.image.Kernel');
const File = Java.type('java.io.File');

/**
 * @param {string} url
 * @returns {typeof BufferedImage}
 * @link https://github.com/Sk1erLLC/Patcher/blob/4ce6e196e5ad1339f8a0ab96eb5680c2f6464583/src/main/java/club/sk1er/patcher/screen/render/overlay/ImagePreview.java#L151
 */
export function fromURL(url) {
  if (url.includes('imgur.com/') && !url.includes('i.imgur')) url = `https://i.imgur.com/${url.slice(url.lastIndexOf('/') + 1)}.png`;
  let conn;
  try {
    const u = new URL(url);
    conn = u.openConnection();
    conn.setRequestMethod('GET');
    conn.setUseCaches(true);
    conn.setInstanceFollowRedirects(true);
    conn.addRequestProperty('User-Agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36');
    if (url.includes('imgur')) conn.addRequestProperty('Referer', 'https://imgur.com/');
    conn.setReadTimeout(1000);
    conn.setConnectTimeout(1000);
    conn.setDoOutput(true);
    const stream = conn.getInputStream();
    if (conn.getHeaderField('Content-Type').includes('text/html')) {
      const body = streamToString(stream);
      let imgURL = '';
      let m;
      if (m = body.match(/<meta property="(?:og:image|twitter:image)" content="(.+?)".*?\/?>/)) imgURL = m[1];
      else if (m = body.match(/<img.*?src="(.+?)".*?>/)) imgURL = m[1];
      if (imgURL.startsWith('/')) imgURL = `${u.getProtocol()}://${u.getHost()}${imgURL}`;
      imgURL = imgURL.trim();
      if (imgURL) {
        conn.disconnect();
        return fromURL(imgURL);
      }
    }
    const img = ImageIO.read(stream);
    conn.disconnect();
    return img;
  } catch (e) {
    if (conn) conn.disconnect();
    throw e;
  }
}
/**
 * @param {string} b64
 * @returns {typeof BufferedImage}
 */
export function fromBase64(b64) {
  const o = b64.indexOf(';base64,');
  return ImageIO.read(new ByteArrayInputStream(Base64.getDecoder().decode(o >= 0 ? b64.slice(o + ';base64,'.length) : b64)));
}
/**
 * @param {string} path
 * @returns {typeof BufferedImage}
 */
export function fromFile(path) {
  return ImageIO.read(new File('./config/ChatTriggers/images', path));
}

/**
 * @param {typeof JImage} img
 * @returns {typeof BufferedImage}
 */
export function fromImage(img) {
  const w = img.getWidth(null);
  const h = img.getHeight(null);
  const r = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
  const g = r.createGraphics();
  g.drawImage(img, 0, 0, null);
  g.dispose();
  return r;
}

/**
 * @param {typeof BufferedImage} img
 * @param {number} w
 * @param {number?} h
 * @returns {typeof BufferedImage}
 */
export function resize(img, w, h) {
  if (!h) h = ~~(img.getHeight() / img.getWidth() * w);
  const tmp = img.getScaledInstance(w, h, JImage.SCALE_SMOOTH);
  const nimg = new BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB);

  const g = nimg.createGraphics();
  g.drawImage(tmp, 0, 0, null);
  g.dispose();

  return nimg;
}

/**
 * @param {typeof BufferedImage} img
 * @returns {typeof BufferedImage}
 * @link https://stackoverflow.com/a/43754106
 */
function transposedHBlur(img) {
  const h = img.getHeight();
  const w = img.getWidth();
  const res = new BufferedImage(h, w, BufferedImage.TYPE_INT_RGB);
  const m = [0.00598, 0.060626, 0.241843, 0.383103, 0.241843, 0.060626, 0.00598];
  for (let y = 0; y < h; y++) {
    for (let x = 3; x < w - 3; x++) {
      let r = 0, g = 0, b = 0;
      for (let i = 0; i < 7; i++) {
        let pixel = img.getRGB(x + i - 3, y);
        b += (pixel & 0xFF) * m[i];
        g += ((pixel >> 8) & 0xFF) * m[i];
        r += ((pixel >> 16) & 0xFF) * m[i];
      }
      res.setRGB(y, x, b | (g << 8) | (r << 16));
    }
  }
  return res;
}

/**
 * @param {typeof BufferedImage} img
 * @returns {typeof BufferedImage}
 */
export function guassian(img) {
  return transposedHBlur(transposedHBlur(img));
}

/**
 * @param {typeof BufferedImage} img
 * @returns {typeof BufferedImage}
 */
export function sobel(img) {
  img = grayscale(img);
  const w = img.getWidth();
  const h = img.getHeight();

  const scan = w - 2;
  let pixels = img.getRaster().getDataBuffer().getData();
  let maxG = 0;
  let edgeCols = [];
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let i = y * w + x;

      let c00 = pixels[i - w - 1] + 128;
      let c01 = pixels[i - w + 0] + 128;
      let c02 = pixels[i - w + 1] + 128;
      let c10 = pixels[i + 0 - 1] + 128;
      // let c11 = pixels[i + 0 + 0] + 128;
      let c12 = pixels[i + 0 + 1] + 128;
      let c20 = pixels[i + w - 1] + 128;
      let c21 = pixels[i + w + 0] + 128;
      let c22 = pixels[i + w + 1] + 128;

      let gx = -c00 + c02 - (c10 << 1) + (c12 << 1) - c20 + c22;
      let gy = -c00 - (c01 << 1) - c02 + c20 + (c21 << 1) + c22;
      let g = fastDistance(gx, gy);
      if (g > maxG) maxG = g;
      edgeCols[(y - 1) * scan + x - 1] = g;
    }
  }
  const m = 255 / maxG;
  const res = new BufferedImage(w, h, BufferedImage.TYPE_BYTE_GRAY);
  pixels = res.getRaster().getDataBuffer().getData();
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      pixels[y * h + x] = (y === 0 || y === h - 1 || x === 0 || x === w - 1 ? 0 : edgeCols[(y - 1) * scan + x - 1] * m) - 128;
    }
  }

  return res;
}

/**
 * @param {typeof BufferedImage} img
 * @returns {typeof BufferedImage}
 */
export function grayscale(img) {
  const w = img.getWidth();
  const h = img.getHeight();
  const res = new BufferedImage(w, h, BufferedImage.TYPE_BYTE_GRAY);
  const pixels = res.getRaster().getDataBuffer().getData();
  const k1 = 1 / 256;
  const k2 = 1.0 / 2.2;
  let maxG = 0;
  let minG = 256;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let c = img.getRGB(x, y);
      let r = (c >> 16) & 0xFF;
      let g = (c >> 8) & 0xFF;
      let b = c & 0xFF;

      let v = 256 * ((
        0.2126 * ((r * k1) ** 2.2) +
        0.7152 * ((g * k1) ** 2.2) +
        0.0722 * ((b * k1) ** 2.2)
      ) ** k2);
      if (v > maxG) maxG = v;
      if (v < minG) minG = v;
      pixels[y * w + x] = v - 128;
    }
  }
  const l = w * h;
  for (let i = 0; i < l; i++) {
    pixels[i] = ~~(rescale(pixels[i] + 128, 0, 255, minG, maxG) - 128);
  }
  return res;
}

/**
 * @param {typeof BufferedImage} img
 * @link https://github.com/505e06b2/Image-to-Braille/blob/master/dithering.js
 * @link https://stackoverflow.com/a/65962623
 */
export function dither(img) {
  const w = img.getWidth();
  const h = img.getHeight();

  let oldPixel;
  let newPixel;
  let quantError;
  let errR, errG, errB;

  const _getPixel = (x, y) => {
    const c = img.getRGB(x, y);
    return [(c >> 16) & 0xFF, (c >> 8) & 0xFF, c & 0xFF];
  };

  const _setPixel = (x, y, c) => {
    const col = ((c[0] + 0.5) << 16) | ((c[1] + 0.5) << 8) | (c[2] + 0.5);
    img.setRGB(x, y, col);
  };

  const _closestPalleteColour = (pixel) => {
    return (0.2126 * pixel[0] + 0.7152 * pixel[1] + 0.0722 * pixel[2]) > 128 ? [255, 255, 255] : [0, 0, 0];
  };

  const _colourDifference = (one, two) => {
    return [one[0] - two[0], one[1] - two[1], one[2] - two[2]];
  };

  const clip = x => (x < 0 ? 0 : (x > 255 ? 255 : x));
  const _colourAddError = (x, y, errR, errG, errB) => {
    const p = _getPixel(x, y);
    const c = (clip(p[0] + errR) << 16) | (clip(p[1] + errG) << 8) | clip(p[2] + errB);
    img.setRGB(x, y, c);
  };

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      oldPixel = _getPixel(x, y);
      newPixel = _closestPalleteColour(oldPixel);
      _setPixel(x, y, newPixel);
      quantError = _colourDifference(oldPixel, newPixel);

      errR = quantError[0];
      errG = quantError[1];
      errB = quantError[2];

      if (x + 1 < w) _colourAddError(x + 1, y, (7 / 16) * errR, (7 / 16) * errG, (7 / 16) * errB);
      if (y + 1 < h) {
        _colourAddError(x, y + 1, (5 / 16) * errR, (5 / 16) * errG, (5 / 16) * errB);
        if (x > 0) _colourAddError(x - 1, y + 1, (3 / 16) * errR, (3 / 16) * errG, (3 / 16) * errB);
        if (x + 1 < w) _colourAddError(x + 1, y + 1, (1 / 16) * errR, (1 / 16) * errG, (1 / 16) * errB);
      }
    }
  }
}

const sharpenOp = new ConvolveOp(new Kernel(3, 3,
  [
    -1, -1, -1,
    -1, +9, -1,
    -1, -1, -1
  ]
), ConvolveOp.EDGE_NO_OP, null);
/**
 * @param {typeof BufferedImage} img
 * @returns {typeof BufferedImage}
 */
export function sharpen(img) {
  return sharpenOp.filter(img, null);
}