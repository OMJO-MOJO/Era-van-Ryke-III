const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const PlayerManager = require("../../../features/PlayerManager");

module.exports = async (interaction, instance) => {
   if (interaction.customId !== "enter-match-results") {
      return;
   }

   if (!PlayerManager.players.get(interaction.member.user.id)) {
      return interaction.reply({
         embeds: [
            new EmbedBuilder()
               .setColor("Red")
               .setDescription(
                  "Please note that only players of this match can enter the results of the match.\n\nThe results of the match is important to maintain as accurate as possible and thus is restricted to the players of the match."
               ),
         ],
         ephemeral: true,
      });
   }

   const team1Emoji = (await interaction.guild.emojis.cache.find((emoji) => emoji.name === "one")?.toString()) || "❔";
   const team2Emoji = (await interaction.guild.emojis.cache.find((emoji) => emoji.name === "two")?.toString()) || "❔";

   const embedMain = new EmbedBuilder(interaction.message.embeds[0].data);
   const subEmbed = new EmbedBuilder().setColor(0xd7a35f).setDescription(`**Please select the team who has won the match**`);

   const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("result_team-1").setLabel("Team 1").setEmoji(team1Emoji).setStyle(ButtonStyle.Primary),

      new ButtonBuilder().setCustomId("result_team-2").setLabel("Team 2").setEmoji(team2Emoji).setStyle(ButtonStyle.Primary),

      new ButtonBuilder().setCustomId("result_discard").setLabel("Discard").setStyle(ButtonStyle.Danger)
   );

   interaction.update({
      embeds: [embedMain, subEmbed],
      components: [buttons],
   });
};
