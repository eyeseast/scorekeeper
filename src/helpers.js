// helpers outside of components

export function totals(rounds) {
    return rounds.reduce((m, round) => {
        for (let player in round) {
            m[player] = (m[player] || 0) + round[player];
        }

        return m;
    }, {});
}