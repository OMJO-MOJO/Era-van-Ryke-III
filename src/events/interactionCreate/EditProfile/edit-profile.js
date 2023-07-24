const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const civs = require("../../../util/civs");
const { standard } = require("../../../util/civs");
const profiles = require("../../../schemas/profiles.schema");

// Cache the options
let listedCivs;
let enabledEmoji;
let disabledEmoji;

module.exports = async (interaction, instance) => {
   // The first message
   if (interaction.customId !== "edit-profile") {
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
   let profile = await profiles.findOne({
      userId: interaction.member.user.id,
   });

   // If no results were found, create a default setup
   if (!profile) {
      const defaultConfig = [];
      for (const civ of civs) {
         // Enabled all standard civs and disable all DLC civs
         if (standard.includes(civ)) {
            defaultConfig.push({ name: civ, enabled: true });
         } else {
            defaultConfig.push({ name: civ, enabled: false });
         }
      }

      // Save to the DB
      profile = await new profiles({
         userId: interaction.member.user.id,
         civs: defaultConfig,
      }).save();
   }

   // Generate output for the user
   let toggledCivs = "";
   for (const civ of profile.civs) {
      const { name, enabled } = civ;
      const flag = await interaction.guild.emojis.cache.find((emoji) => emoji.name === name);

      toggledCivs += `${enabled ? enabledEmoji : disabledEmoji} - ${flag ? flag.toString() : "❔"} ${name}\n`;
   }

   // The embed
   const embed = new EmbedBuilder()
      .setColor(0xd7a35f)
      .setDescription(
         `**Enable or disable civilization from your random selection:**\n> By default, all civilization from a DLC will be disabled.\n\n${toggledCivs}`
      );

   // The buttons
   const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("enable-civ").setLabel("Enable civilization").setStyle(ButtonStyle.Primary).setDisabled(true),
      new ButtonBuilder().setCustomId("disable-civ").setLabel("Disable civilization").setStyle(ButtonStyle.Danger).setDisabled(true)
   );

   interaction.reply({
      embeds: [embed],
      components: [listedCivs, buttons],
      ephemeral: true,
   });
};
