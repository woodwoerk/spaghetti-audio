import { el } from 'redom';
import './Navigation.scss';

const DEFAULT_DIVIDER = '|';

class Navigation {
  static buildDom(links) {
    return el('ul.Navigation', links.map((link) => {
      const { text } = link;
      delete link.text;

      return el('li',
        link.divider ?
          el('span', text || DEFAULT_DIVIDER) :
          el('a', link, text),
      );
    }));
  }

  constructor(links) {
    this.el = Navigation.buildDom(links);
  }
}

export default Navigation;
