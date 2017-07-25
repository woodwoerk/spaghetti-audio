import scales from './Scales.json';

const baseNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

export const getNotes = (key, scale) => {
  const keyIndex = baseNotes.indexOf(key);
  const notes = baseNotes.slice(keyIndex, baseNotes.length).concat(baseNotes.slice(0, keyIndex));
  console.log(scale, '---');

  return scales[scale].split(' ').map((note) => {
    if (isNaN(note)) {
      return note.split('').reduce((prev, current) => {
        if (!isNaN(prev)) {
          if (current === 'b') {
            return (notes[parseInt(prev, 10) - 2]) + current;
          } else if (current === '#') {
            return (notes[parseInt(prev, 10)]) + current;
          }
        }

        return current;
      }, '');
    }

    return notes[parseInt(note, 10) - 1];
  });
};

export const getKeyboard = (key, scale, low, high) => {
  const notes = getNotes(key, scale);
  let keyboardNotes = [];

  for (let i = low; i < high + 1; i += 1) {
    keyboardNotes = keyboardNotes.concat(notes.map(note => note + i));
  }

  return keyboardNotes;
};
