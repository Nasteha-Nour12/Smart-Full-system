import express from 'express';
import { connect } from 'mongoose';
import conectBD from './config/db.js';
import userRouter from './routes/UserRoute.js';
import companyRoutes from "./routes/companyRoutes.js";
import programRoutes from "./routes/programRoutes.js";
import candidateProfileRoutes from "./routes/candidateProfileRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import internshipRoutes from "./routes/internshipRoutes.js";
import opportunityRoutes from "./routes/opportunityRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import goToWorkRoutes from "./routes/goToWorkRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import insightRoutes from "./routes/insightRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";





import cookieParser from 'cookie-parser';
import cors from "cors"
const app = express();
const PORT = 8000

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true,
  })
);

app.use('/api/users', userRouter);
app.use("/api/companies", companyRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/candidate-profiles", candidateProfileRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/go-to-work", goToWorkRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/insights", insightRoutes);
app.use("/api/uploads", uploadRoutes);
// forget password


conectBD();
app.listen(PORT ,()=>{
    console.log(`Server is running on port ${PORT}`);

})
