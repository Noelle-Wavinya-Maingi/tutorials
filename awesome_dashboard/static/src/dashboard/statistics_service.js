/** @odoo-module */

import { reactive } from "@odoo/owl";
import { registry } from "@web/core/registry";

// registering awesome_dashboard.statistics as a service which provides loadStatistics as performs the rpc and used memoize to allow for caching
const  statisticsService = {
    dependencies: ['rpc']
    ,
    start(env, { rpc }) {
        const statistics = reactive({ isReady: false });

        async function loadData() {
            const updates = await rpc("/awesome_dashboard/statistics");
            Object.assign(statistics, updates, { isReady: true });
        }

        setInterval(loadData, 10*60*1000);
        loadData();

        return statistics;
    },
};

registry.category("services").add("awesome_dashboard.statistics", statisticsService);