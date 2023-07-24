module.exports = (interaction, instance) => {
   if (interaction.customId !== "close-civs") {
      return;
   }

   interaction.message.delete();
};
