import scales from './scales.json'

type Note = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'

type Scales = typeof scales

type Scale = keyof Scales

const baseNotes: Note[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

/**
 * Get the notes of a scale letter format, e.g. 'C#', 'B' converted from the numbered scale notes in scales.json
 *
 * @param tonic   The tonic note to build the scale from
 * @param scale   The scale name
 */
const getScale = (tonic: Note, scale: Scale): string[] => {
  // Arrange notes so that the first note of the scale is the tonic
  const tonicIndex = baseNotes.indexOf(tonic)
  const notes = baseNotes
    .slice(tonicIndex, baseNotes.length)
    .concat(baseNotes.slice(0, tonicIndex))

  return scales[scale].split(' ').map((numberedNote) => {
    const numericNote = parseInt(numberedNote, 10)
    const note = notes[numericNote - 1]

    // Replace the original numbered note to keep sharp and flat annotations
    return numberedNote.replace(`${numericNote}`, note)
  })
}

/**
 * Get the notes of a keyboard in tone.js format where the trailing number represents the pitch, e.g. 'C#4', 'B4'
 *
 * @param tonic     The tonic note to build the scale from
 * @param scale     The scale name
 * @param lowPitch  The pitch to start from
 * @param highPitch The pitch to end at
 */
export const getKeyboard = (
  tonicIndex: Note = 'C',
  scale: Scale = 'major pentatonic',
  lowPitch: number = 2,
  highPitch: number = 5
): string[] => {
  let keyboardNotes: string[] = []
  const scaleNotes = getScale(tonicIndex, scale)

  for (let i = lowPitch; i < highPitch + 1; i += 1) {
    keyboardNotes = [
      ...keyboardNotes,
      ...scaleNotes.map((note) => `${note}${i}`),
    ]
  }

  return keyboardNotes
}
