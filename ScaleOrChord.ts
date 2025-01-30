import {Weighable} from "./weighable.js";

export class ScaleOrChord implements Weighable {

    public averageTime = 100;
    public occurrences = 0;

    constructor(public name: string, public notes: Array<string>) {
    }

    getWeight(): number {
        return Math.max(1, Math.pow(this.averageTime, 3.5));
    }
}