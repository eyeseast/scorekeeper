import App from './App.html';
import { Store } from 'svelte/store.js';
import useLocalStorage from './useLocalStorage.js';

const store = new Store({
	players: [],
    round: 0
});

window.store = store;

// save data to localStorage every time our state changes
useLocalStorage(store, 'scorekeeper');

const app = new App({
	target: document.body,
	store
});

export default app;