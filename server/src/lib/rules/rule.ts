export default class Rule {
  numSets: number;
  setSize: number;
  title: string;

  constructor(numSets: number, setSize: number, title: string) {
    this.numSets = numSets;
    this.setSize = setSize;
    this.title = title;
  }
}
