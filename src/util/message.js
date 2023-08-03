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
            "Please use the buttons below to manage matches\n\n**__Latest Patch Notes__**\n\n- *Added skill-based matchmaking*\n- *Everyone's rating will be the same in the begining but once the bot gains information about the players' rating, it will generate more accurate matches.*\n - *Please be careful and honest when selecting the winning team as incorrect values will decrease the quality of the matchmaking as it alters players' ratings.*\n\n*[View previous changes](https://github.com/OMJO-MOJO/Era-van-Ryke-III/commits/main)*"
         )
         .setColor(0xd7a35f),
   ],
   components: [
      new ActionRowBuilder().addComponents(
         new ButtonBuilder().setCustomId("create-new-match").setLabel("Create new match").setStyle(ButtonStyle.Success),
         new ButtonBuilder().setCustomId("select-profile").setLabel("Profiles").setStyle(ButtonStyle.Primary)
      ),
   ],
};
