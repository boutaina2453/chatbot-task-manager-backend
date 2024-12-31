import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fName: { type: String, required: true },
    lName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    tasks: [{ type: mongoose.Types.ObjectId, ref: "Task" }],
}, { timestamps: true });

export default mongoose.model("User", userSchema);
