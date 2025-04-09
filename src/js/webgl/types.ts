import { WebGLRendererParameters } from 'three';

export interface IWebglCallbacksMap {
  resize: undefined;
  render: undefined;
}

export interface IWebglProps
  extends Omit<WebGLRendererParameters, 'context' | 'canvas'> {
  fov?: number;
  perspective?: number;
  near?: number;
  far?: number;
}
