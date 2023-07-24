const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const PlayerManager = require("../../../features/PlayerManager");

module.exports = (interaction, instance) => {
   if (interaction.customId !== "remove-player") {
      return;
   }

   // Remove players from manager
   const playerIds = interaction.values;
   for (const id of playerIds) {
      PlayerManager.removePlayer(id);
   }

   // Generate Output for the user
   let players = "";
   for (const [userId, member] of PlayerManager.players) {
      // Add player to string
      players += `- ${member.user.username}\n`;
   }

   const embed = new EmbedBuilder(interaction.message.embeds[0].data).setFields({
      name: "Players",
      value: players.split("").length > 0 ? players : "*Zero players*",
   });

   const buttons = new ActionRowBuilder();

   if (PlayerManager.players.size > 0) {
      buttons.addComponents(
         new ButtonBuilder()
            .setCustomId("confirm-players")
            .setLabel("Confirm Players")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(PlayerManager.players.size === 0 ? true : false)
      );
   }

   buttons.addComponents(
      new ButtonBuilder()
         .setCustomId("show-add-player-list")
         .setLabel("Add Players")
         .setStyle(ButtonStyle.Success)
         .setDisabled(PlayerManager.players.size >= 8 ? true : false),
      new ButtonBuilder()
         .setCustomId("show-remove-player-list")
         .setLabel("Remove Player")
         .setStyle(ButtonStyle.Danger)
         .setDisabled(PlayerManager.players.size === 0)
   );

   interaction.update({
      embeds: [embed],
      components: [buttons],
   });
};
