import {ScaleOrChord} from "../ScaleOrChord.js";
import {getNoteName, getRandomElementWithWeight, listsAreEqual, speak, updateOccurrencesAndAverageTime, updateTable} from "../utils.js";

const chords: Array<ScaleOrChord> = [
    new ScaleOrChord("Ré mineur 7", ["D", "F", "A", "C"]),
    new ScaleOrChord("Sol 7", ["G", "B", "D", "F"]),
    new ScaleOrChord("Do majeur 7", ["C", "E", "G", "B"]),

    new ScaleOrChord("Mi mineur 7", ["E", "G", "B", "D"]),
    new ScaleOrChord("La 7", ["A", "C#", "E", "G"]),
    new ScaleOrChord("Ré majeur 7", ["D", "F#", "A", "C#"]),

    new ScaleOrChord("Mi mineur 7", ["E", "G", "B", "D"]),
    new ScaleOrChord("La 7", ["A", "C#", "E", "G"]),
    new ScaleOrChord("Ré majeur 7", ["D", "F#", "A", "C#"]),

    new ScaleOrChord("Fa dièse mineur 7", ["F#", "A", "C#", "E"]),
    new ScaleOrChord("Si 7", ["B", "D#", "F#", "A"]),
    new ScaleOrChord("Mi majeur 7", ["E", "G#", "B", "D#"]),

    new ScaleOrChord("Sol mineur 7", ["G", "A#", "D", "F"]),
    new ScaleOrChord("Do 7", ["C", "E", "G", "A#"]),
    new ScaleOrChord("Fa majeur 7", ["F", "A", "C", "E"]),

    new ScaleOrChord("La mineur 7", ["A", "C", "E", "G"]),
    new ScaleOrChord("Ré 7", ["D", "F#", "A", "C"]),
    // new ScaleOrChord("Sol majeur 7", ["G", "B", "D", "F#"]),

    // new ScaleOrChord("La bémol", ["G#", "C", "G"]),
    // new ScaleOrChord("Ré bémol", ["C#", "F", "C"]),
    // new ScaleOrChord("Sol bémol", ["F#", "A#", "F"]),
    // new ScaleOrChord("Si", ["B", "D#", "A#"]),
    // new ScaleOrChord("Mi", ["E", "G#", "D#"]),
    // new ScaleOrChord("Ré", ["D", "F#", "C#"]),
    // new ScaleOrChord("Sol", ["G", "B", "F#"]),
    // new ScaleOrChord("La", ["A", "C#", "G#"])
];

const activeNotes = new Map();

let chordToFind: ScaleOrChord;
let startTime: number;

const MINIMUM_OCCURRENCES_TO_FINISH = 100;

function askChord() {
    chordToFind = <ScaleOrChord>getRandomElementWithWeight(chords.filter(c => c !== chordToFind));
    document.getElementById("note").innerText = chordToFind.name;
    speak(chordToFind.name);
    startTime = new Date().getTime();
}

async function initMIDI() {
    if (!navigator.requestMIDIAccess) {
        document.getElementById('output').innerText = 'Web MIDI API not supported in this browser.';
        return;
    }

    try {
        const midiAccess = await navigator.requestMIDIAccess();
        const inputs = midiAccess.inputs;

        if (inputs.size === 0) {
            document.getElementById('output').innerText = 'No MIDI devices found.';
            return;
        }

        inputs.forEach(input => {
            console.log(input);
            input.onmidimessage = handleMIDIMessage;
        });

        document.getElementById('output').innerText = 'MIDI device connected. Start playing!';
        askChord();
    } catch (error) {
        document.getElementById('output').innerText = 'Failed to access MIDI devices.';
        console.error('MIDI initialization error:', error);
    }
}

function handleMIDIMessage(event) {
    const [status, note, velocity] = event.data;

    if (status >= 144 && status < 160) { // Note On messages
        if (velocity > 0) {
            const noteName = getNoteName(note);
            if (!activeNotes.has(note)) {
                activeNotes.set(note, noteName);
                updateActiveNotes();
            }
        } else {
            handleNoteOff(note);
        }
    } else if (status >= 128 && status < 144) { // Note Off messages
        handleNoteOff(note);
    }
}

function handleNoteOff(note) {
    if (activeNotes.has(note)) {
        activeNotes.delete(note);
        updateActiveNotes();
    }
}

function isFinished(): boolean {
    return chords.every(chord => chord.averageTime < 3)
        && chords.map(c => c.occurrences).reduce((a, b) => a + b, 0) > MINIMUM_OCCURRENCES_TO_FINISH;
}

function handleCorrectScale() {
    let duration = (new Date().getTime() - startTime) / 1000;
    if (duration > 20) {
        setTimeout(askChord, 200);
        return;
    }
    updateOccurrencesAndAverageTime(chordToFind, duration);
    updateTable(chords, chord => chord.averageTime);
    if (isFinished()) {
        speak("Bravo c'est terminado pour cet exo");
        updateTable(chords, chord => chord.occurrences);
    } else {
        setTimeout(askChord, 200);
    }
}

function updateActiveNotes() {
    const notesContainer = document.getElementById('notes');
    notesContainer.innerHTML = '';

    activeNotes.forEach(noteName => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note-item';
        noteElement.innerText = noteName;
        notesContainer.appendChild(noteElement);
    });

    if (listsAreEqual(Array.from(activeNotes.values()), chordToFind.notes)) {
        handleCorrectScale();
    }
}

window.addEventListener('load', initMIDI);