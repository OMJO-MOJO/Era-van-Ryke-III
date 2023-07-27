const reply = require("../util/message");

module.exports = (instance, client) => {
   client.on("messageCreate", (message) => {
      if (message.content === `<@${client.user.id}>`) {
         message.delete().catch(() => null);
         message.channel.send(reply);
      }
   });
};
