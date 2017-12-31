// helpers outside of components

export function totals(rounds) {
    return rounds.reduce((m, round) => {
        for (let player in round) {
            m[player] = (m[player] || 0) + round[player];
        }

        return m;
    }, {});
}

export function useLocalStorage(store, key) {
    const json = localStorage.getItem(key);
    if (json) {
        store.set(JSON.parse(json));
    }

    store.onchange(state => {
        localStorage.setItem(key, JSON.stringify(state));
    });
}