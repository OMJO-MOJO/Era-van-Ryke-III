const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const PlayerManager = require("../../../features/PlayerManager");

module.exports = async (interaction, instance) => {
   const interactionId = interaction.customId.split("_")[0];

   if (interactionId !== "set-players-team") {
      return;
   }

   // Get the team to set the player to
   const teamNum = parseInt(interaction.customId.split("_")[1]);

   // Set the players' team
   for (const userId of interaction.values) {
      PlayerManager.setTeam(userId, teamNum);
   }

   let isNull = false;
   let options = [];
   let otherOptions = [];
   let team1Field = [];
   let team2Field = [];
   for (const [userId, player] of PlayerManager.players) {
      // Set the team fields for the embed
      if (player.team === 1) {
         team1Field.push(`- ${player.member.user.username}`);
      } else if (player.team === 2) {
         team2Field.push(`- ${player.member.user.username}`);
      }

      // Get the flag of the player
      const flag = (await interaction.guild.emojis.cache.find((emoji) => emoji.name === player.civ.name)?.toString()) || "❔";

      if (player.team === null) {
         isNull = true;
         otherOptions.push({
            label: player.member.user.username,
            value: userId,
            emoji: flag ? flag.toString() : "❔",
         });
      } else if (player.team !== teamNum) {
         otherOptions.push({
            label: player.member.user.username,
            value: userId,
            emoji: flag ? flag.toString() : "❔",
            default: true,
         });
         continue;
      }

      // Save the option
      options.push({
         label: player.member.user.username,
         value: userId,
         emoji: flag ? flag.toString() : "❔",
         default: player.team ? (player.team === teamNum ? true : false) : false,
      });
   }

   // Get the emojis
   const team1Emoji = interaction.guild.emojis.cache.find((emoji) => emoji.name === "one");
   const team2Emoji = interaction.guild.emojis.cache.find((emoji) => emoji.name === "two");

   // Generate the embed
   const embed = new EmbedBuilder(interaction.message.embeds[0].data).setFields([
      {
         name: `${team1Emoji} Team 1`,
         value: team1Field.length <= 0 ? "- No players selected" : team1Field.join("\n"),
         inline: true,
      },
      {
         name: `${team2Emoji} Team 2`,
         value: team2Field.length <= 0 ? "- No players selected" : team2Field.join("\n"),
         inline: true,
      },
   ]);

   // Generate the team 1 selection menu
   const team1 = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
         .setCustomId("set-players-team_1")
         .setMinValues(1)
         .setMaxValues(teamNum === 1 ? options.length : otherOptions.length)
         .setPlaceholder("Team 1")
         .setOptions(teamNum === 1 ? options : otherOptions)
   );

   // Generate the team 2 selection menu
   const team2 = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
         .setCustomId("set-players-team_2")
         .setMinValues(1)
         .setMaxValues(teamNum === 2 ? options.length : otherOptions.length)
         .setPlaceholder("Team 2")
         .setOptions(teamNum === 2 ? options : otherOptions)
   );

   // The close button
   const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
         .setCustomId("generate-teams_false")
         .setLabel(isNull ? "Some players missing teams" : "Confirm Teams")
         .setStyle(ButtonStyle.Primary)
         .setDisabled(isNull),
      new ButtonBuilder()
         .setCustomId("create-teams_1")
         .setLabel("Reset Team 1")
         .setStyle(ButtonStyle.Secondary)
         .setDisabled(PlayerManager.team1.ids.length === 0),
      new ButtonBuilder()
         .setCustomId("create-teams_2")
         .setLabel("Reset Team 2")
         .setStyle(ButtonStyle.Secondary)
         .setDisabled(PlayerManager.team2.ids.length === 0),
      new ButtonBuilder().setCustomId("close-civs").setLabel("Close").setStyle(ButtonStyle.Danger)
   );

   // Reply the the interaction
   interaction.update({
      embeds: [embed],
      components: [team1, team2, button],
   });
};
