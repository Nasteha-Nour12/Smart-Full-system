import "dotenv/config";
import mongoose from "mongoose";

const keepEmail = String(process.argv[2] || "").trim().toLowerCase();

if (!keepEmail) {
  console.error("Usage: node scripts/keep_only_user_email.mjs <email-to-keep>");
  process.exit(1);
}

const dburl = process.env.MONGO_URL || process.env.mongo_url;
if (!dburl) {
  console.error("MONGO_URL (or mongo_url) is missing in .env");
  process.exit(1);
}

try {
  await mongoose.connect(dburl);
  const usersCol = mongoose.connection.db.collection("users");

  const beforeCount = await usersCol.countDocuments({});
  const result = await usersCol.deleteMany({ email: { $ne: keepEmail } });
  const after = await usersCol.find({}, { projection: { fullName: 1, email: 1, role: 1, status: 1 } }).toArray();

  console.log(
    JSON.stringify(
      {
        keepEmail,
        beforeCount,
        deletedCount: result.deletedCount,
        afterCount: after.length,
        remainingUsers: after,
      },
      null,
      2
    )
  );
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
} finally {
  await mongoose.disconnect();
}
