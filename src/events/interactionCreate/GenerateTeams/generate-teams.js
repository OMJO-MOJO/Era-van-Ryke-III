const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const PlayerManager = require("../../../features/PlayerManager");

module.exports = async (interaction, instance) => {
   if (interaction.customId !== "generate-teams") {
      return;
   }

   if (!PlayerManager.players.get(interaction.member.user.id)) {
      return interaction.reply({
         embeds: [
            new EmbedBuilder()
               .setColor("Red")
               .setDescription("❌ - Generate teams because only players are allowed to and you are not a player in the current match."),
         ],
         ephemeral: true,
      });
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
      // const member = await instance.client.users.fetch(id).then((user) => ({ user }));

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
      // const member = await instance.client.users.fetch(id).then((user) => ({ user }));

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

   // Get the predicted winning rates
   const predictedWinningRates = await PlayerManager.predictWin();

   // Get the teams' winning rate
   const [team1WinningRate, team2WinningRate] = predictedWinningRates;
   const team1WinPercent = parseFloat((team1WinningRate * 100).toFixed(1));
   const team2WinPercent = parseFloat((team2WinningRate * 100).toFixed(1));

   // Check if the game is predicted to draw
   let perfectDraw = false;
   if (team1WinningRate === team2WinningRate) {
      perfectDraw = true;
   }

   // Get the winning team num
   const predictedWinningTeamNum = team1WinningRate > team2WinningRate ? 1 : 2;

   const redSiren = (await interaction.guild.emojis.cache.find((emoji) => emoji.name === "redSiren")?.toString()) || "❔";
   const blueSiren = (await interaction.guild.emojis.cache.find((emoji) => emoji.name === "blueSiren")?.toString()) || "❔";
   const team1Emoji = (await interaction.guild.emojis.cache.find((emoji) => emoji.name === "one")?.toString()) || "❔";
   const team2Emoji = (await interaction.guild.emojis.cache.find((emoji) => emoji.name === "two")?.toString()) || "❔";

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
         },
         {
            name: "🏆 Predicted Winning Team",
            value: `- ||${
               perfectDraw
                  ? `❓ Draw`
                  : `${predictedWinningTeamNum === 1 ? team1Emoji : team2Emoji} Team ${predictedWinningTeamNum} *(${
                       predictedWinningTeamNum === 1 ? team1WinPercent : team2WinPercent
                    }%)*`
            }||`,
         }
      );

   const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("enter-match-results").setLabel("Enter Match Results").setStyle(ButtonStyle.Primary),

      new ButtonBuilder().setCustomId("move-players-to-vc").setLabel("Move Players to VCs").setStyle(ButtonStyle.Success),

      new ButtonBuilder().setCustomId("generate-teams").setLabel("Regenerate Teams").setStyle(ButtonStyle.Secondary),

      new ButtonBuilder().setCustomId("close-civs").setLabel("Close").setStyle(ButtonStyle.Danger).setDisabled(true)
   );

   interaction.update({
      embeds: [embed],
      components: [buttons],
   });
};
