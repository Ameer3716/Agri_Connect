import asyncHandler from 'express-async-handler';
import FarmTask from '../../models/farmer/FarmTask.js';

// @desc    Get all tasks for the logged-in farmer
// @route   GET /api/farmer/tasks
// @access  Private (Farmer only)
const getFarmTasks = asyncHandler(async (req, res) => {
  const tasks = await FarmTask.find({ farmer: req.user._id }).sort({ due: 1 }); // Sort by due date ascending
  res.json(tasks);
});

// @desc    Get a single task by ID
// @route   GET /api/farmer/tasks/:id
// @access  Private (Farmer only)
const getFarmTaskById = asyncHandler(async (req, res) => {
  const task = await FarmTask.findById(req.params.id);

  if (task) {
    if (task.farmer.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to access this task');
    }
    res.json(task);
  } else {
    res.status(404);
    throw new Error('Task not found');
  }
});

// @desc    Create a new task
// @route   POST /api/farmer/tasks
// @access  Private (Farmer only)
const createFarmTask = asyncHandler(async (req, res) => {
  const {
    task,
    description,
    due,
    priority,
    status,
    assignedTo,
    notes,
  } = req.body;

  if (!task || !due) {
    res.status(400);
    throw new Error('Task name and due date are required');
  }

  const farmTask = new FarmTask({
    farmer: req.user._id,
    task,
    description,
    due,
    priority: priority || 'Medium',
    status: status || 'Pending',
    assignedTo: assignedTo || 'Self',
    notes,
  });

  const createdTask = await farmTask.save();
  res.status(201).json(createdTask);
});

// @desc    Update an existing task
// @route   PUT /api/farmer/tasks/:id
// @access  Private (Farmer only)
const updateFarmTask = asyncHandler(async (req, res) => {
  const {
    task,
    description,
    due,
    priority,
    status,
    assignedTo,
    notes,
  } = req.body;

  const farmTask = await FarmTask.findById(req.params.id);

  if (farmTask) {
    if (farmTask.farmer.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this task');
    }

    farmTask.task = task || farmTask.task;
    farmTask.description = description !== undefined ? description : farmTask.description;
    farmTask.due = due || farmTask.due;
    farmTask.priority = priority || farmTask.priority;
    farmTask.status = status || farmTask.status;
    farmTask.assignedTo = assignedTo !== undefined ? assignedTo : farmTask.assignedTo;
    farmTask.notes = notes !== undefined ? notes : farmTask.notes;

    const updatedTask = await farmTask.save();
    res.json(updatedTask);
  } else {
    res.status(404);
    throw new Error('Task not found');
  }
});

// @desc    Delete a task
// @route   DELETE /api/farmer/tasks/:id
// @access  Private (Farmer only)
const deleteFarmTask = asyncHandler(async (req, res) => {
  const task = await FarmTask.findById(req.params.id);

  if (task) {
    if (task.farmer.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this task');
    }
    await FarmTask.deleteOne({ _id: req.params.id });
    res.json({ message: 'Task removed successfully' });
  } else {
    res.status(404);
    throw new Error('Task not found');
  }
});

export {
  getFarmTasks,
  getFarmTaskById,
  createFarmTask,
  updateFarmTask,
  deleteFarmTask,
};