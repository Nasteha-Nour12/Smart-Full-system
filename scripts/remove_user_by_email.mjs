import "dotenv/config";
import mongoose from "mongoose";

const email = process.argv[2];

if (!email) {
  console.error("Usage: node scripts/remove_user_by_email.mjs <email>");
  process.exit(1);
}

const dburl = process.env.MONGO_URL || process.env.mongo_url;
if (!dburl) {
  console.error("MONGO_URL (or mongo_url) is missing in .env");
  process.exit(1);
}

const normalized = String(email).trim().toLowerCase();

try {
  await mongoose.connect(dburl);
  const usersCol = mongoose.connection.db.collection("users");
  const before = await usersCol.findOne({ email: normalized }, { projection: { fullName: 1, email: 1, role: 1, status: 1 } });
  if (!before) {
    console.log(`No user found for email: ${normalized}`);
    process.exit(0);
  }

  const result = await usersCol.deleteOne({ email: normalized });
  const after = await usersCol.findOne({ email: normalized }, { projection: { _id: 1 } });

  console.log(
    JSON.stringify(
      {
        deletedCount: result.deletedCount,
        removedUser: before,
        stillExists: !!after,
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
