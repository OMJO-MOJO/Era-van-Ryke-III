const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = (instance, client) => {
   client.on("messageCreate", (message) => {
      if (message.content === `<@${client.user.id}>`) {
         message.delete().catch(() => null);
         message.channel.send({
            embeds: [
               new EmbedBuilder()
                  .setAuthor({
                     name: "Age of Empires III Definitive Edition",
                     iconURL: "https://imgur.com/1MajwGn.png",
                     url: "https://store.steampowered.com/app/933110/Age_of_Empires_III_Definitive_Edition/",
                  })
                  .setDescription("Please use the buttons below to manage matches")
                  .setColor(0xd7a35f),
            ],
            components: [
               new ActionRowBuilder().addComponents(
                  new ButtonBuilder().setCustomId("create-new-match").setLabel("Create new match").setStyle(ButtonStyle.Success),
                  new ButtonBuilder().setCustomId("edit-profile").setLabel("Edit Profile").setStyle(ButtonStyle.Primary)
               ),
            ],
         });
      }
   });
};
