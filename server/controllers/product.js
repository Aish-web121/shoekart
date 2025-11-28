require("dotenv").config();
const product = require("../models/product");
const asyncErrorHandler = require("../middleware/asyncErrorHandler");
const errorHandler = require("../utils/errorHandler");
const order = require("../models/order");
const user = require("../models/user");
const brands = require("../models/brands");
const category = require("../models/category");

// GET /api/v1/product (root) and /api/v1/product/filter
const getProducts = asyncErrorHandler(async (req, res, next) => {
  // defensive defaults
  const page = req.query && req.query.page ? Math.max(0, parseInt(req.query.page) - 1) : 0;
  const limit = req.query && req.query.limit ? parseInt(req.query.limit) : 12;
  const search = req.query && req.query.search ? req.query.search : "";
  const sortParam = (req.query && req.query.sortBy && req.query.sortBy.value) ? req.query.sortBy.value : "createdAt_asc";
  const colors = (req.query && req.query.color) ? req.query.color : [];
  const sizes = (req.query && req.query.size) ? req.query.size : [];
  const brand = (req.query && req.query.brand) ? req.query.brand : [];
  const priceRange = (req.query && req.query.price) ? req.query.price : { minPrice: 0, maxPrice: Number.POSITIVE_INFINITY };
  const categoryOpt = (req.query && req.query.category) ? req.query.category : "";

  const query = {
    name: { $regex: search, $options: "i" },
    price: {
      $gte: Number.isFinite(Number(priceRange.minPrice)) ? parseInt(priceRange.minPrice) : 0,
      $lte: Number.isFinite(Number(priceRange.maxPrice)) ? parseInt(priceRange.maxPrice) : Number.POSITIVE_INFINITY,
    },
    isActive: true,
  };

  if (brand && Array.isArray(brand) && brand.length > 0) {
    query.brand = { $in: brand.map((b) => b) };
  }

  if (colors && Array.isArray(colors) && colors.length > 0) {
    query.color = { $in: colors.map((c) => new RegExp(`^${c}$`, "i")) };
  }

  if (sizes && Array.isArray(sizes) && sizes.length > 0) {
    query["sizeQuantity.size"] = { $in: sizes.map(Number) };
  }

  if (categoryOpt) {
    query.category = { $regex: categoryOpt, $options: "i" };
  }

  let sortField = "createdAt";
  let sortOrder = 1;
  if (sortParam) {
    const [field, order] = sortParam.split("_");
    if (field) sortField = field;
    if (order && order.toLowerCase() === "desc") sortOrder = -1;
  }

  const products = await product
    .find(query)
    .sort({ [sortField]: sortOrder })
    .skip(page * limit)
    .limit(limit);

  const colorOptions = await product.distinct("color");
  const brandOption = await brands.find({}).select("name");
  const brandOptions = brandOption.map((b) => b.name);
  const categoryOption = await category.find({}).select("name");
  const categoryOptions = categoryOption.map((c) => c.name);
  const total = await product.countDocuments(query);

  res.status(200).json({
    success: true,
    count: total,
    products,
    colorOptions,
    brandOptions,
    categoryOptions,
  });
});

const getProduct = asyncErrorHandler(async (req, res, next) => {
  const { slug } = req.params;
  const productExists = await product.findOne({ slug, isActive: true });
  if (!productExists) return next(new errorHandler("No such product exist", 404));
  return res.status(200).json({ success: true, data: productExists });
});

// Lightweight stubs for admin endpoints to avoid crashes (they can be replaced with full logic later)
const createProduct = asyncErrorHandler(async (req, res, next) => {
  return res.status(501).json({ success: false, message: "createProduct not implemented in hotfix" });
});
const updateProduct = asyncErrorHandler(async (req, res, next) => {
  return res.status(501).json({ success: false, message: "updateProduct not implemented in hotfix" });
});
const updateReview = asyncErrorHandler(async (req, res, next) => {
  return res.status(501).json({ success: false, message: "updateReview not implemented in hotfix" });
});
const getFilterOptions = asyncErrorHandler(async (req, res, next) => {
  const colors = await product.distinct("color");
  const brandsList = await brands.find({}).select("name");
  const categoryList = await category.find({}).select("name");
  res.status(200).json({ success: true, colors, brands: brandsList, category: categoryList });
});
const getFeaturedProducts = asyncErrorHandler(async (req, res, next) => {
  const featured = await product.find({ isFeatured: true }).limit(12);
  res.status(200).json({ success: true, products: featured });
});

module.exports = {
  createProduct,
  getProducts,
  getFilterOptions,
  getProduct,
  updateReview,
  getFeaturedProducts,
  updateProduct,
};
