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

   let profile = await profilesSchema.findOne({ userId: interaction.member.user.id });
   if (!profile) {
      return interaction.upate("❌ - Failed to fetch from the database.");
   }

   const newCivList = [];
   for (const civ of profile.civs) {
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

   // Save to the databse
   profile = await profilesSchema.findOneAndUpdate(
      {
         userId: interaction.member.user.id,
      },
      {
         userId: interaction.member.user.id,
         civs: newCivList,
      },
      {
         upsert: true,
         new: true,
      }
   );

   // Generate output for the user
   let toggledCivs = "";
   for (const civ of profile.civs) {
      const { name, enabled } = civ;
      const flag = await interaction.guild.emojis.cache.find((emoji) => emoji.name === name);

      toggledCivs += `${enabled ? enabledEmoji : disabledEmoji} - ${flag ? flag.toString() : "❔"} ${name}\n`;
   }

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

   interaction.update({
      embeds: [embed],
      components: [listedCivs, buttons],
   });
};
