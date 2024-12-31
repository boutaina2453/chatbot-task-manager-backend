import UserModel from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
    try {
        const { fName, lName, email, password } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "L'utilisateur existe déjà." });

        // Créer un nouvel utilisateur
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await UserModel.create({
            fName,
            lName,
            email,
            password: hashedPassword,
        });

        res.status(201).json({ message: "Utilisateur créé avec succès.", user: newUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Vérifier si l'utilisateur existe
        const user = await UserModel.findOne({ email });
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });

        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(400).json({ message: "Mot de passe incorrect." });

        // Générer un token JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ message: "Connexion réussie.", token, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
