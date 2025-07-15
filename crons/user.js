const cron = require("node-cron");
const db = require("../db");

// Run the task every day at 3 AM
cron.schedule("0 3 * * *", () => {
  const sql = "UPDATE user_config SET swipes = 10";

  db.query(sql, (err, result) => {
    if (err) {
      return console.error("Failed to reset swipes:", err);
    }
    console.log(
      `Swipes reset to 10 for all users at 3 AM. Rows affected: ${result.affectedRows}`
    );
  });
});
