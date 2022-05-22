import { RollingStats } from './RollingStats.mjs';

export class Stats {
    // stats[username][die.sides] = {1: 10, 2: 0, 3: 1, ...}
    #stats = {};

    init() {
        // Init stats for each user
        this.#stats = {};
        this.#stats[RollingStats.ALL] = {};
        game.users.forEach((u) => { this.#stats[u.name] = {} });
    }

    getPlayers() {
        return Object.keys(this.#stats);
    }

    /**
     * Updates the die roll for the given username
     * @param {String} username The username to update
     * @param {Die} die The die that was rolled
     * @param {Result} result The result of the die roll
     */
    #updateDieRollForUser(username, die, result) {
        if (!(die.faces in this.#stats[username])) {
            this.#stats[username][die.faces] = {};
            for (var i = 1; i <= die.faces; i++) {
                this.#stats[username][die.faces][i] = 0;
            }
        }
        this.#stats[username][die.faces][result.result]++;
    }

    /**
     * Processes the given roll and adds it to the user's stats
     * @param {User} user The user object.  The roll will be added to this user's stats
     * @param {Roll} roll The roll to process
     */
    processRoll(user, roll) {
        var thisStats = this;
        roll.terms.forEach(function (die) {
            if (die instanceof Die) {
                die.results.forEach(function (result) {
                    thisStats.#updateDieRollForUser(RollingStats.ALL, die, result);
                    thisStats.#updateDieRollForUser(user.name, die, result);
                });
            }
        });
    }

    /**
     * Returns an array of roll stats for the given user
     * @returns A dictionary with two keys, "headers" and "data" where the headers are the 
     *      type of data and data is the data. Currently, the headers are:
     *          Die, Total Rolls, Average, Median, Most Rolled, Least Rolled
     *      The data is a set of arrays, where each array has the same number of values as
     *      the headers.  Each position's value matches the type of the header in that same
     *      position.  So the data in position 0 is the same as the header in position 0,
     *      that is the Die number.  This is repeated for every die stored in the user's
     *      roll stats.
     */
    getRollStats(user, collapse = true) {
        const results = {
            headers: [],
            data: [],
        };

        // Headers to localize
        [
            'statsDialog.headers.die',
            'statsDialog.headers.totalRolls',
            'statsDialog.headers.average',
            'statsDialog.headers.median',
            'statsDialog.headers.mostRolled',
            'statsDialog.headers.leastRolled',
        ].forEach((h) => results.headers.push(RollingStats.localize(h)));

        // Process data for each row
        for (let [die, rolls] of Object.entries(this.#stats[user])) {
            var totalRolls = 0, sumOfRolls = 0;
            var mostRolled = [-1], leastRolled = [-1];
            var mostRolls = 0, leastRolls = Number.MAX_SAFE_INTEGER;

            for (let [valueRolled, numberOfRolls] of Object.entries(rolls)) {
                // Average
                totalRolls += numberOfRolls;
                sumOfRolls += valueRolled * numberOfRolls;

                // Most
                if (numberOfRolls > mostRolls) {
                    mostRolled = [valueRolled];
                    mostRolls = numberOfRolls;
                } else if (numberOfRolls == mostRolls) {
                    mostRolled.push(valueRolled);
                }

                // Least
                if (numberOfRolls < leastRolls) {
                    leastRolled = [valueRolled];
                    leastRolls = numberOfRolls;
                } else if (numberOfRolls == leastRolls) {
                    leastRolled.push(valueRolled);
                }
            }

            // Average
            var avg = sumOfRolls / totalRolls;

            // Median
            var half = Math.floor(totalRolls / 2);
            var medRollCount = 0;
            var med;

            // Median with Even Number of Rolls
            if ((totalRolls % 2) == 0 && totalRolls > 0) {
                var first = -1, second = -1;
                for (let [valueRolled, numberOfRolls] of Object.entries(rolls)) {
                    medRollCount += numberOfRolls;
                    if (medRollCount >= half - 1 && first == -1) {
                        first = Number(valueRolled);
                    }
                    if (medRollCount >= half) {
                        second = Number(valueRolled);
                        break;
                    }
                }
                med = ((first + second) / 2).toFixed(1);
                if (med.endsWith(".0")) {
                    med = med.substring(0, med.length - 2);
                }
            }
            // Median with Odd Number of Rolls
            else {
                med = -1;
                for (let [valueRolled, numberOfRolls] of Object.entries(rolls)) {
                    medRollCount += numberOfRolls;
                    if (medRollCount >= half) {
                        med = valueRolled;
                        break;
                    }
                }
            }

            // Collapse down least and most rolls by combining subsequent numbers
            if (collapse) {
                // Collapses all common values to a hyphenated set of values.
                // That is, if values 1, 2, 3, 4, and 5 are all the least rolled,
                // they will be condensed to the string "1-5" instead of listing
                // each value individually.
                var performCollapse = (rolls) => {
                    var collapsed = []
                    var i = 0;
                    while (i < rolls.length) {
                        var end = i + 1;
                        while (end < rolls.length &&
                            Number(rolls[end]) == Number(leastRolled[end - 1]) + 1) {
                            end++;
                        }
                        end -= 1;
                        if (end - i > 1) {
                            collapsed.push(rolls[i] + "-" + rolls[end]);
                            i = ++end;
                        } else {
                            collapsed.push(rolls[i]);
                            i++;
                        }
                    }
                    return collapsed;
                }

                leastRolled = performCollapse(leastRolled);
                mostRolled = performCollapse(mostRolled);
            }

            results["data"].push([die, totalRolls, avg.toFixed(2), med, mostRolled, leastRolled]);
        }
        return results;
    }
}