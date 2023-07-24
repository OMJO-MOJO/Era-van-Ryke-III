const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const PlayerManager = require("../../../features/PlayerManager");

module.exports = (interaction, instance) => {
   if (interaction.customId !== "add-players") {
      return;
   }

   // Add players to manager
   const playerIds = interaction.values;
   for (const id of playerIds) {
      const member = interaction.guild.members.cache.get(id);

      if (!member) {
         continue;
      }

      PlayerManager.addPlayer(member);
   }

   // Generate Output for the user
   let players = "";
   for (const [userId, member] of PlayerManager.players) {
      // Add player to string
      players += `- ${member.user.username}\n`;
   }

   const embed = new EmbedBuilder(interaction.message.embeds[0].data).setFields({
      name: "Players",
      value: players,
   });

   const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
         .setCustomId("confirm-players")
         .setLabel("Confirm Players")
         .setStyle(ButtonStyle.Primary)
         .setDisabled(PlayerManager.players.size === 0 ? true : false),
      new ButtonBuilder()
         .setCustomId("show-add-player-list")
         .setLabel("Add Player")
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
