const { Pagination } = require("pagination.djs");
const PlayerManager = require("../../../features/PlayerManager");
const { ButtonStyle, EmbedBuilder } = require("discord.js");

module.exports = async (interaction) => {
   if (interaction.customId !== "display-leaderboard") {
      return;
   }

   // Give enough time for the bot to fetch the rankings
   interaction.deferReply({ ephemeral: true });

   // Generate the Pagination Embed
   interaction.deferred = true;
   const pagination = new Pagination(interaction, {
      limit: 10,
      ephemeral: true,
      loop: true,
   }).setButtonAppearance({
      first: {
         label: null,
         emoji: "⏮",
         style: ButtonStyle.Primary,
      },
      prev: {
         label: null,
         emoji: "◀️",
         style: ButtonStyle.Primary,
      },
      next: {
         label: null,
         emoji: "▶️",
         style: ButtonStyle.Primary,
      },
      last: {
         label: null,
         emoji: "⏭",
         style: ButtonStyle.Primary,
      },
   });

   // Generate the description
   const descriptions = [
      "> Please note that ratings are still new and may be inaccurate, please play more matches using the bot to improve the accuracy of your rating.",
      "",
   ];

   // Get the rankings from the Player manager
   const results = await PlayerManager.getRankings();

   // Process the results
   let i = 0;
   for (const result of results) {
      // Ignore the zero ratings
      if (result.rating === 0) {
         continue;
      }

      // Fetch the members
      const member = await interaction.guild.members
         .fetch(result.userId)
         .then((member) => member)
         .catch(() => null);
      if (!member) {
         continue;
      }

      // Add the results to a string
      descriptions.push(`\`#${i + 1}\` -  **${member.user.username}** *(${parseFloat(result.rating.toFixed(2))})*`);

      i++;
   }

   // Add additional details
   pagination.setAuthor({ name: "🏆 Leaderboard" }).setColor(0xd7a35f).setDescriptions(descriptions);

   // Update the embeds
   pagination.render().catch(() => console.log(2));
};
