import { mount } from 'redom';
import SpaghettiAudio from 'modules/spaghetti-audio/SpaghettiAudio';
import 'normalize.css';
import './index.scss';

const spaghettiAudio = new SpaghettiAudio({
  localStorage: true,
  clearButton: true,
});

mount(document.body, spaghettiAudio);
