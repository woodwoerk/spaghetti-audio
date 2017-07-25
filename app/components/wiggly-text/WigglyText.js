import { el } from 'redom';
import './WigglyText.scss';

class WigglyText {
  constructor(text, link) {
    this.el = link ?
      el('a.WigglyText', { 'data-text': text, ...link }, text) :
      el('span.WigglyText', { 'data-text': text }, text);
  }
}

export default WigglyText;
