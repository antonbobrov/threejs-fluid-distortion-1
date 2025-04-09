import { setup } from './js/setup';
import './styles/index.scss';

const video = document.getElementById('video') as HTMLVideoElement;

if (video.readyState >= 1) {
  setup(video);
} else {
  video.addEventListener('loadedmetadata', () => setup(video));
}
