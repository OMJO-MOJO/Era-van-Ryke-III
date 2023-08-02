const { EmbedBuilder } = require("discord.js");
const profilesSchema = require("../../../schemas/profiles.schema");

module.exports = async (interaction, instance) => {
   if (interaction.customId !== "rename-profile") {
      return;
   }

   // Get the old and new name
   const newName = interaction.fields.getTextInputValue("name");
   let oldName = interaction.message.embeds[0].data.title.split(" ");
   const emoji = oldName.shift();
   oldName = oldName.join(" ");

   // Fetch all data from the database
   const playerProfile = await profilesSchema.findOne({ userId: interaction.member.user.id });
   if (!playerProfile) {
      return interaction.update({ content: "❌ - Failed to fetch profile from databse." });
   }

   // Loop through all found profiles and upadte the correct profile to the new name
   let selectedProfile;
   const profiles = [];
   for (const profile of playerProfile.profiles) {
      if (profile.name === oldName) {
         profile.name = newName;
         selectedProfile = profile;
      }

      profiles.push(profile);
   }

   // Save to the database
   await profilesSchema.findOneAndUpdate({ userId: interaction.member.user.id }, { userId: interaction.member.user.id, profiles }, { upsert: true });

   // Generate an updated embed
   const embed = new EmbedBuilder(interaction.message.embeds[0].data).setTitle(`${emoji} ${selectedProfile.name}`).setFields(
      { name: "Profile Name", value: selectedProfile.name },
      { name: "Is Default?", value: selectedProfile.default ? "Yes" : "No" },
      {
         name: "Enabled civilizations",
         value: `${selectedProfile.civs.filter((civ) => civ.enabled === true).length}/${selectedProfile.civs.length} civilizations`,
      }
   );

   const enabledEmoji = interaction.guild.emojis.cache.find((emoji) => emoji.name === "enabled")?.toString() || "❔";

   // Update the message
   interaction.update({
      content: `${enabledEmoji} - Your profile's name has been updated!`,
      embeds: [embed],
   });

   // Remove the message
   setTimeout(() => {
      interaction
         .editReply({
            content: "",
         })
         .catch(() => null);
   }, 5000);
};
