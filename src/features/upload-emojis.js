const fs = require("fs");
const path = require("path");

module.exports = async (instance, client) => {
   // Fetch all the flags
   const flagsDir = path.resolve("./public/flags");
   const flags = fs.readdirSync(flagsDir);

   for (const [guildId, guild] of client.guilds.cache) {
      for (const flag of flags) {
         const emoji = guild.emojis.cache.find((emoji) => emoji.name === flag.replace(".png", ""));

         if (emoji) {
            continue;
         }

         await guild.emojis.create({ attachment: path.join(flagsDir, flag), name: flag.replace(".png", "") }).catch(() => null);
      }
   }
};
