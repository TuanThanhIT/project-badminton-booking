import type { AppStore } from "./store";

let storeRef: AppStore;

export const setStore = (store: AppStore) => {
  storeRef = store;
};

export const getStore = () => storeRef;
