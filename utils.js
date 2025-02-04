export function getRandomElementWithWeight(elements) {
    // Calculate the total weight of all elements
    const totalWeight = elements.reduce((sum, element) => sum + element.getWeight(), 0);
    // Generate a random number between 0 and totalWeight
    let randomValue = Math.random() * totalWeight;
    // Iterate through the list and subtract the weight of each element
    // until the random value is less than the remaining weight
    for (let element of elements) {
        randomValue -= element.getWeight();
        if (randomValue <= 0) {
            return element;
        }
    }
}
export function getProbability(element, elements) {
    const totalWeight = elements.reduce((sum, element) => sum + element.getWeight(), 0);
    return (element.getWeight() / totalWeight * 100).toFixed(0);
}
export function listsAreEqual(list1, list2) {
    if (list1.length !== list2.length) {
        return false; // Si les longueurs diffèrent, les listes ne peuvent pas être égales
    }
    // Crée des copies triées des listes pour comparaison
    const sortedList1 = [...list1].sort();
    const sortedList2 = [...list2].sort();
    console.log('sortedList1', sortedList1);
    console.log('sortedList2', sortedList2);
    // Compare les éléments des listes triées
    return sortedList1.every((value, index) => value === sortedList2[index]);
}
export function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.volume = 0.6;
    utterance.rate = 1.5;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
}
export function updateTable(scaleOrChords, sortBy) {
    scaleOrChords.sort((a, b) => sortBy(b) - sortBy(a));
    let logsTbody = document.getElementById('logsTbody');
    logsTbody.innerHTML = "";
    for (const scaleOrChord of scaleOrChords) {
        let tr = document.createElement("tr");
        logsTbody.appendChild(tr);
        let noteElement = document.createElement("th");
        noteElement.innerText = scaleOrChord.name;
        tr.appendChild(noteElement);
        let averageElement = document.createElement("td");
        averageElement.innerText = scaleOrChord.averageTime.toFixed(2);
        tr.appendChild(averageElement);
        let occurrencesElement = document.createElement("td");
        occurrencesElement.innerText = "" + scaleOrChord.occurrences;
        tr.appendChild(occurrencesElement);
        let probabilityElement = document.createElement("td");
        probabilityElement.innerText = getProbability(scaleOrChord, scaleOrChords) + "%";
        tr.appendChild(probabilityElement);
    }
}
export function updateOccurrencesAndAverageTime(scaleOrChord, duration) {
    if (scaleOrChord.occurrences == 0) {
        scaleOrChord.averageTime = 0;
    }
    scaleOrChord.averageTime = (scaleOrChord.occurrences * scaleOrChord.averageTime + duration) / (scaleOrChord.occurrences + 1);
    scaleOrChord.occurrences++;
}
export function getNoteName(note) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteIndex = note % 12;
    return `${noteNames[noteIndex]}`;
}
