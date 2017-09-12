import { mount } from 'redom';
import SpaghettiAudio from 'components/spaghetti-audio/SpaghettiAudio';

mount(document.body, new SpaghettiAudio({
  localStorage: true,
  clearButton: true,
}));
