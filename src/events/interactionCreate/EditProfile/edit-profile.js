const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const profilesSchema = require("../../../schemas/profiles.schema");

module.exports = async (interaction, instance) => {
   if (interaction.customId !== "edit-profile") {
      return;
   }

   const playerProfile = await profilesSchema.findOne({ userId: interaction.member.user.id });
   if (!playerProfile) {
      return interaction.update({ content: "❌ - Failed to fetch profile from databse." });
   }

   // What profile the user selected
   let selectedProfile = interaction.message.components[0].components[0].data.options?.filter((option) => option.default === true)[0]?.value;
   if (!selectedProfile) {
      // If the selectedProfile is not found, check the embed title
      const profileName = interaction.message.embeds[0].data.title.split(" ");
      profileName.shift();
      selectedProfile = profileName.join(" ");
   }

   const profile = playerProfile.profiles.filter((profile) => profile.name === selectedProfile)[0];
   if (!profile) {
      return interaction.update({ content: "❌ - Failed to fetch profile from databse." });
   }

   // Find the correct emoji for the profile
   const profileEmoji = await interaction.guild.emojis.cache
      .find((emoji) => {
         if (profile.default) {
            return emoji.name === "default";
         } else {
            return emoji.name === "profile";
         }
      })
      ?.toString();

   // The embed
   const embed = new EmbedBuilder()
      .setColor(0xd7a35f)
      .setTitle(`${profileEmoji} ${profile.name}`)
      .setFields(
         {
            name: "Profile Name",
            value: profile.name,
            // inline: true,
         },
         {
            name: "Is Default?",
            value: profile.default ? "Yes" : "No",
            // inline: true,
         },
         {
            name: "Enabled civilizations",
            value: `${profile.civs.filter((civ) => civ.enabled === true).length}/${profile.civs.length} civilizations`,
            // inline: true,
         }
      );

   // The buttons
   const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
         .setCustomId("set-default-profile")
         .setLabel(profile.default ? "Profile already set as default" : "Set profile as default")
         .setStyle(ButtonStyle.Success)
         .setDisabled(profile.default),
      new ButtonBuilder().setCustomId("request-rename-profile").setLabel("Rename Profile").setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
         .setCustomId("request-delete-profile")
         .setLabel(profile.default ? "Unabled to delete default profile" : "Delete Profile")
         .setStyle(ButtonStyle.Danger)
         .setDisabled(profile.default),
      new ButtonBuilder().setCustomId("back_select-profile").setLabel("Back").setStyle(ButtonStyle.Secondary)
   );

   interaction.update({
      embeds: [embed],
      components: [buttons],
      ephemeral: true,
   });
};
