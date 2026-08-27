import medicineRoutes from "./routes/medicine.routes.js";
import express from "express"

const app = express();

app.use(express.json());

app.use("/api/medicines",medicineRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found."
    });
});

export default app;