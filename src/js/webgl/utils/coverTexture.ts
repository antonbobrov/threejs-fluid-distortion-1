import { Texture } from 'three';

export function coverTexture(texture: Texture, aspect: number) {
  // eslint-disable-next-line no-param-reassign
  texture.matrixAutoUpdate = false;

  const { image } = texture;
  let { width } = texture.image;
  let { height } = texture.image;

  if (image instanceof HTMLVideoElement) {
    width = image.videoWidth;
    height = image.videoHeight;
  }

  const imageAspect = width / height;

  if (aspect < imageAspect) {
    texture.matrix.setUvTransform(0, 0, aspect / imageAspect, 1, 0, 0.5, 0.5);
  } else {
    texture.matrix.setUvTransform(0, 0, 1, imageAspect / aspect, 0, 0.5, 0.5);
  }
}
