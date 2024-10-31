/** @odoo-module */

import { registry } from "@web/core/registry";
import { ClickerModel } from "./clicker_model";
import { browser } from "@web/core/browser/browser";
import { migrate } from "./clicker_migration";

const clickerService = {
  dependencies: ["effect", "notification", "action"],
  async start(env, services) {
    let clickerModel;

    const localState = migrate(JSON.parse(browser.localStorage.getItem("clickerState")));
    if (localState) {
      clickerModel = ClickerModel.fromJSON(localState, services);
    } else {
      clickerModel = new ClickerModel(services);
    }

    function saveStatetoLocalStorage(clickerModel) {
      browser.localStorage.setItem("clickerState", JSON.stringify(clickerModel));
    }

    setInterval(async () => {
      const updateState = JSON.parse(await browser.localStorage.getItem("clickerState"));
      if (updateState) {
        Object.assign(clickerModel, updateState);
      }
    }, 1000);

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
