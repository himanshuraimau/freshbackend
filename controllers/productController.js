import Product from '../models/productModel.js';
import { StatusCodes } from 'http-status-codes';

// Add product to specific device
export const addProduct = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const product = new Product({
      ...req.body,
      deviceData: deviceId
    });

    const savedProduct = await product.save();
    res.status(StatusCodes.CREATED).json({
      message: 'Product added to device successfully',
      product: savedProduct
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Error adding product to device',
      error: error.message
    });
  }
};

// Get all products for a specific device
export const getDeviceProducts = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const products = await Product.find({ deviceData: deviceId })
      .sort({ createdAt: -1 });  // Get latest products first

    res.status(StatusCodes.OK).json({
      count: products.length,
      products
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error fetching device products',
      error: error.message
    });
  }
};

// Create a new product
export const createProduct = async (req, res) => {
  try {
    const product = new Product({
      name: req.body.name,
      source: req.body.source,
      destination: req.body.destination,
      purchaseDate: req.body.purchaseDate,
      expiryDate: req.body.expiryDate,
      deviceData: req.body.deviceData,
      temperature: req.body.temperature,
      humidity: req.body.humidity,
      location: req.body.location
    });

    const savedProduct = await product.save();
    res.status(StatusCodes.CREATED).json(savedProduct);
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ 
      message: 'Error creating product',
      error: error.message 
    });
  }
};

// Delete a product by ID
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    
    if (!deletedProduct) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Product not found'
      });
    }

    res.status(StatusCodes.OK).json({
      message: 'Product deleted successfully',
      product: deletedProduct
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error deleting product',
      error: error.message
    });
  }
};
