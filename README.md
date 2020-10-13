# Spaghetti Audio

> ## The musical instrument nobody asked for

![Spaghetti Audio](https://i.ibb.co/YddLy4z/spaghetti-audio.gif)

Spaghetti Audio combines the Web Audio API via [Tone.js](https://tonejs.github.io/) and an interactive canvas to let you draw and strum strings

The longer the string, the lower the pitch, just like an elastic band... or, erm, spaghetti?

On touch devices, draw strings with two fingers and strum with one

## Usage

If Spaghetti Audio is exactly what you've been searching for, you too can enjoy the sonic taste of spaghetti sound waves by following these steps:

1. Install via npm or yarn

   ```bash
   npm i spaghetti-audio
   ```

2. Create some spaghetti

   ```javascript
   import SpaghettiAudio from 'spaghetti-audio'

   const spaghettiAudio = new SpaghettiAudio()

   // All the spaghetti goodness is rendered to a canvas element, so append that to the DOM
   document.body.appendChild(spaghettiAudio.canvas)
   ```

3. To properly clean up Spaghetti Audio (e.g. when navigating to another page in a SPA) call the `destroy` method. This removes event listeners and cancels animation frame requests.

   ```javascript
   spaghettiAudio.destroy()
   ```

### Appending to a wrapper

Rather than sticking the spaghetti canvas straight in the `<body>` and taking up the full window width, you can attach it to another element. This example attaches the spaghetti canvas to a wrapper with id `"spaghetti-wrapper"`.

```javascript
import SpaghettiAudio from 'spaghetti-audio'

const wrapper = document.querySelector('#spaghetti-wrapper')
const spaghettiAudio = new SpaghettiAudio({ wrapper })

wrapper.appendChild(spaghettiAudio.canvas)
```

### Usage with React

Spaghetti Audio is UI framework agnostic and the mounting process is similar for React, Vue.js and other frameworks. You can think of Spaghetti Audio more like a game with a render loop rather than a reactive component. This means we need to instantiate it, attach it to a component and destroy it when that component unmounts. Here's how that looks in React:

```jsx
function SpaghettiAudioWrapper() {
  const wrapperRef = useRef()

  useEffect(() => {
    const spaghettiAudio = new SpaghettiAudio({ wrapper: wrapperRef.current })

    wrapperRef.current.appendChild(spaghettiAudio.canvas)

    return () => spaghettiAudio.destroy()
  }, [])

  return <div className="spaghetti-wrapper" ref={wrapperRef} />
}
```

### Local development

1. Clone this repo and `cd spaghetti-audio`
2. Install dependencies with npm or yarn

   ```bash
   npm i
   ```

3. Spin up the dev server

   ```bash
   npm run start
   ```

4. The dev server is now running at http://localhost:8080

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
