const { ActionRowBuilder, UserSelectMenuBuilder } = require("discord.js");

module.exports = (interaction, instance) => {
   if (interaction.customId !== "show-remove-player-list") {
      return;
   }

   const removePlayers = new ActionRowBuilder().addComponents(
      new UserSelectMenuBuilder().setCustomId("remove-player").setMinValues(1).setMaxValues(1).setPlaceholder("Select a player to remove")
   );

   interaction.update({ components: [removePlayers] });
};
