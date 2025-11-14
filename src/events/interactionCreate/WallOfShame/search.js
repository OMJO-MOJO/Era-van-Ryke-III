const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const config = require("../../../config.json");

module.exports = async (interaction, instance) => {
   if (interaction.customId !== "wall-of-shame-select") return;

   // Get the user to shame
   const userId = interaction.values[0];
   if (!userId) return;

   // Get the user
   const member = interaction.guild.members.cache.get(userId);
   if (!member) return;

   // Create the embed
   const embed = new EmbedBuilder()
      .setColor(0xd7a35f)
      //   .setImage(config.wallOfShame)
      .setTitle(`${member.user.username} has been nominated`)
      .setThumbnail(member.displayAvatarURL())
      .setDescription(
         `> Please provide a reason for ${member.user.username}'s nomination for the Wall of Shame by clicking the "Set Reason" button below!`
      );

   // Create the buttons
   const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`wall-of-shame-submit_${userId}`).setLabel("Submit").setStyle(ButtonStyle.Success).setDisabled(true),
      new ButtonBuilder().setCustomId(`wall-of-shame-reason-modal_${userId}`).setLabel("Set Reason").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId(`wall-of-shame-close_${userId}`).setLabel("Close").setStyle(ButtonStyle.Danger)
   );

   // Update the interaction
   interaction.update({ embeds: [embed], components: [buttons] });
};
