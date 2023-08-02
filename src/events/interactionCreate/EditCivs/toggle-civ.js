const { EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder } = require("discord.js");
const profilesSchema = require("../../../schemas/profiles.schema");
const civs = require("../../../util/civs");

let listedCivs;
let enabledEmoji;
let disabledEmoji;

module.exports = async (interaction, instance) => {
   if (!["enable-civ", "disable-civ"].includes(interaction.customId)) {
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

   const selectedCiv = interaction.message.components[0].components[0].data.options.filter((option) => option.default === true)[0];

   let playerProfile = await profilesSchema.findOne({ userId: interaction.member.user.id });
   if (!playerProfile) {
      return interaction.upate("❌ - Failed to fetch from the database.");
   }

   // Get the raw profile data
   let selectedProfile = interaction.message.embeds[0].data.description.split(/\n/g)[0].split("");
   const index = selectedProfile.indexOf(">");

   // Update the selected profile
   selectedProfile = selectedProfile.splice(index + 2, selectedProfile.length - index).join("");
   selectedProfile = playerProfile.profiles.filter((profile) => profile.name === selectedProfile)[0];

   const newCivList = [];
   for (const civ of selectedProfile.civs) {
      const { name, enabled } = civ;

      let data = {
         name,
         enabled,
      };

      if (name === selectedCiv.value) {
         data.enabled = !enabled;
      }

      newCivList.push(data);
   }

   const profiles = [];
   for (const profile of playerProfile.profiles) {
      const { name, default: defaultProfile, civs } = profile;

      let data = {
         name,
         default: defaultProfile,
         civs,
      };

      if (name === selectedProfile.name) {
         data.civs = newCivList;
      }

      profiles.push(data);
   }

   // Save to the databse
   playerProfile = await profilesSchema.findOneAndUpdate(
      {
         userId: interaction.member.user.id,
      },
      {
         userId: interaction.member.user.id,
         profiles,
      },
      {
         upsert: true,
         new: true,
      }
   );

   // Update the cache from the database
   selectedProfile = playerProfile.profiles.filter((profile) => profile.name === selectedProfile.name)[0];

   // Generate output for the user
   let toggledCivs = "";
   for (const civ of selectedProfile.civs) {
      const { name, enabled } = civ;

      const flag = await interaction.guild.emojis.cache.find((emoji) => emoji.name === name);

      toggledCivs += `${enabled ? enabledEmoji : disabledEmoji} - ${flag ? flag.toString() : "❔"} ${name}\n`;
   }

   // Find the correct emoji for the profile
   const profileEmoji = await interaction.guild.emojis.cache
      .find((emoji) => {
         if (selectedProfile.default) {
            return emoji.name === "default";
         } else {
            return emoji.name === "profile";
         }
      })
      ?.toString();

   const embed = new EmbedBuilder()
      .setColor(0xd7a35f)
      .setDescription(
         `**Profile: **${profileEmoji} ${selectedProfile.name}\n\n*Enable or disable civilization from your random selection:*\n\n${toggledCivs}`
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
   });
};
