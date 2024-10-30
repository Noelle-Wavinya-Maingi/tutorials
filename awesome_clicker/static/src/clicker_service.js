/** @odoo-module */

import { registry } from "@web/core/registry";
import { ClickerModel } from "./clicker_model";
import { rewards } from "./click_rewards";

const clickerService = {
  dependencies: ["effect", "notification", "action"],
  start(env, services) {
    const clickerModel = new ClickerModel(services);
    const bus = clickerModel.bus;

    bus.addEventListener("MILESTONE", (ev) => {
      services.effect.add({
        message: `Milestone reached! You can now buy ${ev.detail.unlock}!`,
        type: "rainbow_man",
      });
    });

    bus.addEventListener("REWARD", (ev) => {
      const chosenReward = ev.detail;
      const closeNotification = services.notification.add(
        `Congrats, you won a reward: "${chosenReward.description}"`,
        {
          type: "success",
          sticky: true,
          buttons: {
            name: "Collect",
            onClick: () => {
              chosenReward.apply(clickerModel);
              closeNotification();
              services.action.doAction({
                type: "ir.actions.client",
                tag: "awesome_clicker.client_action",
                target: "new",
                name: "Clicker Game",
              });
            },
          },
        }
      );
      setTimeout(() => {
        closeNotification();
      }, 2000);
    });

    return clickerModel; 
  },
};

registry.category("services").add("awesome_clicker.clicker", clickerService);
