const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = (interaction, instance) => {
   if (interaction.customId !== "request-delete-profile") {
      return;
   }

   // Get the old name
   let profileName = interaction.message.embeds[0].data.title.split(" ");
   const emoji = profileName.shift();
   profileName = profileName.join(" ");

   const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle(`${emoji} ${profileName}`)
      .setDescription(`Are you sure you want to delete **${profileName}**?\nThis action cannot be undone.`);

   const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("delete-profile").setLabel(`Delete ${profileName}`).setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("edit-profile").setLabel("Cancel").setStyle(ButtonStyle.Secondary)
   );

   interaction.update({
      embeds: [embed],
      components: [buttons],
   });
};
