export default class PromiseTracker {
  total: number;
  finished: number;

  constructor() {
    this.total = 0;
    this.finished = 0;
  }

  get ready() {
    return this.finished == this.total;
  }

  add<T>(p: Promise<T>) {
    this.total++;
    p.then(() => this.finished++);

    return p;
  }
}
