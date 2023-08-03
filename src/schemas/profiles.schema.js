const { Schema, model, models } = require("mongoose");

const profileSchema = new Schema({
   // Primary Key - The user's ID
   userId: {
      type: String,
      required: true,
   },

   // The player's ranking, used for skill based matchmaking
   rating: {
      mu: {
         type: Number,
         required: true,
         default: 25,
      },
      sigma: {
         type: Number,
         required: true,
         default: 25 / 3,
      },
   },

   // The different profiles the user may create
   profiles: [
      {
         name: {
            type: String,
            required: true,
         },
         default: {
            type: Boolean,
            required: true,
            default: false,
         },
         civs: [
            {
               name: {
                  type: String,
                  required: true,
               },

               enabled: {
                  type: Boolean,
                  required: false,
                  default: true,
               },
            },
         ],
      },
   ],
});

const name = "player-profiles";
// const name = "test-profiles";
module.exports = models[name] || model(name, profileSchema);
