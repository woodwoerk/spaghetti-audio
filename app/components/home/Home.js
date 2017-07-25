import { el } from 'redom';
import WigglyText from 'components/wiggly-text/WigglyText';
import StringyCanvas from 'components/stringy-canvas/StringyCanvas';
import Navigation from 'components/navigation/Navigation';
import './Home.scss';

const home = el('main.Home', [
  new StringyCanvas(),
  el('h1', 'Joe Smallwood'),
  el('p', ['is an ', new WigglyText('interactive developer'), '.']),
  el('p', ['Based in ', new WigglyText('Helsinki'), '.']),
  el('p', [
    'Currently building React web apps with ',
    new WigglyText('Idean', { href: 'http://idean.com/', target: '_blank' }),
    '.',
  ]),
  new Navigation([
    { text: 'Experiments', href: '/experiments' },
    { text: 'Blog', href: '/blog' },
    { text: '/', divider: true },
    { text: 'CodePen', href: 'http://codepen.io/woodwork/', target: '_blank' },
    { text: 'Github', href: 'http://github.com/woodwoerk/', target: '_blank' },
    { text: 'LinkedIn', href: 'http://linkedin.com/in/smallwoodjoe/', target: '_blank' },
  ]),
]);

class Home {
  constructor() {
    this.el = home;
  }
  onmount() {
    console.log('Home - onmount', this);
  }
  onremount() {
    console.log('Home - onremount', this);
  }
  onunmount() {
    console.log('Home - onunmount', this);
  }
}

export default Home;
