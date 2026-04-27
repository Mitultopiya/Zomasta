const foodPartnerModel = require('../models/foodpartner.model');
const foodModel = require('../models/food.model');

async function getFoodPartnerById(req, res) {
    try {

        const foodPartnerId = req.params.id;

        const foodPartner = await foodPartnerModel.findById(foodPartnerId);

        if(!foodPartner) {
            return res.status(404).json({ message: "Food partner not found" });
        }

        const foodItemsByFoodPartner = await foodModel
            .find({
                foodPartner: foodPartnerId
            })
            .sort({ createdAt: -1 });

        const totalSaves = foodItemsByFoodPartner.reduce((total, item) => total + (item.savesCount || 0), 0);

        res.status(200).json({
            message: "Food partner retrieved successfully",
            foodPartner: {
                ...foodPartner.toObject(),
                totalMeals: foodItemsByFoodPartner.length,
                totalSaves,
                foodItems: foodItemsByFoodPartner
            }
            
        });
    } catch (error) {
        console.log("GET FOOD PARTNER ERROR:", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

module.exports = {
    getFoodPartnerById
};
