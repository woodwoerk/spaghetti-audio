import { mount } from 'redom';
import 'normalize.css';
import SpaghettiAudio from 'components/spaghetti-audio/SpaghettiAudio';
import './index.scss';

mount(document.body, new SpaghettiAudio({
  localStorage: true,
  clearButton: true,
}));
