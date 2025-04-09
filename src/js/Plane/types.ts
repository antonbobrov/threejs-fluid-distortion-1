import { Texture } from 'three';
import { Webgl } from '../webgl';

export type TSettings = {
  noiseScale: number;
  ripple: number;
  distortion: number;
};

export type TProps = {
  webgl: Webgl;
  map: Texture;
  settings: TSettings;
};
