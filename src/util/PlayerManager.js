const profilesSchema = require("../schemas/profiles.schema");
const { standard } = require("../util/civs");

class PlayerManager {
   constructor() {
      this.players = new Map();
   }

   clearPlayers() {
      this.players = new Map();
   }

   addPlayer(member) {
      if (!member) {
         throw new Error('The "member" field is required.');
      }

      // Add the player to the list
      this.players.set(member.user.id, member);
   }

   removePlayer(id) {
      if (!id) {
         throw new Error('The "member" field is required.');
      }

      // Remove the player from the list
      this.players.delete(id);
   }

   async generateCivs() {
      // Generate civs for each player
      const result = [];

      for (const [userId, member] of this.players) {
         const profile = await profilesSchema.findOne({ userId });

         // The player does not have a config saved to their profile, thus any random nation will be selected
         if (!profile) {
            // Generate a random number
            const randomNum = Math.floor(Math.random() * standard.length);

            // Save the output
            result.push({ member, civ: { name: standard[randomNum] } });
            continue;
         }

         // Get the enabled civs for the player
         const availableCivs = profile.civs.filter((civ) => civ.enabled === true);

         // Generate a random number
         const randomNum = Math.floor(Math.random() * availableCivs.length);

         // Save the output
         result.push({ member, civ: availableCivs[randomNum] });
      }

      return result;
   }
}

module.exports = PlayerManager;
