module.exports = (instance, client) => {
   process.on("unhandledRejection", (reason, p) => {
      console.log("unhandledRejection p", p);
      console.log(reason);
      // if (reason.requestBody?.json?.embeds?.length) {
      //    console.log("Embed:", reason.requestBody?.json?.embeds[0] || null);
      // }
   });

   process.on("uncaughtException", (err, origin) => {
      console.log("uncaughtException err", err);
      console.log("uncaughtException origin", origin);
   });

   process.on("uncaughtExceptionMonitor", (err, origin) => {
      console.log("uncaughtExceptionMonitor err", err);
      console.log("uncaughtExceptionMonitor origin", origin);
   });

   client.on("error", (error) => {
      console.log("CLIENT ERROR");
      console.log(error);
   });
};
