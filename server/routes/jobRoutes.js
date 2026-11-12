
const express = require("express");
const router = express.Router();

const { jobs } = require("../data/data");

// GET: All jobs with search filters
router.get("/", (req, res) => {
    let result = [...jobs];

    const { keyword, location, type, minSalary, maxSalary } = req.query;

    if (keyword) {
        result = result.filter(job =>
            job.title.toLowerCase().includes(keyword.toLowerCase()) ||
            job.company.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    if (location) {
        result = result.filter(job =>
            job.location.toLowerCase().includes(location.toLowerCase())
        );
    }

    if (type) {
        result = result.filter(job =>
            job.type.toLowerCase() === type.toLowerCase()
        );
    }

    if (minSalary) {
        result = result.filter(job =>
            job.salary >= Number(minSalary)
        );
    }

    if (maxSalary) {
        result = result.filter(job =>
            job.salary <= Number(maxSalary)
        );
    }

    res.json({
        count: result.length,
        jobs: result
    });
});

// GET: Job by ID
router.get("/:id", (req, res) => {
    const job = jobs.find(j => j.id === Number(req.params.id));

    if (!job) {
        return res.status(404).json({
            message: "Job not found"
        });
    }

    res.json(job);
});

// POST: Create job
router.post("/", (req, res) => {
    const { title, company, location, salary, type, description, recruiterId } = req.body;

    if (!title || !company || !location || !salary || !type || !description || !recruiterId) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    if (Number(salary) <= 0 || !Number.isFinite(Number(salary))) {
        return res.status(400).json({
            message: "Salary must be a valid positive number"
        });
    }

    const newJob = {
        id: jobs.length ? Math.max(...jobs.map(j => j.id)) + 1 : 1,
        title,
        company,
        location,
        salary: Number(salary),
        type,
        description,
        recruiterId: Number(recruiterId)
    };

    jobs.push(newJob);

    res.status(201).json({
        message: "Job created successfully",
        job: newJob
    });
});

// PUT: Update job
router.put("/:id", (req, res) => {
    const job = jobs.find(j => j.id === Number(req.params.id));

    if (!job) {
        return res.status(404).json({
            message: "Job not found"
        });
    }

    const { title, company, location, salary, type, description } = req.body;

    if (salary !== undefined &&
        (!Number.isFinite(Number(salary)) || Number(salary) <= 0)) {
        return res.status(400).json({
            message: "Salary must be a valid positive number"
        });
    }

    if (title !== undefined) job.title = title;
    if (company !== undefined) job.company = company;
    if (location !== undefined) job.location = location;
    if (salary !== undefined) job.salary = Number(salary);
    if (type !== undefined) job.type = type;
    if (description !== undefined) job.description = description;

    res.json({
        message: "Job updated successfully",
        job
    });
});

// DELETE: Delete job
router.delete("/:id", (req, res) => {
    const index = jobs.findIndex(j => j.id === Number(req.params.id));

    if (index === -1) {
        return res.status(404).json({
            message: "Job not found"
        });
    }

    const deletedJob = jobs.splice(index, 1)[0];

    res.json({
        message: "Job deleted successfully",
        job: deletedJob
    });
});


/* GET RECRUITER JOBS */
router.get("/recruiter/:id", (req, res) => {
  const recruiterId = Number(req.params.id);

  const recruiterJobs = jobs.filter(
    job => job.recruiterId === recruiterId
  );

  res.json({
    count: recruiterJobs.length,
    jobs: recruiterJobs
  });
});


module.exports = router;
