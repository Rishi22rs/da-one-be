const cron = require("node-cron");
const db = require("../db");

// Run the task every day at 3 AM
cron.schedule("0 3 * * *", async () => {
  const sql = "UPDATE user_config SET swipes = 10";

  try {
    const [result] = await db.query(sql);
    console.log(
      `Swipes reset to 10 for all users at 3 AM. Rows affected: ${result.affectedRows}`,
    );
  } catch (err) {
    console.error("Failed to reset swipes:", err);
  }
});
