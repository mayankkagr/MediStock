import repository from "../repositories/medicine.controller.js"
import mongoose from "mongoose";


function createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function validateObjectId(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw createError("Invalid medicine id.", 400);
    }
}

async function getMedicines(query) {
    const {
        category,
        search,
        lowStock,
        page = 1,
        limit = 10
    } = query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (
        !Number.isInteger(pageNumber) ||
        pageNumber < 1
    ) {
        throw createError(
            "Page must be a positive integer.",
            400
        );
    }

    if (
        !Number.isInteger(limitNumber) ||
        limitNumber < 1 ||
        limitNumber > 100
    ) {
        throw createError(
            "Limit must be between 1 and 100.",
            400
        );
    }

    const filters = {};

    if (category) {
        filters.category = category;
    }

    if (search) {
        filters.$or = [
            {
                name: {
                    $regex: search,
                    $options: "i"
                }
            },
            {
                genericName: {
                    $regex: search,
                    $options: "i"
                }
            },
            {
                manufacturer: {
                    $regex: search,
                    $options: "i"
                }
            },
            {
                sku: {
                    $regex: search,
                    $options: "i"
                }
            }
        ];
    }

    if (lowStock === "true") {
        filters.$expr = {
            $lte: [
                "$quantityInStock",
                "$reorderLevel"
            ]
        };
    } else if (
        lowStock !== undefined &&
        lowStock !== "false"
    ) {
        throw createError(
            "lowStock must be true or false.",
            400
        );
    }

    const skip = (pageNumber - 1) * limitNumber;

    const [medicines, total] = await Promise.all([
        repository.findAll(
            filters,
            skip,
            limitNumber
        ),
        repository.count(filters)
    ]);

    return {
        medicines,
        pagination: {
            page: pageNumber,
            limit: limitNumber,
            total,
            totalPages: Math.ceil(total / limitNumber)
        }
    };
}

async function getMedicineById(id) {
    validateObjectId(id);

    const medicine = await repository.findById(id);

    if (!medicine) {
        throw createError(
            "Medicine not found.",
            404
        );
    }

    return medicine;
}

async function createMedicine(data) {
    if (data.expiryDate) {
        const expiryDate = new Date(data.expiryDate);

        if (
            Number.isNaN(expiryDate.getTime()) ||
            expiryDate <= new Date()
        ) {
            throw createError(
                "Expiry date must be in the future.",
                400
            );
        }
    }

    const existingMedicine =
        await repository.findBySku(data.sku);

    if (existingMedicine) {
        throw createError(
            "A medicine with this SKU already exists.",
            409
        );
    }

    try {
        return await repository.create(data);
    } catch (error) {
        if (error.code === 11000) {
            throw createError(
                "A medicine with this SKU already exists.",
                409
            );
        }

        throw error;
    }
}

async function updateMedicine(id, data) {
    validateObjectId(id);

    const existingMedicine =
        await repository.findById(id);

    if (!existingMedicine) {
        throw createError(
            "Medicine not found.",
            404
        );
    }

    if (data.sku && data.sku !== existingMedicine.sku) {
        const duplicate =
            await repository.findBySku(data.sku);

        if (duplicate) {
            throw createError(
                "A medicine with this SKU already exists.",
                409
            );
        }
    }

    if (data.expiryDate) {
        const expiryDate = new Date(data.expiryDate);

        if (
            Number.isNaN(expiryDate.getTime()) ||
            expiryDate <= new Date()
        ) {
            throw createError(
                "Expiry date must be in the future.",
                400
            );
        }
    }

    if (
        data.price !== undefined &&
        Number(data.price) < 0
    ) {
        throw createError(
            "Price cannot be negative.",
            400
        );
    }

    if (
        data.quantityInStock !== undefined &&
        Number(data.quantityInStock) < 0
    ) {
        throw createError(
            "Quantity in stock cannot be negative.",
            400
        );
    }

    return repository.updateById(id, data);
}

async function adjustStock(id, change) {
    validateObjectId(id);

    if (!Number.isInteger(change)) {
        throw createError(
            "Stock change must be an integer.",
            400
        );
    }

    if (change === 0) {
        throw createError(
            "Stock change cannot be zero.",
            400
        );
    }

    const medicine =
        await repository.findById(id);

    if (!medicine) {
        throw createError(
            "Medicine not found.",
            404
        );
    }

    // Dispensing
    if (change < 0) {
        if (
            new Date(medicine.expiryDate) <= new Date()
        ) {
            throw createError(
                "Expired medicine cannot be dispensed.",
                400
            );
        }

        const newQuantity =
            medicine.quantityInStock + change;

        if (newQuantity < 0) {
            throw createError(
                `Insufficient stock. Available quantity: ${medicine.quantityInStock}.`,
                400
            );
        }
    }

    return repository.adjustStock(id, change);
}

async function deleteMedicine(id) {
    validateObjectId(id);

    const medicine =
        await repository.findById(id);

    if (!medicine) {
        throw createError(
            "Medicine not found.",
            404
        );
    }

    if (medicine.quantityInStock > 0) {
        throw createError(
            "Medicine cannot be deleted while stock remains.",
            400
        );
    }

    return repository.deleteById(id);
}

async function getExpiringMedicines() {
    const startDate = new Date();

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    return repository.findExpiring(
        startDate,
        endDate
    );
}

const MediServices = {
    getMedicines,
    getMedicineById,
    createMedicine,
    updateMedicine,
    adjustStock,
    deleteMedicine,
    getExpiringMedicines
};
export default MediServices;