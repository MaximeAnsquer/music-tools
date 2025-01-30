import { ScaleOrChord } from "./ScaleOrChord.ts";
import { getProbability, getRandomElementWithWeight, listsAreEqual, speak } from "./utils.js";
const chords = [
    new ScaleOrChord("Do", ["C", "E", "B"]),
    new ScaleOrChord("Fa", ["F", "A", "E"]),
    new ScaleOrChord("Si bémol", ["A#", "D", "A"]),
    new ScaleOrChord("Mi Bémol", ["D#", "G", "D"]),
    new ScaleOrChord("La bémol", ["G#", "C", "G"]),
    new ScaleOrChord("Ré bémol", ["C#", "F", "C"]),
    new ScaleOrChord("Sol bémol", ["F#", "A#", "F"]),
    new ScaleOrChord("Si", ["B", "D#", "A#"]),
    new ScaleOrChord("Mi", ["E", "G#", "D#"]),
    new ScaleOrChord("Ré", ["D", "F#", "C#"]),
    new ScaleOrChord("Sol", ["G", "B", "F#"]),
    new ScaleOrChord("La", ["A", "C#", "G#"])
];
const activeNotes = new Map();
let chordToFind;
let startTime;
function askChord() {
    chordToFind = getRandomElementWithWeight(chords.filter(c => c !== chordToFind));
    document.getElementById("note").innerText = chordToFind.tonic;
    const utterance = new SpeechSynthesisUtterance(chordToFind.tonic);
    utterance.lang = "fr-FR";
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
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
    }
    catch (error) {
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
        }
        else {
            handleNoteOff(note);
        }
    }
    else if (status >= 128 && status < 144) { // Note Off messages
        handleNoteOff(note);
    }
}
function handleNoteOff(note) {
    if (activeNotes.has(note)) {
        activeNotes.delete(note);
        updateActiveNotes();
    }
}
function isFinished() {
    return chords.every(chord => chord.averageTime < 2.3)
        && chords.map(c => c.occurrences).reduce((a, b) => a + b, 0) > 70;
}
function handleCorrectScale() {
    let duration = (new Date().getTime() - startTime) / 1000;
    if (chordToFind.occurrences == 0) {
        chordToFind.averageTime = 0;
    }
    chordToFind.averageTime = (chordToFind.occurrences * chordToFind.averageTime + duration) / (chordToFind.occurrences + 1);
    chordToFind.occurrences++;
    log(chord => chord.averageTime);
    if (isFinished()) {
        speak("Bravo c'est terminado pour cet exo");
        log(chord => chord.occurrences);
    }
    else {
        setTimeout(askChord, 200);
    }
}
function log(sortBy) {
    chords.sort((a, b) => sortBy(b) - sortBy(a));
    let logsTbody = document.getElementById('logsTbody');
    logsTbody.innerHTML = "";
    for (const chord of chords) {
        let tr = document.createElement("tr");
        logsTbody.appendChild(tr);
        let noteElement = document.createElement("th");
        noteElement.innerText = chord.tonic;
        tr.appendChild(noteElement);
        let averageElement = document.createElement("td");
        averageElement.innerText = chord.averageTime.toFixed(2);
        tr.appendChild(averageElement);
        let occurrencesElement = document.createElement("td");
        occurrencesElement.innerText = "" + chord.occurrences;
        tr.appendChild(occurrencesElement);
        let probabilityElement = document.createElement("td");
        probabilityElement.innerText = getProbability(chord, chords) + "%";
        tr.appendChild(probabilityElement);
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
function getNoteName(note) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteIndex = note % 12;
    return `${noteNames[noteIndex]}`;
}
window.addEventListener('load', initMIDI);
