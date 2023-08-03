const PlayerManager = require("./PlayerManager");

module.exports = async (_, client) => {
   return;
   const memberIds = [
      "526782947123134465",
      "709375696471851008",
      "469166823427014661",
      "695923736196677652",
      // "709375696471851008",
      // "526782947123134465",
      // "469166823427014661",
      // "456172912605397013",
      // "509807733277720586",
      // "695923736196677652",
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

   const result = await PlayerManager.generateTeams();

   console.log("TEAM 1");
   for (const id of result.team1.ids) {
      const user = await client.users.fetch(id).then((user) => user);
      console.log(user.username);
   }

   console.log();

   console.log("TEAM 2");
   for (const id of result.team2.ids) {
      const user = await client.users.fetch(id).then((user) => user);
      console.log(user.username);
   }

   // console.log(result.team1.ids);
   // console.log(result.team2.ids);
   // await PlayerManager.completeMatch(2);
};
