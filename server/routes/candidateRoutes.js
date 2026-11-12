
const express = require("express");
const router = express.Router();

const { users, jobs, applications, savedJobs } = require("../data/data");

// GET candidate profile
router.get("/profile/:id", (req, res) => {
  const user = users.find(
    u => u.id === Number(req.params.id) && u.role === "candidate"
  );

  if (!user) {
    return res.status(404).json({ message: "Candidate not found" });
  }

  res.json({
    name: user.name,
    email: user.email,
    resume: user.resume || "",
    portfolio: user.portfolio || ""
  });
});

// UPDATE candidate profile
router.put("/profile/:id", (req, res) => {
  const user = users.find(
    u => u.id === Number(req.params.id) && u.role === "candidate"
  );

  if (!user) {
    return res.status(404).json({ message: "Candidate not found" });
  }

  user.resume = req.body.resume || "";
  user.portfolio = req.body.portfolio || "";

  res.json({ message: "Profile updated successfully" });
});

// SAVE JOB
router.post("/saved", (req, res) => {
  const { candidateId, jobId } = req.body;

  const candidate = users.find(
    u => u.id === Number(candidateId) && u.role === "candidate"
  );

  const job = jobs.find(j => j.id === Number(jobId));

  if (!candidate || !job) {
    return res.status(404).json({ message: "Candidate or job not found" });
  }

  const exists = savedJobs.find(
    s => s.candidateId === Number(candidateId) &&
         s.jobId === Number(jobId)
  );

  if (exists) {
    return res.status(400).json({ message: "Job already saved" });
  }

  savedJobs.push({
    id: savedJobs.length + 1,
    candidateId: Number(candidateId),
    jobId: Number(jobId)
  });

  res.json({ message: "Job saved successfully" });
});

// GET SAVED JOBS
router.get("/saved/:candidateId", (req, res) => {
  const candidateId = Number(req.params.candidateId);

  const result = savedJobs
    .filter(s => s.candidateId === candidateId)
    .map(s => jobs.find(j => j.id === s.jobId))
    .filter(Boolean);

  res.json(result);
});

// REMOVE SAVED JOB
router.delete("/saved", (req, res) => {
  const { candidateId, jobId } = req.body;

  const index = savedJobs.findIndex(
    s => s.candidateId === Number(candidateId) &&
         s.jobId === Number(jobId)
  );

  if (index === -1) {
    return res.status(404).json({ message: "Saved job not found" });
  }

  savedJobs.splice(index, 1);

  res.json({ message: "Saved job removed" });
});

// GET CANDIDATE APPLICATIONS
router.get("/applications/:candidateId", (req, res) => {
  const candidateId = Number(req.params.candidateId);

  const result = applications
    .filter(a => a.candidateId === candidateId)
    .map(a => ({
      ...a,
      job: jobs.find(j => j.id === a.jobId)
    }));

  res.json(result);
});

module.exports = router;
