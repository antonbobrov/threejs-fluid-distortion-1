import { CanvasTexture, Mesh, PlaneGeometry, ShaderMaterial } from 'three';
import {
  TCreateDatGuiSettingsReturns,
  createDatGuiSettings,
} from '@anton.bobrov/react-dat-gui';
import { TProps, TSettings } from './types';

import simplexNoise from '../webgl/shaders/simplexNoise.glsl';
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';
import { coverTexture } from '../webgl/utils/coverTexture';

export class Plane {
  private get props() {
    return this._props;
  }

  private get webgl() {
    return this._props.webgl;
  }

  private _initWidth: number;

  private _initHeight: number;

  private _mesh: Mesh;

  private _geometry: PlaneGeometry;

  private _material: ShaderMaterial;

  private _gui: TCreateDatGuiSettingsReturns<TSettings>;

  private _destructors: (() => void)[] = [];

  constructor(private _props: TProps) {
    const { webgl, settings } = _props;

    // Save initial sizes
    this._initWidth = webgl.width;
    this._initHeight = webgl.height;
    const aspect = this._initWidth / this._initHeight;

    // Prepare textures
    coverTexture(this.props.map, aspect);

    // Create geometry
    this._geometry = new PlaneGeometry(this._initWidth, this._initHeight, 1, 1);

    // Create shader material
    this._material = new ShaderMaterial({
      vertexShader,
      fragmentShader: simplexNoise + fragmentShader,
      uniforms: {
        uvTransform: { value: this.props.map.matrix },
        u_time: { value: 0 },
        u_aspect: { value: aspect },
        u_map: { value: this._props.map },
        u_distortionMap: { value: null },
        u_noiseScale: { value: settings.noiseScale },
        u_ripple: { value: settings.ripple },
        u_distortion: { value: settings.distortion },
      },
    });

    // create mesh
    this._mesh = new Mesh(this._geometry, this._material);
    webgl.scene.add(this._mesh);

    // create gui
    this._gui = createDatGuiSettings({
      name: 'Plane',
      data: settings,
      parameters: {
        noiseScale: { type: 'number', min: 0.5, max: 5, step: 0.05 },
        ripple: { type: 'number', min: 1, max: 15, step: 0.5 },
        distortion: { type: 'number', min: 0.1, max: 5, step: 0.001 },
      },
      isOpen: true,
      onChange: (data) => {
        this._material.uniforms.u_noiseScale.value = data.noiseScale;
        this._material.uniforms.u_ripple.value = data.ripple;
        this._material.uniforms.u_distortion.value = data.distortion;

        this._material.needsUpdate = true;
      },
    });

    // Resize
    this._destructors.push(webgl.callbacks.on('resize', () => this._resize()));

    // Render
    this._destructors.push(webgl.callbacks.on('render', () => this._render()));
  }

  /** Resize the scene */
  private _resize() {
    const { width, height } = this.webgl;

    // calculate mesh scale
    const widthScale = width / this._initWidth;
    const heightScale = height / this._initHeight;
    const aspect = width / height;

    // set mesh scale
    this._mesh.scale.set(widthScale, heightScale, 1);

    // update textures
    coverTexture(this.props.map, aspect);

    // uniforms
    this._material.uniforms.uvTransform.value = this.props.map.matrix;
    this._material.uniforms.u_aspect.value = aspect;
  }

  /** Render the scene */
  private _render() {
    const { webgl } = this.props;
    const { uniforms } = this._material;

    uniforms.u_time.value += 1 * webgl.raf.fpsFactor;
  }

  /** Update distortion map */
  public setDistortionMap(distortionMap: CanvasTexture) {
    this._material.uniforms.u_distortionMap.value = distortionMap;
  }

  /** Destroy the scene */
  public destroy() {
    this.webgl.scene.remove(this._mesh);
    this._material.dispose();
    this._geometry.dispose();

    this._gui.destroy();

    this._destructors.forEach((destruct) => destruct());
  }
}
