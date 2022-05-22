import { RollingStats } from './module/classes/RollingStats.mjs';
import { RollingStatsFormApplication } from './module/classes/RollingStatsFormApplication.mjs';
import { Stats } from './module/classes/Stats.mjs';

// Stats Object
var stat = new Stats();

/**
 * Processes the stats for all users and displays the Rolling Stats dialog.
 * If the optional selected user parameter was provided, that user's tab will be selected,
 * and their stats will be displayed once the dialog is rendered.
 * 
 * @param {String} selectedUser The user whose tab to display
 */
async function displayRollingStatsDialog(selectedUser) {
    // If user was provided, display stats for that user
    if (!selectedUser || selectedUser.toLowerCase() === "me") {
        selectedUser = game.user.name;
    } else if (selectedUser) {
        if (!(selectedUser in stat.getPlayers())) {
            ui.notifications.error(
                RollingStats.localize('errors.invalidUsername') +
                `: ${selectedUser}<br>` +
                RollingStats.localize('errors.validUsernames') +
                `: ${stat.getPlayers().join(', ')}`);
            return;
        }
    }

    // var players = Object.keys(stats);
    var players = stat.getPlayers();
    var promises = [];
    players.forEach((name) => {
        promises.push(
            renderTemplate(RollingStats.TEMPLATES.dialogContent, stat.getRollStats(name)));
    });

    const renderedTables = await Promise.all(promises);

    var data = { tabs: [] };
    players.forEach((name, i) => {
        data.tabs.push({
            name: name,
            content: renderedTables[i]
        });
    });

    const form = new RollingStatsFormApplication(data, {});
    const res = await form.render(true);

    // Select the requested user's tab
    if (selectedUser) {
        res._tabs[0].active = selectedUser;
    }
}

/*
 * Hooks
 */

Hooks.once('init', function () {
    $('#logo').after(`<button type='button' id="rolling-stats-button"></button>`);
    $('#rolling-stats-button').on('click', () => {
        displayRollingStatsDialog();
    });
});

Hooks.on("ready", function () {
    // Initialize Stats object
    stat.init();

    // Load templates
    loadTemplates(Object.values(RollingStats.TEMPLATES));

    // Process existing rolls from the chat history
    game.data.messages.forEach(function (m) {
        if (m.roll) {
            stat.processRoll(game.users.get(m.user), Roll.fromJSON(m.roll));
        }
    });

    // Ready to process future chat commands
    Hooks.on("renderChatMessage", function (chatMessage, fnInit, data) {
        var roll = chatMessage.isRoll ? chatMessage._roll : null;
        if (roll) {
            stat.processRoll(data.author, roll);
        }
    });
});

Hooks.on("chatCommandsReady", function (chatCommands) {
    // rollstats command
    var data = {
        commandKey: "/rollstats",
        shouldDisplayToChat: false,
        iconClass: "calculator",
        description:
            RollingStats.localize('command.rollstats.description'),
        invokeOnCommand: (chatlog, messageText, chatdata) => {
            displayRollingStatsDialog(messageText);
        }
    };

    chatCommands.registerCommand(chatCommands.createCommandFromData(data));

    // rs command, alias for rollstats command
    data["commandKey"] = "/rs";
    chatCommands.registerCommand(chatCommands.createCommandFromData(data));
});

