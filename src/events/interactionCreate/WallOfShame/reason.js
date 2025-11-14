const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require("discord.js");
const config = require("../../../config.json");

module.exports = async (interaction, instance) => {
   if (interaction.customId.split("_")[0] !== "wall-of-shame-reason") return;

   // Get the reason for the shame
   const reason = interaction.fields.getTextInputValue("reason");

   // Get the user ID from the custom ID
   const userId = interaction.customId.split("_")[1];

   // Get the user
   const member = interaction.guild.members.cache.get(userId);
   if (!member) return;

   // Find all the members who need to vote
   const council = [];
   for (const [channelId, channel] of interaction.guild.channels.cache) {
      // Make sure the channel is a voice channel
      if (channel.type !== ChannelType.GuildVoice) continue;

      // Loop through all found members
      for (const [_userId, member] of channel.members) {
         // Make sure that the nominee is not included
         if (_userId === userId) continue;

         // Save the user Id
         if (!council.includes(_userId)) council.push(_userId);
      }
   }

   // Cache the wall of shame
   instance.client.wallOfShame.initShame(userId, reason, council);

   // Create the embed
   const embed = new EmbedBuilder()
      .setColor(0xd7a35f)
      // .setImage(config.wallOfShame)
      .setTitle(`${member.user.username} has been nominated for`)
      .setThumbnail(member.displayAvatarURL())
      .setDescription(
         `> ${reason}\n\n\`\`\`Council\`\`\`\n\n${council
            .map((UID) => `\`-\` ❔ ${interaction.guild.members.cache.get(UID)?.user.username || UID}`)
            .join("\n")}\n\n\`\`\` \`\`\``
      );

   // Create the buttons
   const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`wall-of-shame-vote_${userId}_${true}`).setLabel("Yes!").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`wall-of-shame-vote_${userId}_${false}`).setLabel("No!").setStyle(ButtonStyle.Danger)
   );

   // Update the interaction
   interaction.update({ embeds: [embed], components: [buttons] });
};
