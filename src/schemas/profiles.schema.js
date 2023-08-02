const { Schema, model, models } = require("mongoose");

const profileSchema = new Schema({
   userId: {
      type: String,
      required: true,
   },

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
module.exports = models[name] || model(name, profileSchema);
