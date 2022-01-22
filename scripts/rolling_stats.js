// Keep track of rolls based on who performed the roll
// stats[username][die.sides] = [1, 2, 3, ...]
let stats = {};

/**
 * Processes the given roll and adds it to the user's stats
 * @param {User} user The user object.  The roll will be added to this user's stats
 * @param {Roll} roll The roll to process
 */
function processRoll(user, roll) {
    roll.terms.forEach(function(die) {
        if(die instanceof Die) {
            die.results.forEach(function(result) {
                if(!(die.faces in stats[user.name])) {
                    stats[user.name][die.faces] = {};
                    for(var i=1; i<=die.faces; i++) {
                        stats[user.name][die.faces][i] = 0;
                    }
                }
                stats[user.name][die.faces][result.result]++;
            });
        }
    });
}

Hooks.on("ready", function() {
    // Init stats for each user
    game.users.forEach(u => stats[u.name] = stats[u.name] ? stats[u.name] : {});

    // Process existing rolls from the chat history
    game.data.messages.forEach(function(m){
        if(m.roll)
            processRoll(game.users.get(m.user), Roll.fromJSON(m.roll));
    });

    // Ready to process future chat commands
    Hooks.on("renderChatMessage", function(chatMessage, fnInit, data) {
        var roll = chatMessage.isRoll ? chatMessage._roll : null;
        if(roll)
            processRoll(data.author, roll);
    });
});

Hooks.on("chatCommandsReady", function(chatCommands) {
    // rollstats command
    var data = {
        commandKey: "/rollstats",
        shouldDisplayToChat: false,
        iconClass: "calculator",
        description: "Displays roll stats for all users or optionally any given user",
        invokeOnCommand: (chatlog, messageText, chatdata) => {
            // Configures and returns the HTML formatted table of roll statistics for the given user
            var getRollStatsTable = function(user){
                var results = "<h3>" + user + "</h3><table><tr><th>Die</th><th>Rolls</th>" +
                    "<th>Avg</th><th>Med</th><th>Most</th><th>Least</th></tr>";

                // Process data for each row and add it to the HTML table (results)
                for(let [die, rolls] of Object.entries(stats[user])) {
                    var totalRolls = 0, sumOfRolls = 0;
                    var mostRoll = [-1], leastRoll = [-1];
                    var mostRolls = 0, leastRolls = Number.MAX_SAFE_INTEGER;
                    
                    for([valueRolled, numberOfRolls] of Object.entries(rolls)) {
                        // Average
                        totalRolls += numberOfRolls;
                        sumOfRolls += valueRolled * numberOfRolls;

                        // Most
                        if(numberOfRolls > mostRolls) {
                            mostRoll = [valueRolled];
                            mostRolls = numberOfRolls;
                        } else if(numberOfRolls == mostRolls) {
                            mostRoll.push(valueRolled);
                        }

                        // Least
                        if(numberOfRolls < leastRolls) {
                            leastRoll = [valueRolled];
                            leastRolls = numberOfRolls;
                        } else if(numberOfRolls == leastRolls) {
                            leastRoll.push(valueRolled);
                        }
                    }

                    // Average
                    var avg = sumOfRolls / totalRolls;

                    // Median
                    var half = Math.floor(totalRolls / 2);
                    var medRollCount = 0;
                    var med;
                    // Even Number of Rolls
                    if((totalRolls % 2) == 0 && totalRolls > 0) {
                        var first = -1, second = -1;
                        for([valueRolled, numberOfRolls] of Object.entries(rolls)) {
                            medRollCount += numberOfRolls;
                            if(medRollCount >= half-1 && first == -1) {
                                first = Number(valueRolled);
                            }
                            if(medRollCount >= half) {
                                second = Number(valueRolled);
                                break;
                            }
                        }
                        med = ((first + second) / 2).toFixed(1);
                        if(med.endsWith(".0")) {
                            med = med.substring(0, med.length - 2);
                        }
                    }
                    // Odd Number of Rolls
                    else {
                        med = -1;
                        for([valueRolled, numberOfRolls] of Object.entries(rolls)) {
                            medRollCount += numberOfRolls;
                            if(medRollCount >= half) {
                                med = valueRolled;
                                break;
                            }
                        }
                    }

                    // Output Results
                    results += "<tr>" +
                        "<td>" + die + "</td>" +
                        "<td>" + totalRolls + "</td>" +
                        "<td>" + avg.toFixed(2) + "</td>" +
                        "<td>" + med + "</td>" +
                        "<td>" + mostRoll.join(", ") + " (" + mostRolls + ")</td>" +
                        "<td>" + leastRoll.join(", ") + " (" + leastRolls + ")</td>" +
                        "</tr>";
                }
                results += "</table>";
                return results;
            };

            // Common code to create the results message
            var createMessage = function(content) {
                var user = game.users.get(chatdata.user);
                let messageClass = getDocumentClass("ChatMessage");
                messageClass.create({
                    content: content,
                    speaker: {
                        alias: "Roll Stats (" + (user ? user.name : "Unknown") + ")"
                    }
                });
            }

            // If user was provided, display stats for that user
            if(messageText) {
                if(!(messageText in stats)) {
                    ui.notifications.error("Invalid username: " + messageText +
                        "<br>Valid usernames: " + Object.keys(stats).join(", "));
                    return;
                }
                createMessage(getRollStatsTable(messageText));
            }
            // Else show results for all users
            else {
                var results = "";
                Object.keys(stats).forEach(user => results += getRollStatsTable(user));
                createMessage(results);
            }
        }
    };

    chatCommands.registerCommand(chatCommands.createCommandFromData(data));

    // rs command, alias for rollstats command
    data["commandKey"] = "/rs";
    chatCommands.registerCommand(chatCommands.createCommandFromData(data));
});

