const { EventEmitter } = require("events");

module.exports = class WallOfShameManager extends EventEmitter {
   constructor() {
      super();

      // Initialize the cache
      this.cache = new Map();

      // Run the scripts
      this.watchVotes();
   }

   /**
    * Start a new Wall of Shame entry
    * @param {string} userId The nominated user
    * @param {string} reason The reason for the wall of shame submission
    * @param {string[]} councilIds All the members who must vote
    */
   initShame(userId, reason, councilIds) {
      this.cache.set(userId, { userId, reason, votes: councilIds.map((id) => ({ userId: id, vote: null })) });
   }

   /**
    * Register a vote for the wall of shame nominee
    * @param {string} userId The nominated user
    * @param {string} voterId The user who has voted
    * @param {boolean} vote Has the user voted for the shame or against it
    */
   vote(userId, voterId, vote) {
      // Get the vote data
      let item = this.cache.get(userId);

      // Make the changes to the vote
      item = {
         ...item,
         votes: [...item.votes.filter((i) => i.userId !== voterId), { userId: voterId, vote }],
      };

      // Cache the new submission
      this.cache.set(userId, item);

      // Send out the vote event
      this.emit("vote", item);

      return item;
   }

   /**
    * Listen to the vote event to determine if the vote has been completed
    */
   watchVotes() {
      this.on("vote", (item) => {
         if (item.votes.filter((vote) => vote.vote === false)?.length) {
            console.log("Someone voted no, the submission has been voided");
         } else if (item.votes.filter((vote) => vote.vote === true)?.length === item.votes.length) {
            console.log("Everyone has voted yes for this submission");
         } else {
            console.log("Voting is still in progress");
         }
      });
   }
};
