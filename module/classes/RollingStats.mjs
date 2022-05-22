

export class RollingStats {
    static MODULE_ID = 'rolling-stats';
    static MODULE_ABBREV = 'rollstats';

    /** The dictionary of all available templates */
    static TEMPLATES = {
        dialog: 'dialog.html',
        dialogContent: 'dialog_user_stats.html',
    }

    /** Represents all players combined stats */
    static ALL = 'All';

    static {
        // Prepend the full templates path to each template
        Object.keys(RollingStats.TEMPLATES).forEach(
            (k) => RollingStats.TEMPLATES[k] = `modules/${RollingStats.MODULE_ID}/templates/${RollingStats.TEMPLATES[k]}`);
    }

    /**
     * Convenience method for localizing a resource.
     * @param {String} path The path to the localization resource, omitting the module
     *      abbreviation and the following dot.
     */
    static localize(path) {
        return game.i18n.localize(`${RollingStats.MODULE_ABBREV}.${path}`)
    }
}