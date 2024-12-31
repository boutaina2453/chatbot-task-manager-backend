import axios from 'axios'; // Pour effectuer les appels API HTTP
import TaskModel from '../models/Task.js'; // Modèle de tâche
import dotenv from 'dotenv';

dotenv.config();

// Clé API Hugging Face depuis les variables d'environnement
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

// Variable pour suivre le dernier appel API
let lastApiCallTime = 0;
const RATE_LIMIT_DELAY = 60000; // Délai de 1 minute entre les appels API (en millisecondes)

// Fonction pour générer une tâche à partir d'une commande utilisateur
export async function generateTask(command, userId) {
  try {
    // Limiter la fréquence des appels à l'API
    const currentTime = Date.now();
    if (currentTime - lastApiCallTime < RATE_LIMIT_DELAY) {
      const waitTime = RATE_LIMIT_DELAY - (currentTime - lastApiCallTime);
      console.log(`Trop de requêtes, veuillez attendre ${Math.ceil(waitTime / 1000)} secondes.`);
      await delay(waitTime); // Attendre avant de faire un nouvel appel
    }

    // Appeler la fonction pour générer la tâche avec le modèle Hugging Face
    const taskDetails = await interpretCommandWithHuggingFace(command);

    // Mettre à jour le temps du dernier appel API
    lastApiCallTime = Date.now();

    // Créer la nouvelle tâche dans la base de données
    const newTask = await TaskModel.create({
      title: taskDetails.title,
      description: taskDetails.description,
      dueDate: taskDetails.dueDate,
      priority: taskDetails.priority,
      user: userId,
    });

    return newTask;
  } catch (error) {
    console.error('Erreur lors de la génération de la tâche :', error.message);
    throw new Error('Erreur lors de la génération de la tâche');
  }
}

// Fonction pour envoyer la commande à Hugging Face et obtenir les détails de la tâche
async function interpretCommandWithHuggingFace(command) {
  try {
    // Loguer la commande envoyée à Hugging Face pour déboguer
    console.log('Envoi de la commande à Hugging Face:', command);

    // Utiliser un modèle plus adapté, par exemple GPT-3 ou GPT-4
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/gpt-3.5-turbo', // Utilisation de GPT-3.5 ou GPT-4 si disponible
      {
        inputs: command,
      },
      {
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_KEY}`, 
        },
      }
    );

    // Loguer la réponse de Hugging Face pour déboguer
    console.log('Réponse de Hugging Face:', response.data);

    // Vérification de la réponse de Hugging Face
    if (!response.data || !response.data[0] || !response.data[0].generated_text) {
      throw new Error('Réponse invalide ou manquante de Hugging Face.');
    }

    const gptResponse = response.data[0].generated_text;

    // Extraire et analyser la réponse
    const taskDetails = parseGPTResponse(gptResponse);

    return taskDetails;
  } catch (error) {
    console.error('Erreur lors de l\'appel à l\'API Hugging Face :', error.message);
    throw new Error('Erreur lors de l\'appel à l\'API Hugging Face');
  }
}

// Fonction pour analyser la réponse de Hugging Face et extraire les détails de la tâche
function parseGPTResponse(gptResponse) {
  const trimmedResponse = gptResponse.trim();

  // Exemple de structure de tâche générée à partir de la réponse de GPT
  return {
    title: 'Tâche générée par chatbot', // Exemple de titre
    description: trimmedResponse,      // Utiliser la réponse complète comme description
    dueDate: new Date(),               // Par défaut, la date d'échéance est aujourd'hui
    priority: 'moyenne',               // Par défaut, la priorité est moyenne
  };
}

// Fonction pour introduire une pause avant de réessayer
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
