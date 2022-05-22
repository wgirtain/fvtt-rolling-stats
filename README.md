# Rolling Stats
Foundry VTT module that keeps track of rolls.  Stats can be printed out on demand.

The idea for this module came to me when my group jokingly said that I was influencing their rolls during a game.  I decided to implement this module to track our rolls so that we can settle the dispute once and for all.

This module currently relies on the chat history to gather the roll data.  Clearing the chat history will also clear the data used for these calculations the next time the user logs in.  Rolls are tracked locally so they may vary between the GM and the players if the players cannot see the GM rolls.

![All Players](https://github.com/wgirtain/rolling-stats/images/dialog_all.png?raw=true)
![Gamemaster](https://github.com/wgirtain/rolling-stats/images/dialog_gamemaster.png?raw=true)

![Player 2](https://github.com/wgirtain/rolling-stats/images/dialog_player2.png?raw=true)
![Player 3](https://github.com/wgirtain/rolling-stats/images/dialog_player3.png?raw=true)
![Player 4](https://github.com/wgirtain/rolling-stats/images/dialog_player4.png?raw=true)

## Viewing the Roll Stats
![Rolling Stats Button](https://github.com/wgirtain/rolling-stats/images/rolling_stats_button.png?raw=true)

The stats can be viewed by simply clicking the new button to the right of the Foundry logo in the top left corner of the screen.  Alternatively, one of the below commands may be used to launch the same popup window.

## Commands
```
/rollstats [username]
```
Displays a popup window with roll stats for all users.  Just select a username at the top to switch to that user's roll stats.  Providing a username to this command will open the popup window to that user directly.  Please note that this is currently case-sensitive.

Additionally, a convenience username "me" is provided.  Providing "me" (without quotes) to this command will open the popup to the currently logged in user.  Please note that this is currently the default functionality.

```
/rs [username]
```
Alias for `/rollstats [username]`.

## Known Issues
1. Inline rolls are not stored and therefore not included in the calculation

## To Do
1. Add inline rolls
2. Persist data even if chat is deleted
3. Look into chat command arguments, such as only displaying certain dice values, or omitting dice
4. Make `username` command arg case insensitive

