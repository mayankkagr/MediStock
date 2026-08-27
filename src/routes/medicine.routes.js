import controller from "../controllers/medicine.controller.js";

import express from "express";

//const controller =require("../controllers/medicine.controller");

const router = express.Router();


router.get("/",controller.getMedicines);

// IMPORTANT:
// /expiring must come before /:id
router.get("/expiring",controller.getExpiringMedicines);

// GET /api/medicines/:id
router.get("/:id",controller.getMedicineById);

// POST /api/medicines
router.post("/",controller.createMedicine);

// PUT /api/medicines/:id
router.put("/:id",controller.updateMedicine);

// PATCH /api/medicines/:id/stock
router.patch("/:id/stock",controller.adjustStock);

// DELETE /api/medicines/:id
router.delete("/:id",controller.deleteMedicine);

export default router;