const { Schema, model, models } = require("mongoose");

const profiles = new Schema({
   userId: {
      type: String,
      required: true,
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
});

const name = "profiles";
module.exports = models[name] || model(name, profiles);
