import Medicine from "../models/medicine.model.js"

async function findAll(filters,skip,limit){
    return Medicine.find(filters).sort({name: 1}).skip(skip)
    .limit(limit).lean();
}

async function count(){
    return Medicine.countDocuments()
}

async function findById(id){
    return Medicine.findById(id);
}

async function findBySku(sku){
    return Medicine.findOne({sku});
}

async function create(data){
    const med=await Medicine.create(data);
    return med.toObject();
}

async function updateById(id,data){
    return Medicine.findByIdAndUpdate(
        id,
        data,
        {
            new:true,
            runValidators:true
        }
    )
}

async function adjustStock(id, quantity) {
    return Medicine.findByIdAndUpdate(
        id,
        {
            $inc: {
                quantityInStock: quantity
            }
        },
        {
            new: true,
            runValidators: true
        }
    ).lean();
}

async function deleteById(id) {
    return Medicine.findByIdAndDelete(id).lean();
}

async function findExpiring(startDate, endDate) {
    return Medicine.find({
        expiryDate: {
            $gte: startDate,
            $lte: endDate
        }
    })
        .sort({ expiryDate: 1 })
        .lean();
}
const MedRepo = {
    findAll,count,findById,findBySku,findExpiring,adjustStock,create,updateById,deleteById
}
export default MedRepo