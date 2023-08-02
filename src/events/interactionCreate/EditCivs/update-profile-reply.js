const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const civs = require("../../../util/civs");
const profilesSchema = require("../../../schemas/profiles.schema");

module.exports = async (interaction, instance) => {
   // Update the menu
   if (interaction.customId !== "select-civ") {
      return;
   }

   const profile = await profilesSchema.findOne({
      userId: interaction.member.user.id,
   });

   if (!profile) {
      interaction.update({ content: "❌ - Failed to fetch data from the database." });
   }

   // Get the raw profile data
   let selectedProfile = interaction.message.embeds[0].data.description.split(/\n/g)[0].split("");
   const index = selectedProfile.indexOf(">");

   // Update the selected profile
   selectedProfile = selectedProfile.splice(index + 2, selectedProfile.length - index).join("");
   selectedProfile = profile.profiles.filter((profile) => profile.name === selectedProfile)[0];

   // Get the config for which civs are enabled and disabled
   const config = selectedProfile.civs.filter((civ) => civ.name === interaction.values[0])[0];

   const enabled = config.enabled;

   // Generate the available civs
   const options = [];
   for (const civ of civs) {
      const emoji = await interaction.guild.emojis.cache.find((emoji) => emoji.name === civ);

      let data = {
         label: civ,
         value: civ,
         emoji: emoji ? emoji.toString() : "❔",
      };

      if (civ === interaction.values[0]) {
         data = {
            default: true,
            ...data,
         };
      }

      options.push(data);
   }

   // The select menu
   const listedCivs = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder().setCustomId("select-civ").setPlaceholder("Select civilization").setOptions(options)
   );

   // Buttons
   const newButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("enable-civ").setLabel(`Enable ${interaction.values[0]}`).setStyle(ButtonStyle.Primary).setDisabled(!!enabled),
      new ButtonBuilder().setCustomId("disable-civ").setLabel(`Disable ${interaction.values[0]}`).setStyle(ButtonStyle.Danger).setDisabled(!enabled),
      new ButtonBuilder().setCustomId("back_select-profile").setLabel("Back").setStyle(ButtonStyle.Secondary).setDisabled(false)
   );

   return interaction.update({ components: [listedCivs, newButtons] });
};
