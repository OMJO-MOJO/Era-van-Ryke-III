const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
   embeds: [
      new EmbedBuilder()
         .setAuthor({
            name: "Age of Empires III Definitive Edition",
            iconURL: "https://imgur.com/1MajwGn.png",
            url: "https://store.steampowered.com/app/933110/Age_of_Empires_III_Definitive_Edition/",
         })
         .setDescription(
            "Please use the buttons below to manage matches\n\n**__Latest Patch Notes__**\n\n- *I don't even know what changed, just check the previous patch notes using the link below.*\n\n*[View previous changes](https://github.com/OMJO-MOJO/Era-van-Ryke-III/commits/main)*"
         )
         .setColor(0xd7a35f),
   ],
   components: [
      new ActionRowBuilder().addComponents(
         new ButtonBuilder().setCustomId("create-new-match").setLabel("Create new match").setStyle(ButtonStyle.Success).setDisabled(false),
         new ButtonBuilder().setCustomId("select-profile").setLabel("Profiles").setStyle(ButtonStyle.Primary),
         new ButtonBuilder().setCustomId("display-leaderboard").setLabel("Leaderboard").setStyle(ButtonStyle.Secondary),
         new ButtonBuilder().setCustomId("wall-of-shame-init").setLabel("Vote of Shame").setStyle(ButtonStyle.Secondary)
      ),
   ],
};
