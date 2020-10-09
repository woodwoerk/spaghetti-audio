# Spaghetti Audio

## The Web Audio musical instrument nobody asked for

![Spaghetti Audio](https://i.ibb.co/N6rQgj4/spaghetti-audio.gif)

## Usage

If Spaghetti Audio is exactly what you've been searching for, you too can enjoy the sonic taste of spaghetti sound waves by following these steps:

### Doing it

1. Install via npm or yarn

```bash
npm i spaghetti-audio
```

2. Create some spaghetti

```javascript
import SpaghettiAudio from 'spaghetti-audio'

const spaghettiAudio = new SpaghettiAudio()

// All the spaghetti goodness is rendered to a canvas element,
// so here we attach that to the DOM
document.body.appendChild(spaghettiAudio.canvas)
```

### Attaching to a wrapper

Rather than sticking the spaghetti canvas straight in the `<body>` and taking up the full window width, you can attach it to another element. This example attaches the spaghetti canvas to a wrapper with id `"spaghetti-wrapper"`.

```javascript
import SpaghettiAudio from 'spaghetti-audio'

const wrapper = document.querySelector('#spaghetti-wrapper')
const spaghettiAudio = new SpaghettiAudio({ wrapper })

wrapper.appendChild(spaghettiAudio.canvas)
```

### Usage with React etc

TODO

###  Settings

The following settings can be used to customise the spaghetti experience, use these when initialising spaghetti audio, e.g. `new SpaghettiAudio({ damping: 0.05 })`

```typescript
export interface Settings {
  /** How fast motion dies down. The higher the number, the less oscillation and more al dente the spaghetti. */
  damping?: number
  /** Show the hitboxes and other helpful debugger annotations on the canvas. */
  debug?: boolean
  /** The frequency range of the keyboard. */
  hiRange?: { start: number; end: number }
  /** The key to store the spaghetti strings under in local storage. */
  localStorageKey?: string
  /** It's spaghetti, not scialatelli, so let's set a minimum length. */
  minStringLength?: number
  /** The space around the spaghetti that's interactive. */
  hitboxSize?: number
  /** Spaghetti color. */
  spaghettiColor?: string
  /** Spaghetti width. */
  spaghettiWidth?: number
  /** The total interactive points along each spaghetti string. Minimum is 3 – Two anchor points on each end, and one interactive wobbly point in the middle. */
  totalPoints?: number
  /** How quickly the spaghetti oscillates back to center. The higher the number, the stickier or more molasses-like the spaghetti. */
  viscosity?: number
  /** Show a clear button to clear all the strings. */
  withClearButton?: boolean
  /** Store the spaghetti strings in local storage. */
  withLocalStorage?: boolean
  /** A HTML element, if the spaghetti canvas is attached to a wrapper. */
  wrapper?: HTMLElement
}
```
