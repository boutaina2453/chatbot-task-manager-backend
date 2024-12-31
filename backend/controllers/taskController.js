import TaskModel from "../models/Task.js";
import { generateTask } from "../services/chatbotService.js"; // Importer la fonction pour générer la tâche via GPT

// Fonction pour ajouter une tâche manuellement
export const addTask = async (req, res) => {
    try {
        const { title, description, dueDate, priority, userId } = req.body;

        // Vérification de la présence des champs nécessaires
        if (!title || !description || !dueDate || !priority || !userId) {
            return res.status(400).json({ message: "Tous les champs sont requis." });
        }

        // Créer une tâche manuellement dans la base de données
        const newTask = await TaskModel.create({
            title,
            description,
            dueDate,
            priority,
            user: userId,
        });

        // Réponse en cas de succès
        res.status(201).json({ message: "Tâche ajoutée avec succès.", task: newTask });
    } catch (error) {
        // Gestion des erreurs
        res.status(500).json({ message: error.message });
    }
};

// Fonction pour créer une tâche via une commande utilisateur (chatbot)
export const createTaskFromCommand = async (req, res) => {
    const { command, userId } = req.body;

    // Vérification des données nécessaires dans la requête
    if (!command || !userId) {
        return res.status(400).json({ message: 'La commande et l\'ID utilisateur sont requis.' });
    }

    try {
        // Appeler la fonction du service pour générer la tâche en utilisant le chatbot
        const newTask = await generateTask(command, userId);

        // Réponse en cas de succès
        res.status(201).json({ message: "Tâche générée avec succès via le chatbot.", task: newTask });
    } catch (error) {
        // Gestion des erreurs
        res.status(500).json({ message: "Erreur lors de la génération de la tâche", error: error.message });
    }
};

// Fonction pour obtenir toutes les tâches
export const getTasks = async (req, res) => {
    try {
        const tasks = await TaskModel.find().populate("user", "name email"); // Utilise populate si tu veux inclure des informations de l'utilisateur
        res.status(200).json({ tasks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Fonction pour mettre à jour une tâche
export const updateTask = async (req, res) => {
    const { id } = req.params;
    const { title, description, dueDate, priority, status } = req.body;

    try {
        const updatedTask = await TaskModel.findByIdAndUpdate(
            id,
            { title, description, dueDate, priority, status },
            { new: true } // Retourner la tâche mise à jour
        );

        if (!updatedTask) {
            return res.status(404).json({ message: "Tâche non trouvée." });
        }

        res.status(200).json({ message: "Tâche mise à jour avec succès.", task: updatedTask });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Fonction pour supprimer une tâche
export const deleteTask = async (req, res) => {
    const { id } = req.params;

    try {
        const task = await TaskModel.findByIdAndDelete(id);

        if (!task) {
            return res.status(404).json({ message: "Tâche non trouvée." });
        }

        res.status(200).json({ message: "Tâche supprimée avec succès." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
