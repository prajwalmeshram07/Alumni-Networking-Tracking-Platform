import Job from '../models/Job.js';

export const createJob = async (req, res) => {
  try {
    const { title, company, description } = req.body;
    const job = await Job.create({
      title,
      company,
      description,
      postedBy: req.user._id
    });
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate('postedBy', 'name company').sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
