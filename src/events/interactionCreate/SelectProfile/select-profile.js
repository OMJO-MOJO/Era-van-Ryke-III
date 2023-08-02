const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require("discord.js");
const profilesSchema = require("../../../schemas/profiles.schema");
const civs = require("../../../util/civs");

module.exports = async (interaction, instance) => {
   const action = interaction.customId.split("_");

   if (!action.length && interaction.customId !== "select-profile") {
      return;
   }

   if (action[0] !== "select-profile" && action[1] !== "select-profile") {
      return;
   }

   // Fetch the user's profile from the database
   let playerProfile = await profilesSchema.findOne({
      userId: interaction.member.user.id,
   });

   // Create a new player profile
   if (!playerProfile) {
      const defaultConfig = [];
      for (const civ of civs) {
         // Enabled all standard civs and disable all DLC civs
         if (civs.standard.includes(civ)) {
            defaultConfig.push({ name: civ, enabled: true });
         } else {
            defaultConfig.push({ name: civ, enabled: false });
         }
      }

      // Save to the DB
      playerProfile = await new profilesSchema({
         userId: interaction.member.user.id,
         profiles: [
            {
               name: "Profile 1",
               default: true,
               civs: defaultConfig,
            },
         ],
      }).save();
   }

   // Format the available profiles into the select menu options format
   const options = [];
   let selectedProfile;
   const defaultProfile = (await interaction.guild.emojis.cache.find((emoji) => emoji.name === "default")?.toString()) || "❔";
   const notDefaultProfile = (await interaction.guild.emojis.cache.find((emoji) => emoji.name === "profile")?.toString()) || "❔";
   for (const profile of playerProfile.profiles) {
      let item = {
         label: profile.name,
         value: profile.name,
         emoji: notDefaultProfile,
      };

      // Check if the profile if the default profile
      if (profile.default || playerProfile.profiles.length === 1) {
         item = {
            default: true,
            label: `${profile.name} - (default)`,
            value: profile.name,
            emoji: defaultProfile,
         };
         selectedProfile = item;
      }

      options.push(item);
   }

   // The embed
   const embed = new EmbedBuilder()
      .setColor(0xd7a35f)
      .setDescription(
         `**Please select a profile before completing any actions.**\n\nYou have a total of \`${playerProfile.profiles.length} profile${
            playerProfile.profiles.length > 1 ? "s" : ""
         }\`.`
      );

   // The Select menu to select a profile
   const selectProfile = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
         .setCustomId("set-select-profile")
         .setPlaceholder("Select profile")
         .setOptions(options.length !== 0 ? options : [{ label: "Failed to fetch profiles", value: null }])
   );

   // The buttons
   const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("create-profile").setLabel("Create new profile").setStyle(ButtonStyle.Success).setDisabled(false),
      new ButtonBuilder().setCustomId("edit-civs").setLabel("Edit Civs").setStyle(ButtonStyle.Primary).setDisabled(!selectedProfile),
      new ButtonBuilder().setCustomId("edit-profile").setLabel("Edit Profile").setStyle(ButtonStyle.Secondary).setDisabled(!selectedProfile)
   );

   if (action[0] === "back") {
      return interaction.update({
         embeds: [embed],
         components: [selectProfile, buttons],
         ephemeral: true,
      });
   }

   interaction.reply({
      embeds: [embed],
      components: [selectProfile, buttons],
      ephemeral: true,
   });
};
