const users = [
  {
    id: 1,
    name: "ana",
    email: "ana@gmail.com",
    password: "123456",
    role: "candidate",
    resume: "",
    portfolio: ""
  },
  {
    id: 2,
    name: "Recruiter",
    email: "recruiter@gmail.com",
    password: "123456",
    role: "recruiter"
  }
];

const jobs = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "Tech Solutions",
    location: "Bengaluru",
    salary: 500000,
    type: "Full-time",
    description: "Looking for a React developer.",
    recruiterId: 2
  },
  {
    id: 2,
    title: "Node.js Developer",
    company: "Code Labs",
    location: "Remote",
    salary: 600000,
    type: "Full-time",
    description: "Looking for an Express developer.",
    recruiterId: 2
  },
  {
    id: 3,
    title: "Python Developer",
    company: "Innovate Tech",
    location: "Bengaluru",
    salary: 450000,
    type: "Full-time",
    description: "Looking for a Python developer.",
    recruiterId: 2
  },
  {
    id: 4,
    title: "UI/UX Designer",
    company: "Creative Solutions",
    location: "Remote",
    salary: 40000,
    type: "Internship",
    description: "Looking for a creative designer.",
    recruiterId: 2
  }
];

const applications = [];
const savedJobs = [];
module.exports = { users, jobs, applications, savedJobs };
