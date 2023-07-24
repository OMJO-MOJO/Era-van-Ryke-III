const { ActionRowBuilder, UserSelectMenuBuilder } = require("discord.js");

module.exports = (interaction, instance) => {
   if (interaction.customId !== "show-add-player-list") {
      return;
   }

   const addPlayers = new ActionRowBuilder().addComponents(
      new UserSelectMenuBuilder().setCustomId("add-players").setMinValues(1).setMaxValues(8).setPlaceholder("Select players to add")
   );

   interaction.update({ components: [addPlayers] });
};
