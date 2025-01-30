const notes = ["Do", "Ré bémol", "Ré", "Mi bémol", "Mi", "Fa", "Sol bémol", "Sol", "La bémol"];
const weights = [0.5, 1, 1, 1, 1, 1, 1, 2, 3];
let lastNote = null;
function weightedRandomChoice(weights) {
    const cumulativeWeights = weights.map((sum => value => sum += value)(0));
    console.log('cumulativeWeights', cumulativeWeights);
    const random = Math.random() * cumulativeWeights[cumulativeWeights.length - 1];
    return cumulativeWeights.findIndex(weight => random < weight);
}
function speak(note) {
    const utterance = new SpeechSynthesisUtterance(note);
    utterance.lang = "fr-FR";
    speechSynthesis.speak(utterance);
}
function announceRandomNote() {
    let randomIndex;
    do {
        randomIndex = weightedRandomChoice(weights);
    } while (notes[randomIndex] === lastNote);
    lastNote = notes[randomIndex];
    document.getElementById("status").textContent = `Announcing: ${notes[randomIndex]}`;
    speak(notes[randomIndex]);
}
announceRandomNote();
setInterval(announceRandomNote, 12 * 1000);
