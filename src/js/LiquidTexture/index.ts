import { addEventListener, Canvas, clamp, vevet } from 'vevet';
import { CanvasTexture } from 'three';
import { TVec2 } from './types';

export class LiquidTexture {
  protected _destructors: (() => void)[] = [];

  protected _main: Canvas;

  protected _buffer: Canvas;

  protected _point?: TVec2;

  protected _isMoving = false;

  protected _movingTimeout: ReturnType<typeof setTimeout> | undefined;

  protected _intensity = 0;

  protected _texture: CanvasTexture;

  get texture() {
    return this._texture;
  }

  constructor(protected _onTexure: (texture: CanvasTexture) => void) {
    this._main = new Canvas({
      container: document.body,
      resizeOnRuntime: true,
      append: false,
    });
    this._destructors.push(() => this._main.destroy());

    this._buffer = new Canvas({
      container: document.body,
      resizeOnRuntime: true,
      append: false,
    });
    this._destructors.push(() => this._buffer.destroy());

    this._texture = new CanvasTexture(this._main.canvas);
    this._destructors.push(() => this._texture.dispose());

    _onTexure(this._texture);
    this._main.on('resize', () => {
      this._texture.dispose();
      this._texture = new CanvasTexture(this._main.canvas);
      _onTexure(this._texture);
    });

    this._destructors.push(
      addEventListener(window, 'mousemove', this._handleMouseMove.bind(this)),
    );
  }

  protected _handleMouseMove(event: MouseEvent) {
    const x = event.clientX / vevet.width;
    const y = event.clientY / vevet.height;

    this._point = { x, y };

    if (this._movingTimeout) {
      clearTimeout(this._movingTimeout);
      this._movingTimeout = undefined;
    }

    this._isMoving = true;

    this._movingTimeout = setTimeout(() => {
      this._isMoving = false;
    }, 250);
  }

  public render(ease: number) {
    const iterator = this._isMoving ? 0.05 : -0.001;
    this._intensity = clamp(this._intensity + ease * iterator);

    this._renderPoint();
    this._renderBuffer();

    this._texture.needsUpdate = true;
  }

  protected _renderPoint() {
    this._main.render(({ ctx, width, height }) => {
      if (!this._point) {
        return;
      }

      const offsetX = width * 10;
      const offsetY = height * 10;

      const radius = Math.max(width, height) * 0.075 * this._intensity;

      const x = this._point.x * width;
      const y = this._point.y * height;

      ctx.shadowOffsetX = offsetX;
      ctx.shadowOffsetY = offsetY;
      ctx.shadowColor = `rgba(255, 255, 255, ${this._intensity})`;
      ctx.shadowBlur = radius * 0.5;

      ctx.beginPath();
      ctx.arc(x - offsetX, y - offsetY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = 'white';
      ctx.fill();

      this._point = undefined;
    });
  }

  protected _renderBuffer() {
    this._buffer.render(({ ctx, width, height }) => {
      ctx.clearRect(0, 0, width, height);
      ctx.save();

      ctx.translate(width * 0.5, height * 0.5);
      ctx.scale(1.01, 1.01);
      ctx.translate(-width * 0.5, -height * 0.5);

      ctx.drawImage(this._main.canvas, 0, 0);
      ctx.restore();
    });

    this._main.render(({ ctx, width, height }) => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = 0.98 * this._intensity;
      ctx.drawImage(this._buffer.canvas, 0, 0);
      ctx.globalAlpha = 1;
    });
  }

  public destroy() {
    this._destructors.forEach((destruct) => destruct());
  }
}
