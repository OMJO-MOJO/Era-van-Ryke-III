const { rate, rating, predictDraw, ordinal, predictWin } = require("openskill");
const profilesSchema = require("../schemas/profiles.schema");
const civs = require("../util/civs");

class PlayerManager {
   constructor() {
      // <userId, { member, civ, totalCivs }>
      this._players = new Map();
      this._unavailableCivs = [];
      this._blacklistedMatches = []; // This is to prevent mirror matches
      this._team1 = {
         ids: [],
         rating: [],
      };
      this._team2 = {
         ids: [],
         rating: [],
      };
   }

   get players() {
      return this._players;
   }

   get team1() {
      return this._team1;
   }

   get team2() {
      return this._team2;
   }

   clearPlayers() {
      this._players = new Map();
      this._unavailableCivs = [];
   }

   resetTeams(teamNum = null) {
      // Reset the players
      for (const [userId, player] of this._players) {
         if (player.team === teamNum || !teamNum) {
            player.team = null;
            this._players.set(userId, player);
         }
      }

      // Reset the teams cache
      if (!teamNum || teamNum === 1) {
         this._team1 = {
            ids: [],
            rating: [],
         };
      }

      if (!teamNum || teamNum === 2) {
         this._team2 = {
            ids: [],
            rating: [],
         };
      }
   }

   resetAll() {
      this.clearPlayers();

      this._blacklistedMatches = [];

      this.resetTeams();
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
      this._players.set(member.user.id, { member, profile, rating: playerProfile.rating, civ: null, totalCivs: totalCivs, team: null });
   }

   async setTeam(userId, teamNum) {
      if (!userId) {
         throw new Error("The userId is required to set the player's team.");
      }

      if (!teamNum) {
         throw new Error("The teamNum is required to set the player's team.");
      }

      if (typeof teamNum !== "number") {
         throw new TypeError("The teamNum should be a number type.");
      }

      // Get the player
      const player = this._players.get(userId);

      // Check if the player exists
      if (!player) {
         return;
      }

      // Set the teamNum to the player
      player.team = teamNum;

      // Save the player to the cache
      this._players.set(userId, player);

      // Set the player to the correct team
      if (teamNum === 1) {
         this._team1.ids.push(userId);
         this._team1.rating.push(player.rating);
      } else if (teamNum === 2) {
         this._team2.ids.push(userId);
         this._team2.rating.push(player.rating);
      } else {
         throw new Error("Unable to find team, please make sure that there is only team 1 and 2.");
      }
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
         player.civ = null;

         this._players.set(userId, player);

         // this._players.set(userId, { member: player.member, profile: player.profile, civ: null, totalCivs: player.totalCivs });
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

   async generateTeams() {
      if (this._players.size < 2) {
         throw new Error("Cannot start a new game if there are less than 2 players.");
      }

      // Reset the cached teams
      this.resetTeams();

      const options = [];

      let attempts = 0;
      let foundAtLeast1Match = false;
      while (!foundAtLeast1Match && attempts < 25) {
         let i = 0;
         while (i < 25) {
            // Reset all the teams
            const team1Ids = [];
            const team2Ids = [];
            const team1Rating = [];
            const team2Rating = [];

            for (const [userId, player] of this._players) {
               // Check if the player has a rating
               if (!player.rating) {
                  // Generate a rating for the player
                  player.rating = rating();
                  // Update the player
                  this._players.set(userId, player);
               }

               // Generate a random number
               const randomNum = Math.floor(Math.random() * 2) + 1;

               // Assign the player to the correct team
               if (randomNum === 1) {
                  team1Ids.push(player.member.user.id);
                  team1Rating.push(player.rating);
               } else {
                  team2Ids.push(player.member.user.id);
                  team2Rating.push(player.rating);
               }
            }

            if (team1Rating.length === 0 || team2Rating.length === 0) {
               // No players in one of the teams
               continue;
            }

            // Check if the same game has been previously played
            let isBlacklisted = false;
            for (const match of this._blacklistedMatches) {
               const { team1, team2 } = match;

               if (isBlacklisted) {
                  continue;
               }

               if (
                  team1.includes(...team1Ids) &&
                  team1.length === team1Ids.length &&
                  team2.includes(...team2Ids) &&
                  team2.length === team2Ids.length
               ) {
                  isBlacklisted = true;
               }

               if (
                  team1.includes(...team2Ids) &&
                  team1.length === team2Ids.length &&
                  team2.includes(...team1Ids) &&
                  team2.length === team1Ids.length
               ) {
                  isBlacklisted = true;
               }
            }

            if (isBlacklisted) {
               i++;
               console.log("Preventing Mirror match, attempt:", attempts, ", Try:", i);
               continue;
            }

            // Check the probability of the teams drawing
            const prediction = predictDraw([team1Rating, team2Rating]);

            // Save the possible teams to the options array
            foundAtLeast1Match = true;
            options.push({
               prediction,
               team1: team1Ids,
               team1Rating,
               team2: team2Ids,
               team2Rating,
            });

            i++;
         }

         if (options.length === 0) {
            // Rain out of options and have to create mirror match
            this._blacklistedMatches = [];
            attempts = 0;
            continue;
         }

         attempts++;
      }

      // Sort the results to the highest prediction to draw to get the best even match
      options.sort((a, b) => b.prediction - a.prediction);

      // The best result
      const result = options[0];

      // Assign the team to the cached teams
      this._team1 = { ids: result.team1, rating: result.team1Rating };
      this._team2 = { ids: result.team2, rating: result.team2Rating };

      // Cache the match to the blacklisted matches to prevent mirror matches
      this._blacklistedMatches.push({ team1: this._team1.ids, team2: this._team2.ids });

      // Remove the oldest match to cycle through them again
      if (this._blacklistedMatches.length >= 5) {
         console.log("Removing a blacklisted match");
         this._blacklistedMatches.shift();
      }

      return { team1: this._team1, team2: this._team2 };
   }

   async updateRankings(winningTeamNum) {
      // Adjust all the ratings of all the players
      let winningTeam = null;
      let losingTeam = null;

      // Check which team won
      if (winningTeamNum === 1) {
         winningTeam = { ids: this._team1.ids, rating: this._team1.rating };
         losingTeam = { ids: this._team2.ids, rating: this._team2.rating };
      } else if (winningTeamNum === 2) {
         winningTeam = { ids: this._team2.ids, rating: this._team2.rating };
         losingTeam = { ids: this._team1.ids, rating: this._team1.rating };
      } else {
         throw new Error("Please specify a team number between 1 and 2.");
      }

      const [winningTeamResults, losingTeamResults] = rate([winningTeam.rating, losingTeam.rating]);

      // Update the ratings of the winners
      for (let i = 0; i < winningTeam.ids.length; i++) {
         await profilesSchema.updateOne({ userId: winningTeam.ids[i] }, { rating: winningTeamResults[i] });
      }

      // Update the ratings of the losers
      for (let i = 0; i < losingTeam.ids.length; i++) {
         await profilesSchema.updateOne({ userId: losingTeam.ids[i] }, { rating: losingTeamResults[i] });
      }

      // Reset all the caches because the match was compelte
      this.resetAll();
   }

   async getRankings() {
      // Get all the profiles from the database
      const results = await profilesSchema.find({});

      if (!results) {
         return null;
      }

      // Get their rankings and store it in an array for sorting
      const rankings = [];
      for (const result of results) {
         const rating = ordinal(result.rating);

         rankings.push({
            userId: result.userId,
            rating,
         });
      }

      // Sort the rankings from 1st to last
      return rankings.sort((a, b) => b.rating - a.rating);
   }

   async predictWin() {
      return predictWin([this._team1.rating, this._team2.rating]);
   }
}

module.exports = PlayerManager;
