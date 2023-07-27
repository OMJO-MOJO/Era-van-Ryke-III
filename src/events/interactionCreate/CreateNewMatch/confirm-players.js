const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const PlayerManager = require("../../../features/PlayerManager");

module.exports = async (interaction, instance) => {
   if (!["confirm-players", "regenerate-civs"].includes(interaction.customId)) {
      return;
   }

   const results = await PlayerManager.generateCivs();

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

   const regenerateCivs = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
         .setCustomId("regenerate-civs")
         .setLabel("New Civs")
         .setStyle(ButtonStyle.Primary)
         .setDisabled(PlayerManager._players.size === 0 ? true : false),

      new ButtonBuilder().setCustomId("close-civs").setLabel("Close").setStyle(ButtonStyle.Danger)
   );

   interaction.update({
      embeds: [new EmbedBuilder(interaction.message.embeds[0].data).setDescription(null).setFields(value)],
      components: [regenerateCivs],
   });
};
