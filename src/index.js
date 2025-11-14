/*

   🔥 Repository: https://github.com/OMJO-MOJO/Era-van-Ryke-III

   📚 Documentation: TODO

*/

// Imports
const { Client, IntentsBitField } = require("discord.js");
const path = require("path");
const WOKCommands = require("wokcommands");
const config = require("./config.json");
const WallOfShameManager = require("./managers/WallOfShameManager");

// Register the environment variables
require("dotenv").config();

// Create a new client instance
const client = new Client({
   intents: [
      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.GuildMessages,
      IntentsBitField.Flags.MessageContent,
      IntentsBitField.Flags.GuildMembers,
      IntentsBitField.Flags.GuildVoiceStates,
   ],
});

client.on("ready", async (c) => {
   c.wallOfShame = new WallOfShameManager();

   await new WOKCommands({
      client: c,
      mongoUri: process.env.MONGO_URI,
      defaultPrefix: "!",
      featuresDir: path.join(__dirname, "features"),
      testServers: config.testServerIds,
      botOwners: config.botOwnerIds,
      disabledDefaultCommands: [
         WOKCommands.DefaultCommands.ChannelCommand,
         WOKCommands.DefaultCommands.CustomCommand,
         WOKCommands.DefaultCommands.Prefix,
         WOKCommands.DefaultCommands.RequiredPermissions,
         WOKCommands.DefaultCommands.RequiredRoles,
         WOKCommands.DefaultCommands.ToggleCommand,
      ],
      events: {
         dir: path.join(__dirname, "events"),
      },
   });

   console.log(`${client.user.username} is ready`);
});

client.login(process.env.TOKEN);
