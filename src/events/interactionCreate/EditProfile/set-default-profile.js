const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const profilesSchema = require("../../../schemas/profiles.schema");

module.exports = async (interaction, instance) => {
   if (interaction.customId !== "set-default-profile") {
      return;
   }

   const playerProfile = await profilesSchema.findOne({ userId: interaction.member.user.id });
   if (!playerProfile) {
      return interaction.update({ content: "❌ - Failed to fetch profile from databse." });
   }

   // Get the old name
   let selectedProfileName = interaction.message.embeds[0].data.title.split(" ");
   selectedProfileName.shift();
   selectedProfileName = selectedProfileName.join(" ");

   const selectedProfile = playerProfile.profiles.filter((profile) => profile.name === selectedProfileName)[0];
   if (!selectedProfile) {
      return interaction.update({ content: "❌ - Failed to fetch profile from databse." });
   }

   // Loop through all found profiles
   const profiles = [];
   for (const profile of playerProfile.profiles) {
      // Disable the previous default profile
      if (profile.default) {
         profile.default = false;
      }

      if (profile.name === selectedProfile.name) {
         selectedProfile.default = true;
         profile.default = true;
      }

      // Save the profile
      profiles.push(profile);
   }

   // Save the new profiles to the database
   await profilesSchema.findOneAndUpdate({ userId: interaction.member.user.id }, { userId: interaction.member.user.id, profiles }, { upsert: true });

   // Get the emojis from the guild
   const enabledEmoji = interaction.guild.emojis.cache.find((emoji) => emoji.name === "enabled")?.toString() || "❔";
   const defaultEmoji = interaction.guild.emojis.cache.find((emoji) => emoji.name === "default")?.toString() || "❔";

   // Generate an updated embed
   const embed = new EmbedBuilder(interaction.message.embeds[0].data).setTitle(`${defaultEmoji} ${selectedProfile.name}`).setFields(
      { name: "Profile Name", value: selectedProfile.name },
      { name: "Is Default?", value: selectedProfile.default ? "Yes" : "No" },
      {
         name: "Enabled civilizations",
         value: `${selectedProfile.civs.filter((civ) => civ.enabled === true).length}/${selectedProfile.civs.length} civilizations`,
      }
   );

   // Generate an updated set of buttons
   const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
         .setCustomId("set-default-profile")
         .setLabel(selectedProfile.default ? "Profile already set as default" : "Set profile as default")
         .setStyle(ButtonStyle.Success)
         .setDisabled(selectedProfile.default),
      new ButtonBuilder().setCustomId("request-rename-profile").setLabel("Rename Profile").setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
         .setCustomId("request-delete-profile")
         .setLabel(selectedProfile.default ? "Unabled to delete default profile" : "Delete Profile")
         .setStyle(ButtonStyle.Danger)
         .setDisabled(selectedProfile.default),
      new ButtonBuilder().setCustomId("back_select-profile").setLabel("back").setStyle(ButtonStyle.Secondary)
   );

   // Update the message
   interaction.update({
      content: `${enabledEmoji} - Your default profile has been updated!`,
      embeds: [embed],
      components: [buttons],
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
