const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const groupController = require("../controllers/groupController");
const appController = require("../controllers/appController");
const planController = require("../controllers/planController");
const taskController = require("../controllers/taskController");
const { authenticateToken, authorizeRole, checkgroup, acheckRoles } = require("../middleware/authMiddleware");

// App routes 
router.get("/get-all-apps", authenticateToken, appController.getAllApp);
router.post("/get-app", authenticateToken, appController.getAppInfo);
router.post("/create-app",authenticateToken,authorizeRole("pl"),appController.createApp);
router.put("/update-app",authenticateToken,authorizeRole("pl"), appController.editAppInfo);

// Plan routes
router.get("/get-all-plans", authenticateToken, planController.getAllPlans);
router.post("/get-plan", authenticateToken, planController.getPlan);
router.post("/get-plan-colour", authenticateToken, planController.getPlan);
router.post("/get-related-plans", authenticateToken, planController.getrelatedPlans);
router.post("/create-plan", authenticateToken,authorizeRole("pm"), planController.createPlan);
router.put("/edit-plan", authenticateToken, authorizeRole("pm"), planController.editPlan);

// Task routes
router.post("/get-all-tasks", authenticateToken, taskController.getAllTasks);
router.post("/get-all-tasks-color", authenticateToken, taskController.getAllTasksWithColour);
router.post("/get-rnumber", authenticateToken, taskController.getRnumber);
router.post("/get-task", authenticateToken, taskController.getTask);
router.post("/create-task", authenticateToken, taskController.createTask);

//Task edit routes
router.put("/edit-task-name", authenticateToken, taskController.updateTaskName);
router.put("/edit-task-description", authenticateToken, taskController.updateTaskDescription);
router.put("/edit-task-notes", authenticateToken, taskController.updateTaskNotes);
router.put("/edit-task-plan", authenticateToken, taskController.updateTaskPlan);
router.put("/edit-task-app-acronym", authenticateToken, taskController.updateTaskAppAcronym);
router.put("/edit-task-state", authenticateToken, taskController.updateTaskState);
router.put("/edit-task-creator", authenticateToken, taskController.updateTaskCreator);
router.put("edit-task-owner", authenticateToken, taskController.updateTaskOwner);
router.put("/edit-task-createDate", authenticateToken, taskController.updateTaskCreateDate);

router.put("/update-task-withplan", authenticateToken,taskController.updateTaskwithPlan);
router.put("/update-task", authenticateToken,taskController.updateTask);

module.exports = router;