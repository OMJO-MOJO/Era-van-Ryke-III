const profilesSchema = require("../schemas/profiles.schema");
const { standard } = require("../util/civs");

class PlayerManager {
   constructor() {
      // <userId, { member, civ, totalCivs }>
      this._players = new Map();
      this._unavailableCivs = [];
   }

   get players() {
      return this._players;
   }

   clearPlayers() {
      this._players = new Map();
      this._unavailableCivs = [];
   }

   async addPlayer(member) {
      if (!member) {
         throw new Error('The "member" field is required.');
      }

      let totalCivs = standard.length;

      // Fetch from the database
      const profile = await profilesSchema.findOne({ userId: member.user.id });
      if (profile) {
         // Get the enabled civs for the player
         totalCivs = profile.civs.filter((civ) => civ.enabled === true)?.length;
      }

      // Add the player to the list
      this._players.set(member.user.id, { member, civ: null, totalCivs: totalCivs });
   }

   removePlayer(id) {
      if (!id) {
         throw new Error('The "member" field is required.');
      }

      // Remove the player from the list
      this._players.delete(id);
   }

   setCiv(memberId, civ) {
      if (!memberId) {
         throw new Error("The member ID is a required field");
      }

      if (!civ) {
         throw new Error("The member civ is a required field");
      }

      // Set the civ's availability to false
      this._unavailableCivs.push(civ.name);

      const player = this._players.get(memberId);
      if (!player) {
         return;
      }

      player.civ = civ;

      this._players.set(memberId, player);
   }

   resetCivs() {
      this._unavailableCivs = [];

      // Loop through all players and set their civs to null
      for (const [userId, player] of this._players) {
         this._players.set(userId, { member: player.member, civ: null, totalCivs: player.totalCivs });
      }
   }

   async generateCivs() {
      // Generate civs for each player

      /*
         In order to fairly generate civs without mirror matches, we need to sort the players from who has he lowest civs enabled to the highest to ensure that players who only have a few civs gain 1st prefernce.
         This is so because players with a higher selection can randomly get different civs more often than other players who will rarely get a different nation if they cannot get a random civ becaise of mirror matches.
         There is probably a better way of achieving this but it's 2am and I'm tired, but it works.
      */

      // Reset the players' civ
      this.resetCivs();

      // Generate a list of players to sort
      const playerList = [];
      for (const [userId, member] of this._players) {
         // Get the user's profile from the database
         const profile = await profilesSchema.findOne({ userId });

         // The player does not have a config saved to their profile, thus any random nation will be selected
         if (!profile) {
            // Format the standard civs into the required format
            const formatedStandard = [];
            for (const civ of standard) {
               formatedStandard.push({ name: civ });
            }

            playerList.push({ member, civs: formatedStandard });
            continue;
         }

         // Get the enabled civs for the player
         const availableCivs = profile.civs.filter((civ) => civ.enabled === true);

         playerList.push({ member, civs: availableCivs });
      }

      // Sort the player list
      playerList.sort((a, b) => a.civs.length - b.civs.length);

      // Generate a civ for each player in the list
      for (const player of playerList) {
         const { member: aoeMember, civs } = player;
         const { member } = aoeMember;

         // Check for mirrors in the match
         let isMirror = true;
         while (isMirror) {
            // Generate a random number
            const randomNum = Math.floor(Math.random() * civs.length);

            // Get random civ
            const possibleCiv = civs[randomNum];

            // Check if the civ is available
            if (!this._unavailableCivs.includes(possibleCiv.name)) {
               isMirror = false;

               // Save the civ to the player in the cache
               this.setCiv(member.user.id, possibleCiv);
            }
         }
      }

      return this._players;
   }
}

module.exports = PlayerManager;
