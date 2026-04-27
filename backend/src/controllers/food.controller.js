const foodModel = require('../models/food.model');
const storageService = require('../services/storage.service');
const likeModel = require('../models/likes.model');
const saveModel = require('../models/save.model');
const { v4: uuid } = require("uuid")


async function createFood(req, res){
    try {
        const { name, description = '' } = req.body;

        if (!req.foodPartner) {
            return res.status(401).json({
                message: "Please login as a food partner first"
            });
        }

        if (!name?.trim()) {
            return res.status(400).json({
                message: "Food name is required"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                message: "Food video is required"
            });
        }

        const fileUploadResult = await storageService.uploadFile(req.file.buffer, {
            fileName: uuid(),
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            baseUrl: `${req.protocol}://${req.get('host')}`
        });

        const foodItem = await foodModel.create({
            name: name.trim(),
            description: description.trim(),
            video: fileUploadResult.url,
            foodPartner: req.foodPartner._id 
        });

        res.status(201).json({
            message: "Food created successfully",
            food: foodItem
        });
    } catch (error) {
        console.log("CREATE FOOD ERROR:", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
}

async function getFoodItems(req, res){
    try {
        const foodItems = await foodModel.find({}).sort({ createdAt: -1 });

        res.status(200).json({
            message: "Food items fetched successfully",
            foodItems
        });
    } catch (error) {
        console.log("GET FOOD ITEMS ERROR:", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
}

async function likeFood(req, res){
    try {
        const { foodId } = req.body;
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                message: "Please login first"
            });
        }

        if (!foodId) {
            return res.status(400).json({
                message: "Food ID is required"
            });
        }

        const food = await foodModel.findById(foodId);

        if (!food) {
            return res.status(404).json({
                message: "Food not found"
            });
        }

        const isAlreadyLiked = await likeModel.findOne({
            user: user._id,
            food: foodId
        });

        if(isAlreadyLiked) {
            await likeModel.deleteOne({
                user: user._id,
                food: foodId
            });

            await foodModel.findByIdAndUpdate(foodId, {
                $inc: { likeCount: -1 }
            });

            return res.status(200).json({
                message: "Food unliked successfully",
                like: false
            });
        }

        const like = await likeModel.create({
            user: user._id,
            food: foodId
        });

        await foodModel.findByIdAndUpdate( foodId, {
            $inc: { likeCount: 1 }
        });

        res.status(201).json({
            message: "Food liked successfully",
            like: true,
            likeEntry: like
        });
    } catch (error) {
        console.log("LIKE FOOD ERROR:", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
}

async function saveFood(req, res){
    try {
        const { foodId } = req.body;
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                message: "Please login first"
            });
        }

        if (!foodId) {
            return res.status(400).json({
                message: "Food ID is required"
            });
        }

        const food = await foodModel.findById(foodId);

        if (!food) {
            return res.status(404).json({
                message: "Food not found"
            });
        }

        const isAlreadySaved = await saveModel.findOne({
            user: user._id,
            food: foodId
        });

        if(isAlreadySaved){
            await saveModel.deleteOne({
                user: user._id,
                food: foodId
            });

            await foodModel.findByIdAndUpdate(foodId, {
                $inc: { savesCount: -1 }
            });

            return res.status(200).json({
                message: "Food unsaved successfully",
                save: false
            });
        }

        const save = await saveModel.create({
            user: user._id,
            food: foodId
        });

        await foodModel.findByIdAndUpdate(foodId, {
            $inc: { savesCount: 1 }
        });

        res.status(201).json({
            message: "Food saved successfully",
            save: true,
            saveEntry: save
        });
    } catch (error) {
        console.log("SAVE FOOD ERROR:", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
}

async function getSaveFood( req, res ){
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                message: "Please login first"
            });
        }

        const savedFoods = await saveModel
            .find({ user: user._id })
            .populate('food')
            .sort({ createdAt: -1 });

        const validSavedFoods = savedFoods.filter((item) => item.food);

        res.status(200).json({
            message: "Saved foods retrieved successfully",
            savedFoods: validSavedFoods
        });
    } catch (error) {
        console.log("GET SAVED FOOD ERROR:", error);
        res.status(500).json({
            message: "Server Error"
        });
    }
}

module.exports = {
    createFood,
    getFoodItems,
    likeFood,
    saveFood,
    getSaveFood
}
