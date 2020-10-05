import SpaghettiAudio from '@modules/spaghetti-audio'

const spaghettiAudio = new SpaghettiAudio({
  withLocalStorage: true,
  withClearButton: true,
  spaghettiWidth: 10,
  debug: true,
})

document.body.appendChild(spaghettiAudio.canvas)
document.body.appendChild(spaghettiAudio.ui)
