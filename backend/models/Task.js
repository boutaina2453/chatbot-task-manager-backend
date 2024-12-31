import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        title: { 
            type: String, 
            required: [true, "Le titre est requis."] // Message d'erreur personnalisé
        },
        description: { 
            type: String 
        },
        dueDate: { 
            type: Date 
        },
        priority: { 
            type: String, 
            enum: ["faible", "moyenne", "élevée"], 
            default: "moyenne" 
        },
        status: { 
            type: String, 
            enum: ["en cours", "terminée"], 
            default: "en cours" 
        },
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: [true, "L'utilisateur associé est requis."] // Message d'erreur personnalisé
        },
    }, 
    { 
        timestamps: true // Ajoute automatiquement createdAt et updatedAt
    }
);

export default mongoose.model("Task", taskSchema);