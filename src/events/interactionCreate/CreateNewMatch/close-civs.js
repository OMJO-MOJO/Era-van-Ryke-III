module.exports = (interaction, instance) => {
   if (interaction.customId !== "close-civs") {
      return;
   }

   // TODO: Enable the Create New Match button

   interaction.message.delete();
};
