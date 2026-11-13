
import { useEffect, useState } from "react";
import "./App.css";

const API = "https://job-portal-a72k.onrender.com/api";

function App() {
  const [page, setPage] = useState("home");
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const [recruiterJobs, setRecruiterJobs] = useState([]);
  const [recruiterApplications, setRecruiterApplications] = useState([]);

  const [resume, setResume] = useState("");
  const [portfolio, setPortfolio] = useState("");

  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [type, setType] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("candidate");

  const emptyJob = {
    title: "",
    company: "",
    location: "",
    salary: "",
    type: "Full-time",
    description: ""
  };

  const [jobForm, setJobForm] = useState(emptyJob);
  const [editingJobId, setEditingJobId] = useState(null);

  // GET ALL JOBS
  const fetchJobs = async () => {
    try {
      const response = await fetch(`${API}/jobs`);
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch {
      console.log("Could not fetch jobs");
    }
  };

  // CANDIDATE DATA
  const fetchCandidateData = async (id) => {
    try {
      const profile = await fetch(`${API}/candidates/profile/${id}`);
      const profileData = await profile.json();

      setResume(profileData.resume || "");
      setPortfolio(profileData.portfolio || "");

      const saved = await fetch(`${API}/candidates/saved/${id}`);
      setSavedJobs(await saved.json());

      const applied = await fetch(`${API}/candidates/applications/${id}`);
      setApplications(await applied.json());
    } catch {
      console.log("Could not fetch candidate data");
    }
  };

  // RECRUITER DATA
  const fetchRecruiterData = async (id) => {
    try {
      const response = await fetch(`${API}/jobs/recruiter/${id}`);
      const data = await response.json();

      setRecruiterJobs(data.jobs || []);

      const appResponse = await fetch(`${API}/applications`);
      const allApplications = await appResponse.json();

      const jobIds = (data.jobs || []).map(job => job.id);

      const filtered = allApplications.filter(app =>
        jobIds.includes(Number(app.jobId))
      );

      setRecruiterApplications(filtered);
    } catch {
      console.log("Could not fetch recruiter data");
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // LOGIN / REGISTER
  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint =
      page === "register"
        ? `${API}/auth/register`
        : `${API}/auth/login`;

    const body =
      page === "register"
        ? { name, email, password, role }
        : { email, password };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      setUser(data.user);
      setLoggedIn(true);
      setPage("home");

      fetchJobs();

      if (data.user.role === "candidate") {
        fetchCandidateData(data.user.id);
      } else {
        fetchRecruiterData(data.user.id);
      }
    } catch {
      alert("Server connection failed");
    }
  };

  // SEARCH JOBS
  const searchJobs = async () => {
    const query = new URLSearchParams();

    if (keyword) query.append("keyword", keyword);
    if (location) query.append("location", location);
    if (minSalary) query.append("minSalary", minSalary);
    if (maxSalary) query.append("maxSalary", maxSalary);
    if (type) query.append("type", type);

    const response = await fetch(`${API}/jobs?${query.toString()}`);
    const data = await response.json();

    setJobs(data.jobs || []);
  };

  // APPLY JOB
  const applyJob = async (jobId) => {
    if (!loggedIn) {
      alert("Please login to apply");
      setPage("login");
      return;
    }

    if (user.role !== "candidate") {
      alert("Only candidates can apply");
      return;
    }

    const response = await fetch(`${API}/applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidateId: user.id,
        jobId
      })
    });

    const data = await response.json();
    alert(data.message);

    fetchCandidateData(user.id);
  };

  // SAVE JOB
  const saveJob = async (jobId) => {
    if (!loggedIn || user.role !== "candidate") {
      alert("Login as candidate to save jobs");
      return;
    }

    const response = await fetch(`${API}/candidates/saved`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidateId: user.id,
        jobId
      })
    });

    const data = await response.json();
    alert(data.message);

    fetchCandidateData(user.id);
  };

  // REMOVE SAVED JOB
  const removeSavedJob = async (jobId) => {
    await fetch(`${API}/candidates/saved`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidateId: user.id,
        jobId
      })
    });

    fetchCandidateData(user.id);
  };

  // SAVE PROFILE
  const saveProfile = async () => {
    const response = await fetch(
      `${API}/candidates/profile/${user.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, portfolio })
      }
    );

    const data = await response.json();
    alert(data.message);
  };

  // POST / EDIT JOB
  const handleJobSubmit = async (e) => {
    e.preventDefault();

    const url = editingJobId
      ? `${API}/jobs/${editingJobId}`
      : `${API}/jobs`;

    const response = await fetch(url, {
      method: editingJobId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...jobForm,
        salary: Number(jobForm.salary),
        recruiterId: user.id
      })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to save job");
      return;
    }

    alert(data.message || "Job saved successfully");

    setJobForm(emptyJob);
    setEditingJobId(null);

    fetchRecruiterData(user.id);
    fetchJobs();
  };

  // EDIT JOB
  const editJob = (job) => {
    setJobForm({
      title: job.title,
      company: job.company,
      location: job.location,
      salary: String(job.salary),
      type: job.type,
      description: job.description
    });

    setEditingJobId(job.id);
    setPage("dashboard");
    window.scrollTo(0, 0);
  };

  // DELETE JOB
  const deleteJob = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) {
      return;
    }

    const response = await fetch(`${API}/jobs/${id}`, {
      method: "DELETE"
    });

    const data = await response.json();
    alert(data.message || "Job deleted");

    fetchRecruiterData(user.id);
    fetchJobs();
  };

  // SHORTLIST / REJECT
  const updateApplicationStatus = async (id, status) => {
    const response = await fetch(`${API}/applications/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

    const data = await response.json();
    alert(data.message);

    fetchRecruiterData(user.id);
  };

  // LOGOUT
  const logout = () => {
    setLoggedIn(false);
    setUser(null);
    setPage("home");

    setSavedJobs([]);
    setApplications([]);
    setRecruiterJobs([]);
    setRecruiterApplications([]);
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar">
        <h2 className="logo" onClick={() => setPage("home")}>
          Job Portal
        </h2>

        <div className="nav-links">
          <button onClick={() => setPage("home")}>Home</button>

          {!loggedIn ? (
            <>
              <button
                className="login-btn"
                onClick={() => setPage("login")}
              >
                Login
              </button>

              <button
                className="register-btn"
                onClick={() => setPage("register")}
              >
                Register
              </button>
            </>
          ) : (
            <>
              {user.role === "candidate" && (
                <>
                  <button onClick={() => setPage("profile")}>
                    Profile
                  </button>

                  <button onClick={() => setPage("saved")}>
                    Saved Jobs
                  </button>

                  <button onClick={() => setPage("applications")}>
                    My Applications
                  </button>
                </>
              )}

              {user.role === "recruiter" && (
                <button onClick={() => {
                  fetchRecruiterData(user.id);
                  setPage("dashboard");
                }}>
                  Dashboard
                </button>
              )}

              <span className="welcome-user">
                Welcome, {user.name}
              </span>

              <button className="logout-btn" onClick={logout}>
                Logout
              </button>
            </>
          )}
        </div>
      </nav>

      {/* HOME PAGE */}
      {page === "home" && (
        <>
          <section className="hero">
            <p className="hero-tag">YOUR CAREER STARTS HERE</p>

            <h1>
              Welcome to <span>Job Portal</span>
            </h1>

            <p>
              Find your dream job and take the next step in your career.
            </p>

            <div className="search-box">
              <input
                placeholder="Job title"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
              />

              <input
                placeholder="Location"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />

              <input
                type="number"
                placeholder="Min salary"
                value={minSalary}
                onChange={e => setMinSalary(e.target.value)}
              />

              <input
                type="number"
                placeholder="Max salary"
                value={maxSalary}
                onChange={e => setMaxSalary(e.target.value)}
              />

              <select
                value={type}
                onChange={e => setType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
              </select>

              <button onClick={searchJobs}>Search Jobs</button>
            </div>
          </section>

          <section className="jobs-section">
            <h2>Latest Jobs</h2>

            <div className="job-list">
              {jobs.map(job => (
                <div className="job-card" key={job.id}>
                  <h3>{job.title}</h3>
                  <p>{job.company}</p>
                  <p>{job.location}</p>
                  <p>₹{job.salary}</p>
                  <p>{job.type}</p>
                  <p>{job.description}</p>

                  {user?.role === "candidate" && (
                      <>
                        <button onClick={() => applyJob(job.id)}>
                          Apply Now
                        </button>

                        <button onClick={() => saveJob(job.id)}>
                          Save Job
                        </button>
                      </>
                    )}
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* RECRUITER DASHBOARD */}
      {page === "dashboard" && user?.role === "recruiter" && (
        <section className="jobs-section">
          <h2>Recruiter Dashboard</h2>

          {/* POST JOB FORM */}
          <div className="auth-card job-form-card">
            <h3>{editingJobId ? "Edit Job" : "Post a New Job"}</h3>

            <form onSubmit={handleJobSubmit}>
              <label>Job Title</label>
              <input
                required
                value={jobForm.title}
                onChange={e => setJobForm({
                  ...jobForm,
                  title: e.target.value
                })}
              />

              <label>Company</label>
              <input
                required
                value={jobForm.company}
                onChange={e => setJobForm({
                  ...jobForm,
                  company: e.target.value
                })}
              />

              <label>Location</label>
              <input
                required
                value={jobForm.location}
                onChange={e => setJobForm({
                  ...jobForm,
                  location: e.target.value
                })}
              />

              <label>Salary (Annual)</label>
              <input
                required
                type="number"
                value={jobForm.salary}
                onChange={e => setJobForm({
                  ...jobForm,
                  salary: e.target.value
                })}
              />

              <label>Job Type</label>
              <select
                value={jobForm.type}
                onChange={e => setJobForm({
                  ...jobForm,
                  type: e.target.value
                })}
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Internship</option>
              </select>

              <label>Description</label>
              <textarea
                required
                rows="4"
                value={jobForm.description}
                onChange={e => setJobForm({
                  ...jobForm,
                  description: e.target.value
                })}
              />

              <button className="auth-submit">
                {editingJobId ? "Update Job" : "Post Job"}
              </button>

              {editingJobId && (
                <button
                  type="button"
                  className="back-home"
                  onClick={() => {
                    setEditingJobId(null);
                    setJobForm(emptyJob);
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>

          {/* RECRUITER JOBS */}
          <h2>My Posted Jobs</h2>

          <div className="job-list">
            {recruiterJobs.map(job => (
              <div className="job-card" key={job.id}>
                <h3>{job.title}</h3>
                <p>{job.company}</p>
                <p>{job.location}</p>
                <p>₹{job.salary}</p>
                <p>{job.type}</p>

                <button onClick={() => editJob(job)}>Edit</button>
                <button onClick={() => deleteJob(job.id)}>Delete</button>
              </div>
            ))}
          </div>

          {/* APPLICANTS */}
          <h2 style={{ marginTop: "35px" }}>Applicants</h2>

          <div className="job-list">
            {recruiterApplications.map(app => (
              <div className="job-card" key={app.id}>
                <h3>Candidate ID: {app.candidateId}</h3>
                <p>Job ID: {app.jobId}</p>
                <p>Status: {app.status}</p>

                <button onClick={() =>
                  updateApplicationStatus(app.id, "shortlisted")
                }>
                  Shortlist
                </button>

                <button onClick={() =>
                  updateApplicationStatus(app.id, "rejected")
                }>
                  Reject
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CANDIDATE PROFILE */}
      {page === "profile" && (
        <section className="auth-page">
          <div className="auth-card">
            <h2>Candidate Profile</h2>

            <label>Resume Text</label>
            <textarea
              value={resume}
              onChange={e => setResume(e.target.value)}
              rows="8"
              placeholder="Enter your education, skills and experience"
            />

            <label>Portfolio URL</label>
            <input
              value={portfolio}
              onChange={e => setPortfolio(e.target.value)}
              placeholder="https://github.com/username"
            />

            <button className="auth-submit" onClick={saveProfile}>
              Save Profile
            </button>
          </div>
        </section>
      )}

      {/* SAVED JOBS */}
      {page === "saved" && (
        <section className="jobs-section">
          <h2>Saved Jobs</h2>

          <div className="job-list">
            {savedJobs.map(job => (
              <div className="job-card" key={job.id}>
                <h3>{job.title}</h3>
                <p>{job.company} | {job.location}</p>

                <button onClick={() => applyJob(job.id)}>
                  Apply Now
                </button>

                <button onClick={() => removeSavedJob(job.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* MY APPLICATIONS */}
      {page === "applications" && (
        <section className="jobs-section">
          <h2>My Applications</h2>

          <div className="job-list">
            {applications.map(app => (
              <div className="job-card" key={app.id}>
                <h3>{app.job?.title}</h3>
                <p>{app.job?.company}</p>
                <p>Status: {app.status}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* LOGIN / REGISTER */}
      {(page === "login" || page === "register") && (
        <section className="auth-page">
          <div className="auth-card">
            <h2>{page === "login" ? "Login" : "Create Account"}</h2>

            <form onSubmit={handleSubmit}>
              {page === "register" && (
                <>
                  <label>Name</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />

                  <label>Role</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value)}
                  >
                    <option value="candidate">Candidate</option>
                    <option value="recruiter">Recruiter</option>
                  </select>
                </>
              )}

              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />

              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />

              <button type="submit" className="auth-submit">
                {page === "login" ? "Login" : "Register"}
              </button>
            </form>

            <p className="auth-switch">
              {page === "login"
                ? "Don't have an account?"
                : "Already have an account?"}

              <button onClick={() =>
                setPage(page === "login" ? "register" : "login")
              }>
                {page === "login" ? "Register" : "Login"}
              </button>
            </p>

            <button
              className="back-home"
              onClick={() => setPage("home")}
            >
              Back to Home
            </button>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer>
        <p>© 2026 Job Portal. All rights reserved.</p>
      </footer>
    </>
  );
}

export default App;
