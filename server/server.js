
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json());

const jobRoutes = require("./routes/jobRoutes");
const authRoutes = require("./routes/authRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const candidateRoutes = require("./routes/candidateRoutes");

app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/candidates", candidateRoutes);

app.get("/", (req, res) => {
    res.send("Job Portal API is running!");
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
