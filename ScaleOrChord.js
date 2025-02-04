export class ScaleOrChord {
    constructor(name, notes) {
        this.name = name;
        this.notes = notes;
        this.averageTime = 100;
        this.occurrences = 0;
    }
    getWeight() {
        return Math.max(1, Math.pow(this.averageTime - 1, 3.5));
    }
}
