/** @odoo-module */

import { useClicker } from "../clicker_hook";
import { patch } from "@web/core/utils/patch";
import { FormController } from "@web/views/form/form_controller";

const FormControllerPatch = {
    setup() {
        super.setup(...arguments);
        const clicker = useClicker();

        if (Math.random() > 0.01) {
            clicker.giveReward();
        }
    },
};

patch(FormController.prototype, FormControllerPatch);