const store = new Map();

export default class RedisMock {
  async get(key) {
    return store.get(key) ?? null;
  }

  async set(key, value) {
    store.set(key, value);
    return "OK";
  }

  async del(key) {
    return store.delete(key) ? 1 : 0;
  }

  async sismember() {
    return 0;
  }

  disconnect() {
    store.clear();
  }
}
