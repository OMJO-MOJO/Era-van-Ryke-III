const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const config = require("../../../config.json");

let enabledEmoji;
let disabledEmoji;

module.exports = async (interaction, instance) => {
   if (interaction.customId.split("_")[0] !== "wall-of-shame-vote") return;

   // Cache the emojis
   if (!enabledEmoji) {
      enabledEmoji = await interaction.guild.emojis.cache.find((emoji) => emoji.name === "enabled")?.toString();
   }

   // Cache the emojis
   if (!disabledEmoji) {
      disabledEmoji = await interaction.guild.emojis.cache.find((emoji) => emoji.name === "disabled")?.toString();
   }

   // Get the user ID from the custom ID
   const userId = interaction.customId.split("_")[1];

   // Get the user
   const member = interaction.guild.members.cache.get(userId);
   if (!member) return;

   // Get the vote from the custom ID
   const vote = interaction.customId.split("_")[2] === "true";

   // Get the wall of shame submission
   let submission = instance.client.wallOfShame.cache.get(userId);
   if (!submission) return;

   // Check if the user is part of the council or is the nominee
   if (userId === interaction.user.id) {
      interaction.reply({
         embeds: [
            new EmbedBuilder().setColor("Red").setDescription("You have been nominated for the Wall of Shame! You have no power over this vote."),
         ],
         ephemeral: true,
      });
      return;
   }

   if (!submission.votes.map((vote) => vote.userId).includes(interaction.user.id)) {
      interaction.reply({
         embeds: [new EmbedBuilder().setColor("Red").setDescription("You are not part of the council! You have no power over this vote.")],
         ephemeral: true,
      });
      return;
   }

   // Cache the vote
   submission = instance.client.wallOfShame.vote(userId, interaction.user.id, vote);

   // Create the embed
   const embed = new EmbedBuilder()
      .setColor(0xd7a35f)
      // .setImage(config.wallOfShame)
      .setTitle(`${member.user.username} has been nominated for`)
      .setThumbnail(member.displayAvatarURL())
      .setDescription(
         `> ${submission.reason}\n\n\`\`\`Council\`\`\`\n${submission.votes
            .map(
               (vote) =>
                  `\`-\` ${vote.vote !== null ? (vote.vote ? enabledEmoji : disabledEmoji) : "❔"} ${
                     interaction.guild.members.cache.get(vote.userId)?.user.username || "Unknown member"
                  }`
            )
            .join("\n")}\n\`\`\` \`\`\``
      );

   // Create the buttons
   const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`wall-of-shame-vote_${userId}_${true}`).setLabel("Yes!").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`wall-of-shame-vote_${userId}_${false}`).setLabel("No!").setStyle(ButtonStyle.Danger)
   );

   // Update the interaction
   interaction.update({ embeds: [embed], components: [buttons] });
};
