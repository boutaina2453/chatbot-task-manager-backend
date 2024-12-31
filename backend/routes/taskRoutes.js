import express from "express";
import { addTask, getTasks, updateTask, deleteTask, createTaskFromCommand } from "../controllers/taskController.js";

const router = express.Router();

// Route pour ajouter une tâche manuellement
router.post("/", addTask);

// Route pour obtenir toutes les tâches
router.get("/", getTasks);

// Route pour mettre à jour une tâche par ID
router.put("/:id", updateTask);

// Route pour supprimer une tâche par ID
router.delete("/:id", deleteTask);

// Route pour créer une tâche via une commande utilisateur (chatbot)
router.post("/create-task", createTaskFromCommand);

export default router;
