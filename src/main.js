import App from './App.html';
import { Store } from 'svelte/store.js';
import { totals, useLocalStorage } from './helpers.js';

const store = new Store({
	players: [],
    rounds: [],
    started: false
});

window.store = store;

// save data to localStorage every time our state changes
useLocalStorage(store, 'scorekeeper');

const app = new App({
	target: document.body,
	store
});

export default app;