const profilesSchema = require("../../../schemas/profiles.schema");
const selectProfile = require("../SelectProfile/select-profile");

module.exports = async (interaction, instance) => {
   if (interaction.customId !== "delete-profile") {
      return;
   }

   // Get the profile's name
   let profileName = interaction.message.embeds[0].data.title.split(" ");
   profileName.shift();
   profileName = profileName.join(" ");

   // Fetch all data from the database
   const playerProfile = await profilesSchema.findOne({ userId: interaction.member.user.id });
   if (!playerProfile) {
      return interaction.update({ content: "❌ - Failed to fetch profile from databse." });
   }

   // Remove the selected profile
   const profiles = playerProfile.profiles.filter((profile) => profile.name !== profileName);

   // Save to the database
   await profilesSchema.findOneAndUpdate({ userId: interaction.member.user.id }, { userId: interaction.member.user.id, profiles }, { upsert: true });

   // Fetch the emojis
   const disabledEmoji = interaction.guild.emojis.cache.find((emoji) => emoji.name === "disabled")?.toString() || "❔";

   // Redirect the user back to the select profiles menu
   interaction.customId = "back_select-profile";
   await selectProfile(interaction, instance);

   // Update the message
   interaction.editReply({
      content: `${disabledEmoji} - **${profileName}** has been deleted.`,
   });

   setTimeout(() => {
      interaction.editReply({
         content: "",
      });
   }, 5000);
};
