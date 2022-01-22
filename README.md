# Rolling Stats
Foundry VTT module that keeps track of rolls.  Stats can be printed out on demand.

The idea for this module came to me when my group jokingly said that I was influencing their rolls during a game.  I decided to implement this module to track our rolls so that we can settle the dispute once and for all.

![Gamemaster Stats Only](https://github.com/wgirtain/rolling-stats/images/stats_all.png?raw=true)

![All Stats](https://github.com/wgirtain/rolling-stats/images/stats_gm.png?raw=true)

This module currently relies on the chat history to gather the roll data.  Clearing the chat history will also clear the data used for these calculations the next time the user logs in.  Rolls are tracked locally so they may vary between the GM and the players if the players cannot see the GM rolls.

## Commands
```
/rollstats [username]
```
Prints out the statistics for all users if username is not provided, or statistics for the given username if one is provided.

```
/rs [username]
```
Alias for `/rollstats [username]`.

## Known Issues
1. Inline rolls are not stored and therefore not included in the calculation

## To Do
1. Add inline rolls
2. Persist data even if chat is deleted
3. Allow printing of more than one specified player
4. Look into chat command arguments, such as only displaying certain dice values, or omitting dice

