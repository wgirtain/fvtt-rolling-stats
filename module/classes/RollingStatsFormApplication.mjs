import { RollingStats } from './RollingStats.mjs';

export class RollingStatsFormApplication extends FormApplication {
    /**
     * @param data The input data for the template.  Expected in the following format:
     *  [ { name: "username1", content: {html content} }, {...} ]
     */
    constructor(data, options) {
        super(data, options);
    }

    static get defaultOptions() {
        return {
            ...super.defaultOptions,
            classes: ['rolling-stats'],
            height: 'auto',
            tabs: [
                {
                    navSelector: '.tabs',
                    contentSelector: '.rs-content',
                    initial: RollingStats.ALL,
                },
            ],
            title: RollingStats.localize('statsDialog.formTitle'),
            width: 'auto',
        };
    }

    getData(options = {}) {
        return super.getData().object;
    }

    get template() {
        return RollingStats.TEMPLATES.dialog;
    }
}