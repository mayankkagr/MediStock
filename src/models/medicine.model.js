import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Medicine name is required"],
            trim: true,
            minlength: [2, "Medicine name must contain at least 2 characters"]
        },

        genericName: {
            type: String,
            required: [true, "Generic name is required"],
            trim: true
        },

        sku: {
            type: String,
            required: [true, "SKU is required"],
            unique: true,
            trim: true,
            uppercase: true
        },

        manufacturer: {
            type: String,
            required: [true, "Manufacturer is required"],
            trim: true
        },

        category: {
            type: String,
            required: [true, "Category is required"],
            enum: {
                values: [
                    "Tablet",
                    "Syrup",
                    "Injection",
                    "Ointment",
                    "Other"
                ],
                message: "Invalid medicine category"
            }
        },

        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"]
        },

        quantityInStock: {
            type: Number,
            required: [true, "Quantity in stock is required"],
            min: [0, "Quantity in stock cannot be negative"],
            default: 0
        },

        reorderLevel: {
            type: Number,
            required: [true, "Reorder level is required"],
            min: [0, "Reorder level cannot be negative"]
        },

        batchNumber: {
            type: String,
            required: [true, "Batch number is required"],
            trim: true
        },

        expiryDate: {
            type: Date,
            required: [true, "Expiry date is required"]
        },

        prescriptionRequired: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

medicineSchema.index({
    name: "text",
    genericName: "text",
    manufacturer: "text",
    sku: "text"
});

medicineSchema.index({ category: 1 });
medicineSchema.index({ expiryDate: 1 });
medicineSchema.index({ quantityInStock: 1 });

export default mongoose.model("Medicine", medicineSchema);
