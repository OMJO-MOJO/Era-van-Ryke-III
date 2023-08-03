const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const PlayerManager = require("../../../features/PlayerManager");

const buttons = new ActionRowBuilder().addComponents(
   new ButtonBuilder().setCustomId("close-civs").setLabel("Close").setStyle(ButtonStyle.Danger).setDisabled(false)
);

module.exports = async (interaction, instance) => {
   const req = interaction.customId.split("_");

   if (!req.length) {
      return;
   }

   const id = req.shift();

   if (id !== "result") {
      return;
   }

   // Make sure that the user is a player
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

   const action = req[0];

   if (action === "discard") {
      // Reset the caches
      PlayerManager.resetAll();

      return interaction.update({
         embeds: [
            new EmbedBuilder(interaction.message.embeds[0].data)
               .setTitle(`❌ - Match has been discarded`)
               .setDescription(`This match has been discarded by ${interaction.member.user.username}.`),
         ],
         components: [buttons],
      });
   }

   // Get the winning team's number
   const winningTeamNum = parseInt(action.split("-").pop());
   const winningTeamEmoji =
      (await interaction.guild.emojis.cache.find((emoji) => emoji.name === (winningTeamNum === 1 ? "one" : "two"))?.toString()) || "❔";

   if (!winningTeamNum || typeof winningTeamNum !== "number") {
      return interaction.update({
         content: "❌ - Something went wrong while determining the winning team",
      });
   }

   await PlayerManager.updateRankings(winningTeamNum);

   interaction.update({
      embeds: [
         new EmbedBuilder(interaction.message.embeds[0].data)
            .setTitle(`Team ${winningTeamNum} has won! 🎉`)
            .setDescription(`**${interaction.member.user.username}** has selected team ${winningTeamNum} as the winners.`)
            .addFields({
               name: "🥇 Winner",
               value: `- ${winningTeamEmoji} Team ${winningTeamNum}`,
            }),
      ],
      components: [buttons],
   });
};
