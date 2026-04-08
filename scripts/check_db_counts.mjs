import "dotenv/config";
import mongoose from "mongoose";

const dburl = process.env.MONGO_URL || process.env.mongo_url;
if (!dburl) {
  console.error("No MONGO_URL/mongo_url found in .env");
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(dburl);
  const db = mongoose.connection.db;
  const [users, profiles, trainings, internships, goToWork, companies] = await Promise.all([
    db.collection("users").countDocuments(),
    db.collection("candidateprofiles").countDocuments(),
    db.collection("trainingprograms").countDocuments(),
    db.collection("internships").countDocuments(),
    db.collection("gotoworks").countDocuments(),
    db.collection("companies").countDocuments(),
  ]);
  console.log(
    JSON.stringify(
      { users, profiles, trainings, internships, goToWork, companies, dburl: dburl.slice(0, 60) + "..." },
      null,
      2
    )
  );
  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error(err.message || err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
