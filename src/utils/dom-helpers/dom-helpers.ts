const elements = [
  'a',
  'canvas',
  'button',
  'div',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'p',
  'span',
]

type Child = Child[] | HTMLElement | string

const attributeExceptions = ['role']

const appendText = (el: HTMLElement, text: string): void => {
  const textNode = document.createTextNode(text)

  el.appendChild(textNode)
}

const appendArray = (el: HTMLElement, children: Child[]): void => {
  children.forEach((child) => {
    if (Array.isArray(child)) {
      appendArray(el, child)
    } else if (child instanceof window.Element) {
      el.appendChild(child)
    } else if (typeof child === 'string') {
      appendText(el, child)
    }
  })
}

const setStyles = (el: HTMLElement, styles: CSSStyleDeclaration): void => {
  if (!styles) {
    el.removeAttribute('styles')

    return
  }

  Object.entries(styles).forEach(([style, value]) => {
    if (style in el.style) {
      // Cast CSSStyleDeclaration to any — https://github.com/Microsoft/TypeScript/issues/17827
      ;(<any>el.style)[style] = value
    } else {
      // eslint-disable-next-line no-console
      console.warn(
        `${style} is not a valid style for a <${el.tagName.toLowerCase()}>`
      )
    }
  })
}

const makeElement = (
  type: string,
  textOrPropsOrChild?: string | { [key: string]: any } | HTMLElement,
  ...otherChildren: (string | HTMLElement)[]
): HTMLElement => {
  const el = document.createElement(type)

  if (Array.isArray(textOrPropsOrChild)) {
    appendArray(el, textOrPropsOrChild)
  } else if (textOrPropsOrChild instanceof window.Element) {
    el.appendChild(textOrPropsOrChild)
  } else if (typeof textOrPropsOrChild === 'string') {
    appendText(el, textOrPropsOrChild)
  } else if (typeof textOrPropsOrChild === 'object') {
    Object.keys(textOrPropsOrChild).forEach((propName) => {
      if (propName in el || attributeExceptions.includes(propName)) {
        const value = textOrPropsOrChild[propName]

        if (propName === 'style') {
          setStyles(el, value)
        } else if (value) {
          ;(<any>el)[propName] = value
        }
      } else {
        // eslint-disable-next-line no-console
        console.warn(`${propName} is not a valid property of a <${type}>`)
      }
    })
  }

  if (otherChildren) appendArray(el, otherChildren)

  return el
}

const el = elements
  .map((tag) => ({ [tag]: (...args: any[]) => makeElement(tag, ...args) }))
  .reduce((collection, tag) => ({ ...collection, ...tag }), {})

export default el
