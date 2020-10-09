import SpaghettiAudio from '@modules/spaghetti-audio'

const spaghettiAudio = new SpaghettiAudio({
  withLocalStorage: true,
  withClearButton: true,
  spaghettiWidth: 10,
  hitboxSize: 60,
  viscosity: 8,
  damping: 0.1,
})

document.body.appendChild(spaghettiAudio.canvas)
document.body.appendChild(spaghettiAudio.ui)
