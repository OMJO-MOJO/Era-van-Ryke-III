const { ActionRowBuilder, UserSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = (interaction, instance) => {
   if (interaction.customId !== "show-add-player-list") {
      return;
   }

   const addPlayers = new ActionRowBuilder().addComponents(
      new UserSelectMenuBuilder().setCustomId("add-players").setMinValues(1).setMaxValues(8).setPlaceholder("Select players to add")
   );

   const button = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("close-civs").setLabel("Close").setStyle(ButtonStyle.Danger));

   interaction.update({ components: [addPlayers, button] });
};
