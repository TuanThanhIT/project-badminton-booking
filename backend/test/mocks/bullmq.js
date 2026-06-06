export class Queue {
  async add() {
    return { id: "test-job" };
  }

  async close() {}
}

export class Worker {
  async close() {}
}
