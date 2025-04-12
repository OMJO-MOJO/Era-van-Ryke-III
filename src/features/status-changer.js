const { ActivityType } = require("discord.js");
const taunts = require("../util/taunts");

module.exports = (instance, client) => {
   let index = 0;
   const changeStatus = () => {
      // Get the status from the taunts
      let status = taunts[index++];
      if (!status) {
         index = 0;
         status = taunts[index++];
      }

      // Set the client's status
      try {
         client.user.setActivity(status.message, { type: ActivityType.Custom });
      } catch {}
   };

   changeStatus();
   setInterval(() => {
      changeStatus();
   }, 10 * 1000); // Every 1 minute
};
