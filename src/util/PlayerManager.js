const profilesSchema = require("../schemas/profiles.schema");
const civs = require("../util/civs");

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

      let profile;
      let totalCivs = civs.standard.length;

      // Fetch from the database
      let playerProfile = await profilesSchema.findOne({ userId: member.user.id });
      if (playerProfile) {
         // Set the player's default profile
         profile = playerProfile.profiles.filter((profile) => profile.default)[0];
      } else {
         // Create a new player profile
         const defaultConfig = [];
         for (const civ of civs) {
            // Enabled all standard civs and disable all DLC civs
            if (civs.standard.includes(civ)) {
               defaultConfig.push({ name: civ, enabled: true });
            } else {
               defaultConfig.push({ name: civ, enabled: false });
            }
         }

         // Save to the DB
         playerProfile = await new profilesSchema({
            userId: member.user.id,
            profiles: [
               {
                  name: "Profile 1",
                  default: true,
                  civs: defaultConfig,
               },
            ],
         }).save();
      }

      if (!profile) {
         profile = playerProfile.profiles[0];
      }

      // Get the enabled civs for the player
      totalCivs = profile.civs.filter((civ) => civ.enabled === true)?.length;

      // Add the player to the list
      this._players.set(member.user.id, { member, profile, civ: null, totalCivs: totalCivs });
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
         this._players.set(userId, { member: player.member, profile: player.profile, civ: null, totalCivs: player.totalCivs });
      }
   }

   async generateCivs() {
      // Generate civs for each player

      /*
         In order to fairly generate civs without mirror matches, we need to sort the players from who has he lowest civs enabled to the highest to ensure that players who only have a few civs gain 1st prefernce.
         This is so because players with a higher selection can randomly get different civs more often than other players who will rarely get a different nation if they cannot get a random civ becaise of mirror matches.
         There is probably a better way of achieving this but it's 2am and I'm tired, but it works.
      */

      if (this._players.size === 0) {
         return null;
      }

      // Reset the players' civ
      this.resetCivs();

      // Generate a list of players to sort
      const playerList = [];
      for (const [userId, player] of this._players) {
         // Make sure that the player's profile is up to date
         const playerProfile = await profilesSchema.findOne({ userId: player.member.user.id });
         if (playerProfile) {
            // Get the profile of the player
            player.profile = playerProfile.profiles.filter((profile) => profile.default)[0];
            player.totalCivs = player.profile.civs.filter((civ) => civ.enabled).length;

            // Update the player
            this._players.set(userId, player);
         }

         // Get the enabled civs for the player
         const availableCivs = player.profile.civs.filter((civ) => civ.enabled === true);

         playerList.push({ player, civs: availableCivs });
      }

      // Sort the player list
      playerList.sort((a, b) => a.civs.length - b.civs.length);

      // Generate a civ for each player in the list
      for (const member of playerList) {
         const { player, civs } = member;

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
               this.setCiv(player.member.user.id, possibleCiv);
            }
         }
      }

      return this._players;
   }
}

module.exports = PlayerManager;
