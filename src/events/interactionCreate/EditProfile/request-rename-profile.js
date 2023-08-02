const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");

module.exports = (interaction, instance) => {
   if (interaction.customId !== "request-rename-profile") {
      return;
   }

   // Get the old name
   let profile = interaction.message.embeds[0].data.title.split(" ");
   profile.shift();
   profile = profile.join(" ");

   // The modal that will be displayed to the user
   const modal = new ModalBuilder()
      .setCustomId("rename-profile")
      .setTitle(`Rename profile`)
      .addComponents(
         new ActionRowBuilder().addComponents(
            new TextInputBuilder().setCustomId("name").setLabel("New name").setPlaceholder(profile).setStyle(TextInputStyle.Short).setRequired(true)
         )
      );

   interaction.showModal(modal);
};
