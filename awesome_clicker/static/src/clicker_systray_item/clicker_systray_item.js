/** @odoo-module */

import { registry } from "@web/core/registry";
import { Component } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { useClicker } from "../clicker_hook";
import { ClickerValue } from "../clicker_value/clicker_value";

  export class ClickerSystray extends Component {
    static template = "awesome_clicker.ClickerSystray";
    static props = {};
    static components = { ClickerValue };

    setup() {
        this.notification = useService("notification");
        this.action = useService("action");
        this.clicker = useClicker();
    }

    openClientAction() {
        this.action.doAction({
            type: "ir.actions.client",
            tag: "awesome_clicker.client_action",
            target: "new",
            name: "Clicker Game",
        });
    }
  }

  export const systrayItem = {
    Component: ClickerSystray,
  };

  registry.category("systray").add("awesome_clicker ClickerStray", systrayItem, { sequence: 1000 });