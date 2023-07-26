const fs = require("fs");
const path = require("path");

module.exports = async (instance, client) => {
   // Fetch all the flags
   const flagsDir = path.resolve("./public/flags");
   const flags = fs.readdirSync(flagsDir);

   // Add flags to emoji lists for current guilds
   for (const [guildId, guild] of client.guilds.cache) {
      for (const flag of flags) {
         const emoji = guild.emojis.cache.find((emoji) => emoji.name === flag.replace(".png", ""));

         if (emoji) {
            continue;
         }

         // Upload the emoji
         await guild.emojis.create({ attachment: path.join(flagsDir, flag), name: flag.replace(".png", "") }).catch(() => null);
      }

      // Upload the enabled and disabled emojis
      const publicDir = path.resolve("./public");

      // Enabled Emoji
      const enabledEmojiDir = path.join(publicDir, "enabled.png");
      const enabledEmoji = guild.emojis.cache.find((emoji) => emoji.name === "enabled");
      if (!enabledEmoji) {
         await guild.emojis.create({ attachment: enabledEmojiDir, name: enabledEmojiDir.replace(".png", "") }).catch(() => null);
      }

      // Disabled emoji
      const disabledEmojiDir = path.join(publicDir, "disabled.png");
      const disabledEmoji = guild.emojis.cache.find((emoji) => emoji.name === "disabled");
      if (!disabledEmoji) {
         await guild.emojis.create({ attachment: disabledEmojiDir, name: disabledEmojiDir.replace(".png", "") }).catch(() => null);
      }
   }

   // Add flags to emoji lists for the new guild
   client.on("guildCreate", async (guild) => {
      // upload the flags
      for (const flag of flags) {
         const emoji = guild.emojis.cache.find((emoji) => emoji.name === flag.replace(".png", ""));

         if (emoji) {
            continue;
         }

         await guild.emojis.create({ attachment: path.join(flagsDir, flag), name: flag.replace(".png", "") }).catch(() => null);
      }

      // Upload the enabled and disabled emojis
      const publicDir = path.resolve("./public");

      // Enabled Emoji
      const enabledEmojiDir = path.join(publicDir, "enabled.png");
      const enabledEmoji = guild.emojis.cache.find((emoji) => emoji.name === "enabled");
      if (!enabledEmoji) {
         await guild.emojis.create({ attachment: enabledEmojiDir, name: enabledEmojiDir.replace(".png", "") }).catch(() => null);
      }

      // Disabled emoji
      const disabledEmojiDir = path.join(publicDir, "disabled.png");
      const disabledEmoji = guild.emojis.cache.find((emoji) => emoji.name === "disabled");
      if (!disabledEmoji) {
         await guild.emojis.create({ attachment: disabledEmojiDir, name: disabledEmojiDir.replace(".png", "") }).catch(() => null);
      }
   });
};
