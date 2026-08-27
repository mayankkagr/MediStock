import service from "../services/medicine.service.js";

//const service = require("../services/medicine.service");

function sendError(res, error) {
    console.error(error);

    const statusCode =
        error.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message:
            statusCode === 500
                ? "Internal server error."
                : error.message
    });
}

async function getMedicines(req, res) {
    try {
        const result =
            await service.getMedicines(req.query);

        res.status(200).json({
            success: true,
            data: result.medicines,
            pagination: result.pagination
        });
    } catch (error) {
        sendError(res, error);
    }
}

async function getExpiringMedicines(req, res) {
    try {
        const medicines =
            await service.getExpiringMedicines();

        res.status(200).json({
            success: true,
            data: medicines
        });
    } catch (error) {
        sendError(res, error);
    }
}

async function getMedicineById(req, res) {
    try {
        const medicine =
            await service.getMedicineById(
                req.params.id
            );

        res.status(200).json({
            success: true,
            data: medicine
        });
    } catch (error) {
        sendError(res, error);
    }
}

async function createMedicine(req, res) {
    try {
        const {
            name,
            genericName,
            sku,
            manufacturer,
            category,
            price,
            quantityInStock,
            reorderLevel,
            batchNumber,
            expiryDate,
            prescriptionRequired
        } = req.body;

        // Controller-level validation
        if (
            !name ||
            !genericName ||
            !sku ||
            !manufacturer ||
            !category ||
            price === undefined ||
            quantityInStock === undefined ||
            reorderLevel === undefined ||
            !batchNumber ||
            !expiryDate
        ) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be provided."
            });
        }

        if (
            typeof name !== "string" ||
            typeof genericName !== "string" ||
            typeof sku !== "string" ||
            typeof manufacturer !== "string" ||
            typeof batchNumber !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid field types."
            });
        }

        if (
            typeof price !== "number" ||
            typeof quantityInStock !== "number" ||
            typeof reorderLevel !== "number"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "price, quantityInStock and reorderLevel must be numbers."
            });
        }

        if (
            price < 0 ||
            quantityInStock < 0 ||
            reorderLevel < 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "price, quantityInStock and reorderLevel cannot be negative."
            });
        }

        const medicine =
            await service.createMedicine(req.body);

        res.status(201).json({
            success: true,
            data: medicine
        });
    } catch (error) {
        sendError(res, error);
    }
}

async function updateMedicine(req, res) {
    try {
        if (
            !req.body ||
            Object.keys(req.body).length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Request body cannot be empty."
            });
        }

        const allowedFields = [
            "name",
            "genericName",
            "sku",
            "manufacturer",
            "category",
            "price",
            "quantityInStock",
            "reorderLevel",
            "batchNumber",
            "expiryDate",
            "prescriptionRequired"
        ];

        const invalidFields =
            Object.keys(req.body).filter(
                field => !allowedFields.includes(field)
            );

        if (invalidFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Invalid fields: ${invalidFields.join(", ")}`
            });
        }

        if (
            req.body.price !== undefined &&
            typeof req.body.price !== "number"
        ) {
            return res.status(400).json({
                success: false,
                message: "price must be a number."
            });
        }

        if (
            req.body.quantityInStock !== undefined &&
            typeof req.body.quantityInStock !== "number"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "quantityInStock must be a number."
            });
        }

        const medicine =
            await service.updateMedicine(
                req.params.id,
                req.body
            );

        res.status(200).json({
            success: true,
            data: medicine
        });
    } catch (error) {
        sendError(res, error);
    }
}

async function adjustStock(req, res) {
    try {
        const { change } = req.body;

        if (
            change === undefined ||
            typeof change !== "number" ||
            !Number.isInteger(change)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "change must be an integer."
            });
        }

        if (change === 0) {
            return res.status(400).json({
                success: false,
                message:
                    "change cannot be zero."
            });
        }

        const medicine =
            await service.adjustStock(
                req.params.id,
                change
            );

        res.status(200).json({
            success: true,
            data: medicine
        });
    } catch (error) {
        sendError(res, error);
    }
}

async function deleteMedicine(req, res) {
    try {
        await service.deleteMedicine(
            req.params.id
        );

        res.status(200).json({
            success: true,
            data: null,
            message: "Medicine deleted successfully."
        });
    } catch (error) {
        sendError(res, error);
    }
}

const MediControllers = {
    getMedicines,
    getExpiringMedicines,
    getMedicineById,
    createMedicine,
    updateMedicine,
    adjustStock,
    deleteMedicine
};
export default MediControllers;