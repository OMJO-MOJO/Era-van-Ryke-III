const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const civs = require("../../../util/civs");
const { standard } = require("../../../util/civs");
const profilesSchema = require("../../../schemas/profiles.schema");

// Cache the options
let listedCivs;
let enabledEmoji;
let disabledEmoji;

module.exports = async (interaction, instance) => {
   // The first message
   if (interaction.customId !== "edit-civs") {
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
      playerProfile = await new profilesSchema({
         userId,
         profiles: [
            {
               name: "Profile 1",
               default: true,
               civs: defaultConfig,
            },
         ],
      }).save();
   }

   // What profile the user selected
   const selectedProfile = interaction.message.components[0].components[0].data.options.filter((option) => option.default === true)[0]?.value;
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
         `**Profile: **${profileEmoji} ${profile.name}\n\n*Enable or disable civilization from your random selection:*\n\n${toggledCivs}`
      );

   // The buttons
   const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("enable-civ").setLabel("Enable civilization").setStyle(ButtonStyle.Primary).setDisabled(true),
      new ButtonBuilder().setCustomId("disable-civ").setLabel("Disable civilization").setStyle(ButtonStyle.Danger).setDisabled(true),
      new ButtonBuilder().setCustomId("back_select-profile").setLabel("Back").setStyle(ButtonStyle.Secondary).setDisabled(false)
   );

   interaction.update({
      embeds: [embed],
      components: [listedCivs, buttons],
      ephemeral: true,
   });
};
