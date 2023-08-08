const message = require("../../../util/message");

module.exports = async (interaction, instance) => {
   if (interaction.customId !== "close-civs") {
      return;
   }

   // Enable the Create New Match button
   await message.components[0].components[0].setDisabled(false);

   // update the menu
   interaction.channel.messages.fetch().then(async (result) => {
      for (const [_, menuMessage] of result) {
         // Do not check for users
         if (!menuMessage.author.bot) {
            continue;
         }

         if (menuMessage.embeds[0]?.data.author?.name === "Age of Empires III Definitive Edition") {
            // Update the button
            menuMessage.edit({
               components: message.components,
            });
         }
      }
   });

   interaction.message.delete();
};
