const PlayerManager = require("./PlayerManager");

module.exports = async (_, client) => {
   // Preform Tests here
   return;

   const memberIds = [
      "526782947123134465",
      "709375696471851008",
      "469166823427014661",
      "695923736196677652",
      "456172912605397013",
      // "509807733277720586",
      // "460152271284469760",
      // "335783352995151872",
   ];

   for (const memberId of memberIds) {
      const member = await client.users.fetch(memberId).then((user) => {
         return { user };
      });

      if (!member) {
         console.error("No member was found using the id of", memberId);
         continue;
      }

      await PlayerManager.addPlayer(member);
   }

   const teams = await PlayerManager.generateTeams();

   console.log("TEAM 1");
   for (const id of teams.team1.ids) {
      const user = await client.users.fetch(id).then((user) => user);
      console.log(user.username);
   }

   console.log();

   console.log("TEAM 2");
   for (const id of teams.team2.ids) {
      const user = await client.users.fetch(id).then((user) => user);
      console.log(user.username);
   }

   const result = await PlayerManager.predictWin();

   const [team1, team2] = result;

   const predictedWinningTeamNum = team1 > team2 ? 1 : 2;

   console.log("Predicted Winner:", predictedWinningTeamNum);
};
