const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require("discord.js");
const civs = require("../../../util/civs");
const { standard } = require("../../../util/civs");
const profilesSchema = require("../../../schemas/profiles.schema");

// Cache the options
let listedCivs;
let enabledEmoji;
let disabledEmoji;

module.exports = async (interaction, instance) => {
   if (interaction.customId !== "create-profile") {
      return;
   }

   // Cache the select menu
   if (!listedCivs) {
      const options = [];
      for (const civ of civs) {
         const emoji = await interaction.guild.emojis.cache.find((emoji) => emoji.name === civ);

         options.push({
            label: civ,
            value: civ,
            emoji: emoji ? emoji.toString() : "❔",
         });
      }

      listedCivs = new ActionRowBuilder().addComponents(
         new StringSelectMenuBuilder()
            .setCustomId("select-civ")
            .setPlaceholder("Select civilization")
            .setOptions(options.length !== 0 ? options : [{ label: "Failed to fetch civilizations", value: null }])
      );
   }

   // Cache the emojis
   if (!enabledEmoji) {
      enabledEmoji = await interaction.guild.emojis.cache.find((emoji) => emoji.name === "enabled")?.toString();
   }

   // Cache the emojis
   if (!disabledEmoji) {
      disabledEmoji = await interaction.guild.emojis.cache.find((emoji) => emoji.name === "disabled")?.toString();
   }

   // Fetch the user's profile from the database
   let playerProfile = await profilesSchema.findOne({
      userId: interaction.member.user.id,
   });

   // If no results were found, create a default setup
   if (!playerProfile) {
      return interaction.reply({
         content: "❌ - Failed to fetch from database.",
         ephemeral: true,
      });
   }

   // Get all the default enabled civs
   const defaultConfig = [];
   for (const civ of civs) {
      // Enabled all standard civs and disable all DLC civs
      if (standard.includes(civ)) {
         defaultConfig.push({ name: civ, enabled: true });
      } else {
         defaultConfig.push({ name: civ, enabled: false });
      }
   }

   // Push all the taken names
   const names = [];
   for (const profile of playerProfile.profiles) {
      names.push(profile.name);
   }

   // Find the next possible name
   let i = 1;
   let name = null;
   while (!name) {
      const query = `Profile ${i}`;
      if (!names.includes(query)) {
         name = query;
      } else {
         i++;
      }
   }

   const profile = {
      name,
      default: false,
      civs: defaultConfig,
   };

   // Update the player's profiles
   await profilesSchema.updateOne({ userId: interaction.member.user.id }, { $push: { profiles: profile } });

   // Generate output for the user
   let toggledCivs = "";
   for (const civ of profile.civs) {
      const { name, enabled } = civ;
      const flag = await interaction.guild.emojis.cache.find((emoji) => emoji.name === name);

      toggledCivs += `${enabled ? enabledEmoji : disabledEmoji} - ${flag ? flag.toString() : "❔"} ${name}\n`;
   }

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
      .setDescription(
         `**Profile: **${profileEmoji} ${profile.name}\n\n*Enable or disable civilization from your random selection:*\n\n${toggledCivs}`
      );

   // The buttons
   const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("enable-civ").setLabel("Enable civilization").setStyle(ButtonStyle.Primary).setDisabled(true),
      new ButtonBuilder().setCustomId("disable-civ").setLabel("Disable civilization").setStyle(ButtonStyle.Danger).setDisabled(true),
      new ButtonBuilder().setCustomId("back_select-profile").setLabel("back").setStyle(ButtonStyle.Secondary)
   );

   interaction.update({
      content: `${enabledEmoji} - **${profile.name}** has been created`,
      embeds: [embed],
      components: [listedCivs, buttons],
      ephemeral: true,
   });

   setTimeout(() => {
      interaction.editReply({
         content: "",
      });
   }, 5000);
};
