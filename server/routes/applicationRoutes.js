
const express = require("express");
const router = express.Router();

const { applications, jobs, users } = require("../data/data");

// APPLY FOR JOB
router.post("/", (req, res) => {
    const { candidateId, jobId } = req.body;

    const candidate = users.find(
        user => user.id === Number(candidateId) && user.role === "candidate"
    );

    const job = jobs.find(
        job => job.id === Number(jobId)
    );

    if (!candidate || !job) {
        return res.status(404).json({ message: "Candidate or job not found" });
    }

    const alreadyApplied = applications.find(
        app => app.candidateId === Number(candidateId) &&
               app.jobId === Number(jobId)
    );

    if (alreadyApplied) {
        return res.status(400).json({ message: "Already applied" });
    }

    const application = {
        id: applications.length ? Math.max(...applications.map(app => app.id)) + 1 : 1,
        candidateId: Number(candidateId),
        jobId: Number(jobId),
        status: "applied"
    };

    applications.push(application);

    res.status(201).json({
        message: "Application submitted successfully",
        application
    });
});

// GET ALL APPLICATIONS
router.get("/", (req, res) => {
    res.json(applications);
});

/* UPDATE APPLICATION STATUS */
router.put("/:id/status", (req, res) => {
  const { status } = req.body;

  if (!["applied", "shortlisted", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const application = applications.find(
    a => a.id === Number(req.params.id)
  );

  if (!application) {
    return res.status(404).json({ message: "Application not found" });
  }

  application.status = status;

  res.json({
    message: "Application status updated",
    application
  });
});

module.exports = router;
