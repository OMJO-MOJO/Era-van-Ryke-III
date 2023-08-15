const { EmbedBuilder } = require("discord.js");
const PlayerManager = require("../../../features/PlayerManager");

let enabledEmoji;

module.exports = async (interaction, instance) => {
   if (interaction.customId !== "move-players-to-vc") {
      return;
   }

   // Validate that the user is a player in the match
   if (!PlayerManager.players.get(interaction.member.user.id)) {
      return interaction.reply({
         embeds: [
            new EmbedBuilder()
               .setColor("Red")
               .setDescription("❌ - You cannot move players to voice channels because you are not a player in the match."),
         ],
         ephemeral: true,
      });
   }

   // Cache the emojis
   if (!enabledEmoji) {
      enabledEmoji = (await interaction.guild.emojis.cache.find((emoji) => emoji.name === "enabled")?.toString()) || "❔";
   }

   const team1Channel = interaction.guild.channels.cache.find((channel) => channel.name === "Span A");
   if (!team1Channel) {
      return interaction.reply({
         embeds: [new EmbedBuilder().setColor("Red").setDescription("❌ - Unable to find team 1's voice channel")],
         ephemeral: true,
      });
   }

   const team2Channel = interaction.guild.channels.cache.find((channel) => channel.name === "Span B");
   if (!team2Channel) {
      return interaction.reply({
         embeds: [new EmbedBuilder().setColor("Red").setDescription("❌ - Unable to find team 2's voice channel")],
         ephemeral: true,
      });
   }

   // Move all Team 1 members to the team 1 channel
   for (const userId of PlayerManager.team1?.ids || []) {
      const member = interaction.guild.members.cache.get(userId);
      if (!member) {
         continue;
      }

      // Move the member to the voice channel
      member.voice?.setChannel(team1Channel, `Move team 1 players to ${team1Channel.name}`).catch(() => null);
   }

   // Move all Team 2 members to the team 1 channel
   for (const userId of PlayerManager.team2.ids || []) {
      const member = interaction.guild.members.cache.get(userId);
      if (!member) {
         continue;
      }

      // Move the member to the voice channel
      member.voice?.setChannel(team1Channel, `Move team 1 players to ${team1Channel.name}`).catch(() => null);
   }

   interaction.update({
      content: `${enabledEmoji} - I have moved all players to the correct voice channels.`,
   });

   setTimeout(() => {
      interaction.editReply({
         content: "",
      });
   }, 5000);
};
