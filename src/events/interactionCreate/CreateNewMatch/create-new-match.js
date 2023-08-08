const { EmbedBuilder, ActionRowBuilder, UserSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const PlayerManager = require("../../../features/PlayerManager");

module.exports = async (interaction, instance) => {
   if (interaction.customId !== "create-new-match") {
      return;
   }

   // TODO: Disable the Create New Match button

   // Clear the player setup
   PlayerManager.clearPlayers();

   // Add all the players in the VC
   let players = "";
   const channels = interaction.guild.channels.cache.map((channel) => channel).filter((channel) => channel.type === 2);
   for (const channel of channels) {
      if (channel.members?.length === 0) {
         continue;
      }

      for (const [userId, member] of channel.members) {
         // Register the player to the manager
         await PlayerManager.addPlayer(member);

         // Add player to string
         players += `- ${member.user.username}\n`;
      }
   }

   const embed = new EmbedBuilder()
      .setColor(0xd7a35f)
      .setDescription('Please assign players below to teams. Once completed, click the "Confirm Teams" button.')
      .setFields({ name: "Players", value: "*Zero players*" });

   // Display the players
   if (PlayerManager.players.size > 0) {
      embed.setFields({
         name: "Players",
         value: players,
      });
   }

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
         .setDisabled(PlayerManager.players.size === 0),
      new ButtonBuilder().setCustomId("close-civs").setLabel("Close").setStyle(ButtonStyle.Danger)
   );

   interaction.reply({
      embeds: [embed],
      components: [buttons],
   });
};
