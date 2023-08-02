const { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const profilesSchema = require("../../../schemas/profiles.schema");

module.exports = async (interaction, instance) => {
   if (interaction.customId !== "set-select-profile") {
      return;
   }

   // Fetch the profile from the database
   const playerProfile = await profilesSchema.findOne({ userId: interaction.member.user.id });

   if (!playerProfile) {
      interaction.update({ content: "❌ - Failed to fetch data from the database." });
   }

   // Generate the available civs
   let selectedProfile = false;
   const options = [];
   for (const profile of playerProfile.profiles) {
      const emoji = await interaction.guild.emojis.cache.find((emoji) => {
         if (profile.default) {
            return emoji.name === "default";
         } else {
            return emoji.name === "profile";
         }
      });

      let data = {
         label: profile.name,
         value: profile.name,
         emoji: emoji ? emoji.toString() : "❔",
      };

      if (profile.name === interaction.values[0]) {
         selectedProfile = true;
         data = {
            default: true,
            ...data,
         };
      }

      options.push(data);
   }

   // The select menu
   const listedProfiles = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
         .setCustomId("set-select-profile")
         .setPlaceholder("Select profile")
         .setOptions(options.length !== 0 ? options : [{ label: "Failed to fetch profiles", value: null }])
   );

   const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("create-profile").setLabel("Create new profile").setStyle(ButtonStyle.Success).setDisabled(false),
      new ButtonBuilder().setCustomId("edit-civs").setLabel("Edit Civs").setStyle(ButtonStyle.Primary).setDisabled(!selectedProfile),
      new ButtonBuilder().setCustomId("edit-profile").setLabel("Edit Profile").setStyle(ButtonStyle.Secondary).setDisabled(!selectedProfile)
   );

   interaction.update({ components: [listedProfiles, buttons] });
};
