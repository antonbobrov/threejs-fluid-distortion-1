import { VideoTexture } from 'three';
import { Plane } from './Plane';
import { Webgl } from './webgl';
import { LiquidTexture } from './LiquidTexture';

export function setup(video: HTMLVideoElement) {
  const container = document.getElementById('scene');
  if (!container) {
    return;
  }

  const webgl = new Webgl(container);
  webgl.play();

  const map = new VideoTexture(video);

  const plane = new Plane({
    webgl,
    map,
    settings: {
      noiseScale: 2,
      ripple: 2,
      distortion: 1,
    },
  });

  const liquid = new LiquidTexture((texture) => {
    plane.setDistortionMap(texture);
  });

  webgl.callbacks.on('render', () => {
    liquid.render(webgl.raf.lerpFactor(1));
  });
}
