import {getNoteName, getRandomElementWithWeight, speak, updateOccurrencesAndAverageTime, updateTable} from "../utils.js";
import {ScaleOrChord} from "../ScaleOrChord.js";

const scales = [
    new ScaleOrChord("Do", ["C", "D", "E", "F", "G", "A", "B"]),
    new ScaleOrChord("Fa", ["F", "G", "A", "A#", "C", "D", "E"]),
    new ScaleOrChord("Si bémol", ["A#", "C", "D", "D#", "F", "G", "A"]),
    new ScaleOrChord("Mi bémol", ["D#", "F", "G", "G#", "A#", "C", "D"]),
    new ScaleOrChord("Do dièse", ["C#", "D#", "F", "F#", "G#", "A#", "C"]),
    new ScaleOrChord("Ré bémol", ["C#", "D#", "F", "F#", "G#", "A#", "C"]),
    new ScaleOrChord("Ré", ["D", "E", "F#", "G", "A", "B", "C#"]),
    new ScaleOrChord("Ré dièse", ["D#", "F", "G", "G#", "A#", "C", "D"]),
    new ScaleOrChord("Mi", ["E", "F#", "G#", "A", "B", "C#", "D#"]),
    new ScaleOrChord("Fa dièse", ["F#", "G#", "A#", "B", "C#", "D#", "F"]),
    new ScaleOrChord("Sol bémol", ["F#", "G#", "A#", "B", "C#", "D#", "F"]),
    new ScaleOrChord("Sol", ["G", "A", "B", "C", "D", "E", "F#"]),
    new ScaleOrChord("Sol dièse", ["G#", "A#", "C", "C#", "D#", "F", "G"]),
    // new ScaleOrChord("La bémol", ["G#", "A#", "C", "C#", "D#", "F", "G"]),
    // new ScaleOrChord("La", ["A", "B", "C#", "D", "E", "F#", "G#"]),
    // new ScaleOrChord("La dièse", ["A#", "C", "D", "D#", "F", "G", "A"]),
    // new ScaleOrChord("Si", ["B", "C#", "D#", "E", "F#", "G#", "A#"])
];

const OCTAVES_TO_FIND = 2;
const MAXIMUM_AVERAGE_TIME = 12;
const ASK_DELAY_MS = 100;

let scaleToFind: ScaleOrChord;
let noteToFindIndex = 0;
let tonicFoundCount = 0;
let startTime: number;
let backward = false;

function askScale() {
    scaleToFind = <ScaleOrChord>getRandomElementWithWeight(scales);
    document.getElementById("note").innerText = scaleToFind.name;
    speak(scaleToFind.name);
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
            input.onmidimessage = handleMIDIMessage;
        });

        document.getElementById('output').innerText = 'MIDI device connected. Start playing!';
        askScale();
    } catch (error) {
        document.getElementById('output').innerText = 'Failed to access MIDI devices.';
        console.error('MIDI initialization error:', error);
    }
}

function handleCorrectNoteForward() {
    if (new Date().getTime() - startTime > 60000) {
        startTime = new Date().getTime();
    }
    if (tonicFoundCount === OCTAVES_TO_FIND + 1) {
        noteToFindIndex = scaleToFind.notes.length - 1;
        backward = true;
    } else {
        noteToFindIndex = (noteToFindIndex + 1) % scaleToFind.notes.length;
    }
}

function handleScaleFinished() {
    backward = false;
    tonicFoundCount = 0;
    let duration = (new Date().getTime() - startTime) / 1000;
    updateOccurrencesAndAverageTime(scaleToFind, duration);
    updateTable(scales, scaleOrChord => scaleOrChord.occurrences);
    if (isFinished()) {
        speak("Bravo c'est terminado pour cet exo");
        updateTable(scales, scale => scale.occurrences);
    } else {
        setTimeout(askScale, ASK_DELAY_MS);
    }
}

function isFinished(): boolean {
    return false;
}
//     return scales.every(s => s.averageTime < MAXIMUM_AVERAGE_TIME)
//         && scales.map(s => s.occurrences).reduce((a, b) => a + b, 0) > 40;
// }

function handleCorrectNoteBackward() {
    if (tonicFoundCount === OCTAVES_TO_FIND + 3) {
        handleScaleFinished();
    } else {
        noteToFindIndex = noteToFindIndex - 1;
        if (noteToFindIndex == -1) {
            noteToFindIndex = scaleToFind.notes.length - 1;
        }
    }
}

function handleCorrectNote(noteName: string) {
    if (noteName === scaleToFind.notes[0]) {
        tonicFoundCount++;
        console.log(tonicFoundCount)
    }
    if (!backward) {
        handleCorrectNoteForward();
    } else {
        handleCorrectNoteBackward();
    }
}

function handleBadNote(noteToFind: string, noteName: string) {
    console.log(`Attendu ${noteToFind}, reçu ${noteName}`);
    speak("Non");
    backward = false;
    noteToFindIndex = 0;
    tonicFoundCount = 0;
}

function handleMIDIMessage(event: MIDIMessageEvent) {
    const [status, note, velocity] = event.data;

    if (status >= 144 && status < 160) { // Note On messages
        if (velocity > 0) {
            const noteName = getNoteName(note);
            let noteToFind = scaleToFind.notes[noteToFindIndex];
            if (noteName === noteToFind) {
                handleCorrectNote(noteName);
            } else {
                handleBadNote(noteToFind, noteName);
            }
        }
    }
}

async function init() {
    await initMIDI();
}

window.addEventListener('load', init);