const reply = require("../util/message");

module.exports = (instance, client) => {
   // Loop through all found channels
   for (const [_, channel] of client.channels.cache) {
      // Don't check non Text Channels
      if (channel.type !== 0) {
         continue;
      }

      // Check for all the channel's messages
      channel.messages.fetch().then((result) => {
         for (const [_, message] of result) {
            // Do not check for users
            if (!message.author.bot) {
               continue;
            }

            // If the message is the main embed
            if (message.embeds[0]?.data.author?.name === "Age of Empires III Definitive Edition") {
               // Check if there is a change
               if (message.embeds[0].data.description !== reply.embeds[0].data.description) {
                  // Update the message to the required
                  message.edit(reply).catch(() => null);
               }

               if (message.components !== reply.components) {
                  // Update the message to the required
                  message.edit(reply).catch(() => null);
               }
            }
         }
      });
   }
};
