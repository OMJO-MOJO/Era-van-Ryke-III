const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const PlayerManager = require("../../../features/PlayerManager");

module.exports = async (interaction, instance) => {
   if (interaction.customId !== "generate-teams") {
      return;
   }

   if (PlayerManager.players.size < 2) {
      return interaction.update({
         embeds: [
            new EmbedBuilder()
               .setColor("Red")
               .setDescription(
                  `There are less than 2 players and thus cannot be split between 2 teams.\nIf this is incorrect, then no players where found because the bot probably restarted, please create a new match.`
               ),
         ],
         components: [
            new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("close-civs").setLabel("Close").setStyle(ButtonStyle.Danger)),
         ],
      });
   }

   // Generate the teams
   const result = await PlayerManager.generateTeams();

   // Get all the players in team 1
   const team1 = [];
   for (const id of result.team1.ids) {
      const member = await interaction.guild.members.fetch(id).then((member) => member);

      if (!member) {
         continue;
      }

      const player = PlayerManager.players.get(member.user.id);
      if (!player) {
         continue;
      }

      const civ = player.civ;
      if (!civ) {
         continue;
      }

      const flag = (await interaction.guild.emojis.cache.find((emoji) => emoji.name === civ.name)?.toString()) || "❔";

      team1.push(`${flag} ${member.user.username}`);
   }

   // Get all the players in team 2
   let team2 = [];
   for (const id of result.team2.ids) {
      const member = await interaction.guild.members.fetch(id).then((member) => member);

      if (!member) {
         continue;
      }

      const player = PlayerManager.players.get(member.user.id);
      if (!player) {
         continue;
      }

      const civ = player.civ;
      if (!civ) {
         continue;
      }

      const flag = (await interaction.guild.emojis.cache.find((emoji) => emoji.name === civ.name)?.toString()) || "❔";

      team2.push(`${flag} ${member.user.username}`);
   }

   const redSiren = (await interaction.guild.emojis.cache.find((emoji) => emoji.name === "redSiren")?.toString()) || "❔";
   const blueSiren = (await interaction.guild.emojis.cache.find((emoji) => emoji.name === "blueSiren")?.toString()) || "❔";
   const team1Emoji = (await interaction.guild.emojis.cache.find((emoji) => emoji.name === "one")?.toString()) || "❔";
   const team2Emoji = (await interaction.guild.emojis.cache.find((emoji) => emoji.name === "two")?.toString()) || "❔";

   // TODO: Added a prefiction of which team wins: use the spoilers "||${prediction}||"
   const embed = new EmbedBuilder()
      .setColor(0xd7a35f)
      .setTitle(`${redSiren} Important Information ${blueSiren}`)
      .setDescription(
         `Please note that this system uses skill-based matchmaking and thus relies on the players' honesty when determining which team has won.\n\nIf a player selects the incorrect team as the winner, it will alter the rankings of players and create an inaccurate matchmaking system.\n\n- What to do when the game finishes?\n - If team 1 has won, please select team 1.\n - If team 2 has won, please select team 2.\n - If players want to discard the match, please select discard.`
      )
      .setFields(
         {
            name: `${team1Emoji} Team 1`,
            value: `- ${team1.join("\n- ")}`,
            inline: true,
         },
         {
            name: `${team2Emoji} Team 2`,
            value: `- ${team2.join("\n- ")}`,
            inline: true,
         }
      );

   const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("enter-match-results").setLabel("Enter Match Results").setStyle(ButtonStyle.Primary),

      new ButtonBuilder().setCustomId("generate-teams").setLabel("Regenerate Teams").setStyle(ButtonStyle.Secondary),

      new ButtonBuilder().setCustomId("close-civs").setLabel("Close").setStyle(ButtonStyle.Danger).setDisabled(true)
   );

   interaction.update({
      embeds: [embed],
      components: [buttons],
   });
};
