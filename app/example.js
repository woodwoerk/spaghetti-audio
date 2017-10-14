import SpaghettiAudio from 'modules/spaghetti-audio';
import 'normalize.css';
import './index.scss';

const spaghettiAudio = new SpaghettiAudio({
  localStorage: true,
  clearButton: true,
});

document.body.appendChild(spaghettiAudio.canvas);
document.body.appendChild(spaghettiAudio.ui);
