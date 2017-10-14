const elements = [
  'a', 'canvas', 'button', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'p', 'span',
];

const attributeExceptions = [
  'role',
];

const appendText = (el, text) => {
  const textNode = document.createTextNode(text);
  el.appendChild(textNode);
};

const appendArray = (el, children) => {
  children.forEach((child) => {
    if (Array.isArray(child)) {
      appendArray(el, child);
    } else if (child instanceof window.Element) {
      el.appendChild(child);
    } else if (typeof child === 'string') {
      appendText(el, child);
    }
  });
};

const setStyles = (el, styles) => {
  if (!styles) {
    el.removeAttribute('styles');
    return;
  }

  Object.keys(styles).forEach((styleName) => {
    if (styleName in el.style) {
      el.style[styleName] = styles[styleName];
    } else {
      console.warn(`${styleName} is not a valid style for a <${el.tagName.toLowerCase()}>`);
    }
  });
};

const makeElement = (type, textOrPropsOrChild, ...otherChildren) => {
  const el = document.createElement(type);

  if (Array.isArray(textOrPropsOrChild)) {
    appendArray(el, textOrPropsOrChild);
  } else if (textOrPropsOrChild instanceof window.Element) {
    el.appendChild(textOrPropsOrChild);
  } else if (typeof textOrPropsOrChild === 'string') {
    appendText(el, textOrPropsOrChild);
  } else if (typeof textOrPropsOrChild === 'object') {
    Object.keys(textOrPropsOrChild).forEach((propName) => {
      if (propName in el || attributeExceptions.includes(propName)) {
        const value = textOrPropsOrChild[propName];

        if (propName === 'style') {
          setStyles(el, value);
        } else if (value) {
          el[propName] = value;
        }
      } else {
        console.warn(`${propName} is not a valid property of a <${type}>`);
      }
    });
  }

  if (otherChildren) appendArray(el, otherChildren);

  return el;
};

class H {}

Object.assign(H,
  elements
    .map(tag => ({ [tag]: (...args) => makeElement(tag, ...args) }))
    .reduce((collection, tag) => ({ ...collection, ...tag }), {}),
);

export { H, makeElement };
