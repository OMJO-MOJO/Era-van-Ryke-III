const { ChannelType } = require("discord.js");
const config = require("../../config.json");

let SpanAId;
let SpanBId;

module.exports = (oldState, newState, instance) => {
   const guild = newState.guild || oldState.guild;

   // Check if a user has joined or left a voice channel
   const joined = !!newState.channelId && !oldState.channelId;
   const left = !!oldState.channelId && !newState.channelId;

   if (joined) {
      createChannels(guild);
   }

   if (left) {
      deleteChannels(guild);
   }
};

const createChannels = (guild) => {
   // Check if channels already exists
   const SpanA = guild.channels.cache.find((channel) => channel.name === "Span A");
   const SpanB = guild.channels.cache.find((channel) => channel.name === "Span B");

   // Create or update the Span A channel
   if (!SpanA) {
      guild.channels
         .create({
            name: "Span A",
            type: ChannelType.GuildVoice,
            parent: config.voiceChannelsId,
         })
         .then((channel) => (SpanAId = channel.id))
         .catch(() => null);
   } else SpanAId === SpanA.id;

   // Create or update the Span A channel
   if (!SpanB) {
      guild.channels
         .create({
            name: "Span B",
            type: ChannelType.GuildVoice,
            parent: config.voiceChannelsId,
         })
         .then((channel) => (SpanBId = channel.id))
         .catch(() => null);
   } else SpanBId === SpanB.id;
};

const deleteChannels = (guild) => {
   const General = guild.channels.cache.get(config.generalId);
   const SpanA = guild.channels.cache.find((channel) => channel.name === "Span A");
   const SpanB = guild.channels.cache.find((channel) => channel.name === "Span B");

   // Check if the channels are empty
   if (General.members.size === 0 && SpanA.members.size === 0 && SpanB.members.size === 0) {
      guild.channels.delete(SpanA.id).catch(() => null);
      guild.channels.delete(SpanB.id).catch(() => null);
   }
};
