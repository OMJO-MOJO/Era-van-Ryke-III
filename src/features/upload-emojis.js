const fs = require("fs");
const path = require("path");

module.exports = async (instance, client) => {
   // Fetch all the flags
   const flagsDir = path.resolve("./public/flags");
   const flags = fs.readdirSync(flagsDir);

   // Add flags to emoji lists for current guilds
   for (const [_, guild] of client.guilds.cache) {
      for (const flag of flags) {
         const emoji = guild.emojis.cache.find((emoji) => emoji.name === flag.replace(".png", "").replace(".gif", ""));

         if (emoji) {
            continue;
         }

         // Upload the emoji
         await guild.emojis.create({ attachment: path.join(flagsDir, flag), name: flag.replace(".png", "").replace(".gif", "") }).catch(() => null);
      }

      // Upload the enabled and disabled emojis
      const emojisDir = path.resolve("./public/emojis");
      const emojis = fs.readdirSync(emojisDir);

      for (const emoji of emojis) {
         const isEmoji = !!guild.emojis.cache.find((e) => e.name === emoji.replace(".png", "").replace(".gif", ""));

         if (isEmoji) {
            continue;
         }

         // Upload the emoji
         await guild.emojis
            .create({ attachment: path.join(emojisDir, emoji), name: emoji.replace(".png", "").replace(".gif", "") })
            .catch(() => null);
      }
   }

   // Add flags to emoji lists for the new guild
   client.on("guildCreate", async (guild) => {
      // upload the flags
      for (const flag of flags) {
         const emoji = guild.emojis.cache.find((emoji) => emoji.name === flag.replace(".png", "").replace(".gif", ""));

         if (emoji) {
            continue;
         }

         await guild.emojis.create({ attachment: path.join(flagsDir, flag), name: flag.replace(".png", "").replace(".gif", "") }).catch(() => null);
      }

      // Upload the enabled and disabled emojis
      const emojisDir = path.resolve("./public/emojis");
      const emojis = fs.readdirSync(emojisDir);

      for (const emoji of emojis) {
         const isEmoji = !!guild.emojis.cache.find((e) => e.name === emoji.replace(".png", "").replace(".gif", ""));

         if (isEmoji) {
            continue;
         }

         // Upload the emoji
         await guild.emojis
            .create({ attachment: path.join(emojisDir, emoji), name: emoji.replace(".png", "").replace(".gif", "") })
            .catch(() => null);
      }
   });
};
