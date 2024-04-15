const redis = require("redis");

const redisClient = redis.createClient({
  host: "localhost",
  port: 6379,
});

// redisClient.on("error", function (error) {
//   console.error(`Redis error encountered`);

//   // Log the error's message
//   console.error(`Error message: ${error.message}`);

//   // Check if it's an AggregateError to handle multiple errors
//   if (error instanceof AggregateError) {
//     console.error(
//       `The error is an AggregateError with ${error.errors.length} errors:`
//     );
//     error.errors.forEach((e, index) => {
//       console.error(`Error ${index + 1}: ${e.message}`);
//       // Optionally log the stack trace of each error
//       console.error(`Stack: ${e.stack}`);
//     });
//   } else {
//     // For non-AggregateErrors, log the stack trace if available
//     console.error(`Stack: ${error.stack}`);
//   }
// });

redisClient.on("error", (err) => {
  console.log("Error: " + err);
});

redisClient.on("connect", function () {
  console.log("Connected to Redis");
});

redisClient.connect();

module.exports = { redisClient };
