const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, UserSelectMenuBuilder, ChannelType } = require("discord.js");
const wallOfShameRules = require("../../../util/wall-of-shame-rules");
const config = require("../../../config.json");

module.exports = async (interaction, instance) => {
   if (interaction.customId !== "wall-of-shame-init") return;

   // Find all the members who need to vote
   let councilSize = 0;
   for (const [channelId, channel] of interaction.guild.channels.cache) {
      // Make sure the channel is a voice channel
      if (channel.type !== ChannelType.GuildVoice) continue;

      councilSize += channel.members.size;
   }

   if (councilSize < 0) {
      interaction.reply({
         embeds: [
            new EmbedBuilder()
               .setColor("Red")
               .setDescription(
                  `Hmm, looks like there is only ${councilSize} users in voice channels. Please make sure there are enough people to discuss the shamed nominee.`
               ),
         ],
         ephemeral: true,
      });
      return;
   }

   // Create the init embed
   const embed = new EmbedBuilder()
      .setColor(0xd7a35f)
      .setTitle("Welcome to the Wall of Shame")
      .setImage(config.wallOfShame)
      .setDescription(
         `> Please use the dropdown menu to search for a member to shame. Please abide by the rules that follow:\n\n\`\`\`Rules:\`\`\`\n${wallOfShameRules
            .map((rule, index) => `\`${index + 1}\` - *${rule}*`)
            .join("\n\n")}`
      );
   // Create the dropdown menu to search for a player
   const userSelect = new ActionRowBuilder().addComponents(
      new UserSelectMenuBuilder().setCustomId("wall-of-shame-select").setMinValues(1).setMaxValues(1).setPlaceholder("Select a member to shame")
   );

   // Create the buttons
   const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("wall-of-shame-close").setLabel("Close").setStyle(ButtonStyle.Danger)
   );

   // Reply to the interaction
   interaction.reply({
      embeds: [embed],
      components: [userSelect, buttons],
   });
};
