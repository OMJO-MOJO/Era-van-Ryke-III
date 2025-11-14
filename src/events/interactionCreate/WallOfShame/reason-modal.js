const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const wallOfShameRules = require("../../../util/wall-of-shame-rules");
const config = require("../../../config.json");

module.exports = async (interaction, instance) => {
   if (interaction.customId.split("_")[0] !== "wall-of-shame-reason-modal") return;

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

   // Create the modal form
   const modal = new ModalBuilder()
      .setCustomId(`wall-of-shame-reason_${userId}`)
      .setTitle("What is the reason for the shame?")
      .addComponents(
         new ActionRowBuilder().addComponents(
            new TextInputBuilder()
               .setCustomId("reason")
               .setLabel("Reason for the shame")
               .setPlaceholder("Reason for shame...")
               .setStyle(TextInputStyle.Paragraph)
               .setRequired(true)
         )
      );

   interaction.showModal(modal);
};
