const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const wallOfShameRules = require("../../../util/wall-of-shame-rules");
const config = require("../../../config.json");

module.exports = async (interaction, instance) => {
   if (!interaction.customId.startsWith("wall-of-shame-close")) return;

   // Get the user ID from the custom ID
   const userId = interaction.customId.split("_")[1];

   // Check if the nominee is trying to close the vote
   if (userId && userId === interaction.user.id) {
      interaction.reply({
         embeds: [
            new EmbedBuilder().setColor("Red").setDescription("You have been nominated for the Wall of Shame! You have no power over this vote."),
         ],
         ephemeral: true,
      });
      return;
   }

   // Delete the submission from the cache
   instance.client.wallOfShame.cache.delete(userId);

   // Delete the message
   interaction.message.delete();
};
