const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const PlayerManager = require("../../../features/PlayerManager");

module.exports = async (interaction, instance) => {
   if (!["confirm-players", "regenerate-civs"].includes(interaction.customId)) {
      return;
   }

   const results = await PlayerManager.generateCivs();
   if (!results) {
      return interaction.update({
         embeds: [
            new EmbedBuilder()
               .setColor("Red")
               .setDescription(`There were no players found, this could be due to the bot restarting.\nPlease create a new match.`),
         ],
         components: [
            new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("close-civs").setLabel("Close").setStyle(ButtonStyle.Danger)),
         ],
      });
   }

   let i = 0;
   let value = [];
   for (const [_, player] of results) {
      const { member, civ, totalCivs } = player;

      const flag = await interaction.guild.emojis.cache.find((emoji) => emoji.name === civ.name);

      value.push({
         name: i === 0 ? "Results" : "** **",
         value: `- **${member.user.username}**\n> ${flag ? flag.toString() : "❔"} ${civ.name}\n  - *1/${totalCivs} Civs* `,
         inline: true,
      });

      i++;
   }

   const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
         .setCustomId("generate-teams")
         .setLabel(PlayerManager.players.size >= 2 ? "Generate Teams" : "Need at least 2 players to create teams")
         .setStyle(ButtonStyle.Primary)
         .setDisabled(PlayerManager.players.size < 2 ? true : false),

      new ButtonBuilder()
         .setCustomId("regenerate-civs")
         .setLabel("New Civs")
         .setStyle(ButtonStyle.Secondary)
         .setDisabled(PlayerManager.players.size === 0 ? true : false),

      new ButtonBuilder().setCustomId("close-civs").setLabel("Close").setStyle(ButtonStyle.Danger)
   );

   interaction.update({
      embeds: [new EmbedBuilder(interaction.message.embeds[0].data).setDescription(null).setFields(value)],
      components: [buttons],
   });
};
