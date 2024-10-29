/** @odoo-module */
import { Component, EventBus } from "@odoo/owl";
import { rewards } from "./click_rewards";
import { choose } from "./utils";

export class ClickerModel extends Component {
    constructor(services) {
        super();
        this.notification = services.notification;
        this.clicks = 0;
        this.level = 0;
        this.bus = new EventBus();
        this.receivedRewards = new Set();
        this.bots = {
            clickbot: {
                price: 1000,
                level: 1,
                increment: 10,
                purchased: 0,
            },
            bigbot: {
                price: 5000,
                level: 2,
                increment: 100,
                purchased: 0
            },
        }
        this.multiplier = 1;

        document.addEventListener("click", (e) => {
            if (!e.target.closest(".open-btn, .buy-btn")) {
                this.increment(0)
            }
        });
        setInterval(() => {
            for (const bot in this.bots) {
                this.clicks += this.bots[bot].increment * this.bots[bot].purchased * this.multiplier;
            }
        }, 10000);
    }

    buyMultiplier() {
        if (this.clicks < 50000) {
            return false;
        }
        this.clicks -= 50000;
        this.multiplier++;
    }

    increment(inc) {
        if (this._incrementLock) return;
        this._incrementLock = true;
        setTimeout(() => this._incrementLock = false, 100)

        this.clicks += inc;
        if (this.milestones[this.level] && this.clicks >= this.milestones[this.level].clicks) {
            this.bus.trigger("MILESTONE", this.milestones[this.level]);
            this.level += 1;
        }

        const reward = this.giveReward();
        if (reward) {
            this.notification.add(`You have received a reward: ${reward.description}`);
        }
    }

    buyBot(name) {
        if (!Object.keys(this.bots).includes(name)) {
            throw new Error(`Invalid bot name ${name}`);
        }
        if (this.clicks < this.bots[name].price) {
            return false;
        }

        this.clicks -= this.bots[name].price;
        this.bots[name].purchased += 1;
    }

  giveReward() {
    const availableReward = [];
    for (const reward of rewards) {
        const meetsMinLevel = reward.minLevel === undefined || reward.minLevel <= this.level;
        const meetsMaxLevel = reward.maxLevel === undefined || reward.maxLevel >= this.level;

        // Check if the player meets the required bot purchases
        const meetBotRequirements = !reward.requires || Object.entries(reward.requires).every(([bot, min]) => {
            return this.bots[bot].purchased >= min;
        });

        // Check if the player meets the required multiplier level
        const meetsMultiplierRequirement = reward.requiresMultiplier === undefined || this.multiplier >= reward.requiresMultiplier;

        //Add reward is all conditions are met and not previously received
        if (meetsMinLevel && meetsMaxLevel && meetBotRequirements && meetsMultiplierRequirement && !this.receivedRewards.has(reward.description)) {
            availableReward.push(reward);
        }
    }

    if (availableReward.length === 0) {
        return null;
    }

    const chosenReward = choose(availableReward);
    console.log(`Chosen reward: ${chosenReward.description} at level ${this.level}`);

    this.receivedRewards.add(chosenReward.description);
    chosenReward.apply(this);
    this.bus.trigger("REWARD", chosenReward);
    return chosenReward;
  }
   

    get milestones() {
        return [
            { clicks: 1000, unlock: "clickBot" },
            { clicks: 5000, unlock: "bigBot" },
            { clicks: 100000, unlock: "power multiplier"},
        ];
    }
}