const User = require("../Models/userModel");
const Category = require("../Models/categoryModel");
const Product = require("../Models/productModel");
const Order = require("../Models/ordersModel");
const Coupon = require("../Models/couponModel");
const Brand = require("../Models/brandModel");
const upload = require("../Configure/multerConfig");
const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const Payment = require("../Models/paymentModel");
const moment = require("moment");
const saltround = 10;

const sessionCheck = function (req, res, next) {
  if (req.session.admin) {
    next();
  } else {
    res.render("admin/admin-login", { 
      warning: req.session.warning,
    });
  }
};

const login = async function (req, res) {
    let products = await Product.find({ isDeleted: false, categoryDeleted: false });
    products = products.sort((a, b) => b.sale - a.sale).slice(0, 10);
    let midProduct = Math.ceil(products.length / 2);
    let [firstHalf, secondHalf] = [products.slice(0, midProduct), products.slice(midProduct)];
    let categories = await Category.find({ isDeleted: false });
    categories.sort((a, b) => b.sale - a.sale);
    let label = [];
    categories.forEach((category) =>{
      label.push({name : category.categoryName, sale : category.sale ?? 0});
    })
    let brand = await Brand.find();
    brand.sort((a, b) => b.sale - a.sale);
    let mid = Math.ceil(brand.length / 2);
    let firstHalfBrand = brand.slice(0, mid);
    let secondHalfBrand = brand.slice(mid);

  res.render("admin/admin-home",{
    firstHalf,
    secondHalf,
    label,
    firstHalfBrand,
    secondHalfBrand,
    mid,
  });
};

const loginSub = async function (req, res) {
  try {
    const enterAdmin = req.body;
    const admin = await User.findOne({
      email: enterAdmin.email,
      role: "admin",
    });

    if (admin) {
      if (admin.isActive == true) {
        // const match = await bcrypt.compare(enterAdmin.password, admin.password);
        let match = false;
        if (enterAdmin.password == admin.password) {
          match = true;
        }
        if (match) {
          req.session.admin = enterAdmin.email;
          return res.redirect("/admin");
        } else {
          req.session.warning = "Invalid Password";
          return res.redirect("/admin");
        }
      } else {
        req.session.warning = "You are Blocked";
        return res.redirect("/admin");
      }
    } else {
      req.session.warning = "Invalid Email";
      return res.redirect("/admin");
    }
  } catch (error) {
    console.error("Login Error:", error);
    req.session.warning = "Something went wrong. Please try again.";
    res.redirect("/admin");
  }
};

const userManagement = async function (req, res) {
  try {
    const users = await User.find({ role: "user" });
    users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.render("admin/admin-userManagement", {
      users,
      searchText: "Search by Username & Email",
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).render("admin/admin-userManagement", {
      users: [],
      searchText: "Search by Username & Email",
      error: "Failed to load users. Please try again.",
    });
  }
};

const deleteUser = async function (req, res) {
  try {
    const deleteUser = req.body;
    const deletedUser = await User.findOneAndDelete({
      role: "user",
      email: deleteUser.email,
    });

    if (deletedUser) {
      res.render("admin/admin-userManagement", {
        warning: `${deleteUser.username} : This user has been successfully deleted`,
        searchText: "Search by Username & Email",
        users: await User.find({ role: "user" }),
      });
    } else {
      res.render("admin/admin-userManagement", {
        warning: "User not found",
        searchText: "Search by Username & Email",
        users: await User.find({ role: "user" }),
      });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).render("admin/admin-userManagement", {
      warning: "Something went wrong. Please try again.",
      searchText: "Search by Username & Email",
      users: await User.find({ role: "user" }),
    });
  }
};

const search = async function (req, res) {
  try {
    const search = req.body;

    if (!search.search || search.search.trim() === "") {
      return res.render("admin/admin-userManagement", {
        searchresult: "Please enter an input",
        type: "danger",
        searchText: "Search by Username & Email",
        users: await User.find({ role: "user" }),
      });
    }

    const results = await User.find({
      role: "user",
      $or: [
        { email: { $regex: search.search, $options: "i" } },
        { username: { $regex: search.search, $options: "i" } },
      ],
    });

    const combinedResults = results.filter(
      (value, index, self) =>
        index === self.findIndex((item) => item.email === value.email)
    );
    const total = combinedResults.length;

    res.render("admin/admin-userManagement", {
      searchresult:
        total !== 0
          ? `${total} ${total === 1 ? "User" : "Users"} Found`
          : `${search.search} : This user does not exist`,
      type: total !== 0 ? "success" : "danger",
      searchText: search.search,
      users: combinedResults,
    });
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).render("admin/admin-userManagement", {
      searchresult: "Something went wrong. Please try again.",
      type: "danger",
      searchText: "Search by Username & Email",
      users: await User.find({ role: "user" }),
    });
  }
};

const active = async function (req, res) {
  try {
    const users = await User.find({ role: "user", isActive: true });
    const total = users.length;

    res.render("admin/admin-userManagement", {
      searchresult:
        total !== 0
          ? `${total} Active ${total === 1 ? "User" : "Users"} Found`
          : `There Is No Active Users`,
      type: total !== 0 ? "success" : "danger",
      searchText: "Search by Username & Email",
      users: users,
      button: "active",
    });
  } catch (error) {
    console.error("Error fetching active users:", error);
    res.status(500).render("admin/admin-userManagement", {
      searchresult: "Something went wrong. Please try again.",
      type: "danger",
      searchText: "Search by Username & Email",
      users: [],
      button: "active",
    });
  }
};

const block = async function (req, res) {
  try {
    const users = await User.find({ role: "user", isActive: false });
    const total = users.length;

    res.render("admin/admin-userManagement", {
      searchresult:
        total !== 0
          ? `${total} Blocked ${total === 1 ? "User" : "Users"} Found`
          : "There Is No Blocked Users",
      type: total !== 0 ? "success" : "danger",
      searchText: "Search by Username & Email",
      users: users,
      button: "block",
    });
  } catch (error) {
    console.error("Error fetching blocked users:", error);
    res.status(500).render("admin/admin-userManagement", {
      searchresult: "Something went wrong. Please try again.",
      type: "danger",
      searchText: "Search by Username & Email",
      users: [],
      button: "block",
    });
  }
};

const addUser = function (req, res) {
  res.render("admin/admin-addUser");
};

const addUserSub = async function (req, res) {
  try {
    const addUser = req.body;

    
    addUser.isActive = addUser.isActive === "true";

    const existingUser = await User.findOne({
      role: "user",
      email: addUser.email,
    });

    if (existingUser) {
      return res.render("admin/admin-addUser", {
        existMail: `${addUser.email} : This email is already in use`,
      });
    }

    // Hash the password
    addUser.password = await bcrypt.hash(addUser.password, saltround);

    // Create and save new user
    const newUser = new User({
      ...addUser,
      updatedBy: req.session.admin,
    });
    await newUser.save();

    res.render("admin/admin-userManagement", {
      warning: `${addUser.username} : This User is successfully created`,
      searchText: "Search by Username & Email",
      users: await User.find({ role: "user" }),
    });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).render("admin/admin-addUser", {
      existMail: "Something went wrong. Please try again.",
    });
  }
};

const editUser = async function (req, res) {
  try {
    const editUser = req.body;
    const user = await User.findOne({ role: "user", email: editUser.email });

    if (user) {
      res.render("admin/admin-editUser", { users: [user] });
    } else {
      res.render("admin/admin-userManagement", {
        searchresult: "User not found",
        type: "danger",
        searchText: "Search by Username & Email",
        users: await User.find({ role: "user" }),
      });
    }
  } catch (error) {
    console.error("Error fetching user for edit:", error);
    res.status(500).render("admin/admin-userManagement", {
      searchresult: "Something went wrong. Please try again.",
      type: "danger",
      searchText: "Search by Username & Email",
      users: await User.find({ role: "user" }),
    });
  }
};

const editUserSub = async function (req, res) {
  try {
    const editUser = req.body;
    const editUserId = new ObjectId(editUser._id);
    const editUserSD = await User.findOne({ role: "user", _id: editUserId });
    const date = new Date().toString();

    if (!editUserSD) {
      return res.render("admin/admin-userManagement", {
        warning: "User not found",
        searchText: "Search by Username & Email",
        users: await User.find({ role: "user" }),
      });
    }

    // Convert isActive to boolean
    editUser.isActive = editUser.isActive === "true";

    if (editUser.password) {
      const match = await bcrypt.compare(
        editUser.password,
        editUserSD.password
      );

      if (match) {
        return res.render("admin/admin-editUser", {
          noMatch: "This is the current password. Please enter a new password.",
          users: [editUserSD],
        });
      } else {
        editUser.password = await bcrypt.hash(editUser.password, saltround);
      }
    }

    await User.findOneAndUpdate(
      { _id: editUserId },
      {
        $set: {
          username: editUser.username,
          phoneNumber: editUser.phoneNumber,
          ...(editUser.password && { password: editUser.password }),
          isActive: editUser.isActive,
          updatedAt: date,
          updatedBy: req.session.admin,
        },
      }
    );

    res.render("admin/admin-userManagement", {
      warning: `${editUser.username} : This user has been successfully updated`,
      searchText: "Search by Username & Email",
      users: await User.find({ role: "user" }),
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).render("admin/admin-userManagement", {
      warning: "Something went wrong. Please try again.",
      searchText: "Search by Username & Email",
      users: await User.find({ role: "user" }),
    });
  }
};

async function count() {
  try {
    const categories = await Category.find();

    const productCounts = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    const categoriesWithCounts = categories.map((category) => ({
      ...category.toObject(),
      productCount:
        productCounts.find((pc) => pc._id.equals(category._id))?.count || 0,
    }));

    return categoriesWithCounts;
  } catch (error) {
    console.error("Error fetching category counts:", error);
    return [];
  }
}

const category = async function (req, res) {
  try {
    const categories = await count();
    res.render("admin/admin-category", {
      category: categories,
      searchText: "Search by Category Name",
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).render("admin/admin-category", {
      category: [],
      searchText: "Search by Category Name",
      error: "Something went wrong. Please try again later.",
    });
  }
};

const addCategory = function (req, res) {
  res.render("admin/admin-addCategory");
};

const addCategorySub = async function (req, res) {
  try {
    const addCategory = req.body;
    const exist = await Category.findOne({
      categoryName: {
        $regex: new RegExp(`^${addCategory.categoryName}$`, "i"),
      },
    });

    if (exist) {
      return res.render("admin/admin-addCategory", {
        existCategory: `${addCategory.categoryName} : This category name already exists`,
      });
    } else {
      const newCategory = new Category({
        ...addCategory,
        createdBy: req.session.admin,
        updatedBy: req.session.admin,
      });

      await newCategory.save();

      res.render("admin/admin-category", {
        warning: `${addCategory.categoryName} : This Category is successfully created`,
        searchText: "Search by Category Name",
        category: await count(),
      });
    }
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).render("admin/admin-addCategory", {
      existCategory: "Something went wrong. Please try again later.",
    });
  }
};

const deleteCategory = async function (req, res) {
  try {
    const deleteCategory = req.body;
    const productCount = deleteCategory.productCount;
    const deleteCategoryDB = await Category.findOne({
      categoryName: deleteCategory.categoryName,
    });

    if (!deleteCategoryDB) {
      return res.render("admin/admin-category", {
        info: `Category not found.`,
        searchText: "Search by Category Name",
        category: await count(),
      });
    }

    const isDeleted = deleteCategoryDB.isDeleted;
    const updatedCategory = await Category.findOneAndUpdate(
      { categoryName: deleteCategory.categoryName },
      { $set: { isDeleted: !isDeleted } },
      { new: true }
    );
    const result = await Product.updateMany(
      { category: deleteCategoryDB._id },
      [{ $set: { categoryDeleted: { $not: "$categoryDeleted" } } }]
    );

    const message = updatedCategory.isDeleted
      ? `${deleteCategory.categoryName} : This category has been successfully soft deleted.`
      : `${deleteCategory.categoryName} : This category has been successfully restored.`;

    return res.render("admin/admin-category", {
      warning: message,
      searchText: "Search by Category Name",
      category: await count(),
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).render("admin/admin-category", {
      info: "Something went wrong. Please try again later.",
      searchText: "Search by Category Name",
      category: await count(),
    });
  }
};

const categorySearch = async function (req, res) {
  try {
    const search = req.body;
    const results = await Category.find({
      categoryName: { $regex: search.search, $options: "i" },
    });

    const combinedResults = results.filter(
      (value, index, self) =>
        index ===
        self.findIndex((item) => item.categoryName === value.categoryName)
    );
    const total = combinedResults.length;
    const categoriesWithCounts = await count();
    const resultwithCount = combinedResults.map((result) => {
      const matchedCategory = categoriesWithCounts.find((category) =>
        category._id.equals(result._id)
      );
      return {
        ...result._doc, // Extract the _doc field
        productCount: matchedCategory ? matchedCategory.productCount : 0, // Add productCount
      };
    });

    if (search.search === "") {
      return res.render("admin/admin-category", {
        searchresult: "Please enter an input",
        type: "danger",
        searchText: "Enter an input here",
        category: await count(),
      });
    } else if (total !== 0) {
      return res.render("admin/admin-category", {
        searchresult: `${total} ${
          total === 1 ? "category" : "categories"
        } Found`,
        type: "success",
        searchText: search.search,
        category: resultwithCount,
      });
    } else {
      return res.render("admin/admin-category", {
        searchresult: `${search.search} : This category does not exist`,
        type: "danger",
        searchText: search.search,
        category: resultwithCount,
      });
    }
  } catch (error) {
    console.error("Error searching categories:", error);
    res.status(500).render("admin/admin-category", {
      searchresult: "Something went wrong. Please try again later.",
      type: "danger",
      searchText: "Enter an input here",
      category: await count(),
    });
  }
};

const editCategory = async function (req, res) {
  try {
    const editCategory = req.body;
    const category = await Category.find({
      categoryName: editCategory.categoryName,
    });

    if (!category.length) {
      return res.render("admin/admin-editCategory", {
        error: `Category ${editCategory.categoryName} not found.`,
        category: [],
      });
    }

    res.render("admin/admin-editCategory", {
      category: category,
    });
  } catch (error) {
    console.error("Error fetching category for edit:", error);
    res.status(500).render("admin/admin-editCategory", {
      error: "Something went wrong. Please try again later.",
      category: [],
    });
  }
};

const editCategorySub = async function (req, res) {
  try {
    const editCategory = req.body;
    const editCategoryId = new ObjectId(editCategory._id);
    const editCategorySD = await Category.findOne({ _id: editCategoryId });
    const date = new Date().toString();
    if (!editCategorySD) {
      return res.render("admin/admin-editCategory", {
        error: "Category not found.",
        category: [],
      });
    }
    async function offerPrice() {
      if (editCategory.offer != editCategorySD.offer) {
        let products = await Product.find({ category: editCategorySD._id });
        for (let product of products) {
          let totalOffer = Number(product.offer) + Number(editCategory.offer);
          let discountAmount = (Number(product.price) * totalOffer) / 100;
          let finalPrice = Number(product.price) - discountAmount;
          finalPrice = Math.round(finalPrice);
          product.categoryOfferPrice = finalPrice;
          await product.save();
        }
      }
    }

    if (editCategory.categoryName != editCategorySD.categoryName) {
      const check = await Category.findOne({
        categoryName: editCategory.categoryName,
      });

      if (check) {
        return res.render("admin/admin-editCategory", {
          category: await Category.find({ _id: editCategoryId }),
          existCategory: `${editCategory.categoryName} : This category name already exists`,
        });
      } else {
        await Category.findOneAndUpdate(
          { _id: editCategoryId },
          {
            $set: {
              categoryName: editCategory.categoryName,
              offer: editCategory.offer,
              description: editCategory.description,
              updatedBy: req.session.admin,
              updatedAt: date,
            },
          }
        );
        offerPrice();
        return res.render("admin/admin-category", {
          warning: `${editCategory.categoryName} : This category has been successfully updated`,
          searchText: "Search by Category Name",
          category: await count(),
        });
      }
    } else {
      await Category.findOneAndUpdate(
        { _id: editCategoryId },
        {
          $set: {
            categoryName: editCategory.categoryName,
            offer: editCategory.offer,
            description: editCategory.description,
            updatedBy: req.session.admin,
            updatedAt: date,
          },
        }
      );
      offerPrice();
      return res.render("admin/admin-category", {
        warning: `${editCategory.categoryName} : This category has been successfully updated`,
        searchText: "Search by Category Name",
        category: await count(),
      });
    }
  } catch (error) {
    console.error("Error updating category:", error);
    return res.status(500).render("admin/admin-editCategory", {
      error: "Something went wrong. Please try again later.",
      category: [],
    });
  }
};

const productManagement = async function (req, res) {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = 5; 
    let skip = (page - 1) * limit;
    let products = await Product.find();
    const categoryDB = await Category.find();
    products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    let totalItems = products.length;
    let totalPages = Math.ceil(totalItems / limit);
    products = products.slice(skip, skip + limit);
    res.render("admin/admin-product", {
      products: products,
      categoryDB: categoryDB,
      searchText: "Search by Name, Brand & Category",
      currentPage: page, 
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching products or categories:", error);
    res.status(500).render("admin/admin-product", {
      error:
        "Something went wrong while fetching products or categories. Please try again later.",
      products: [],
      categoryDB: [],
      searchText: "Search by Name, Brand & Category",
    });
  }
};

const addProduct = async function (req, res) {
  try {
    const categories = await Category.find({ isDeleted: false });

    res.render("admin/admin-addProduct", {
      category: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).render("admin/admin-addProduct", {
      error:
        "Something went wrong while fetching categories. Please try again later.",
      category: [],
    });
  }
};

const addProductSub = function (req, res) {
  upload.array("productImage", 10)(req, res, async function (error) {
    try {
      if (error) {
        console.error("File upload error:", error);
        return res.render("admin/admin-addProduct", {
          category: await Category.find(),
          error: "Error uploading product images. Please try again.",
        });
      }

      const addProduct = req.body;
      const categoryDoc = await Category.findOne({
        categoryName: addProduct.category,
      });

      if (!categoryDoc) {
        return res.render("admin/admin-addProduct", {
          category: await Category.find(),
          error: "Category not found.",
        });
      }

      addProduct.category = categoryDoc._id;

      const exist = await Product.findOne({
        category: addProduct.category,
        brand: addProduct.brand,
        name: addProduct.name,
        size: addProduct.size,
      });

      if (exist) {
        return res.render("admin/admin-addProduct", {
          category: await Category.find(),
          warning: `${addProduct.brand}'s ${addProduct.name} in size ${addProduct.size} already exists in the ${categoryDoc.categoryName}'s category.`,
        });
      } else {
        let totalOffer = Number(addProduct.offer) + Number(categoryDoc.offer);
        let discountAmount = (Number(addProduct.price) * totalOffer) / 100;
        let finalPrice = Number(addProduct.price) - discountAmount;
        finalPrice = Math.round(finalPrice);
        const product = new Product({
          name: addProduct.name,
          description: addProduct.description,
          category: addProduct.category,
          price: addProduct.price,
          size: addProduct.size,
          ...(addProduct.colors && { colors: JSON.parse(addProduct.colors) }),
          offer: addProduct.offer,
          offerPrice: addProduct.offerPrice,
          categoryOfferPrice: finalPrice,
          brand: addProduct.brand,
          quantity: addProduct.quantity,
          productImage: req.files.map((file) => ({
            data: file.buffer,
            contentType: file.mimetype,
          })),
          categoryDeleted: categoryDoc.isDeleted,
          createdBy: req.session.admin,
          updatedBy: req.session.admin,
        });
        await product.save();
        let brand = await Brand.findOne({ name : addProduct.brand })
        if(!brand){
          brand = new Brand({
            name: addProduct.brand,
          });
          await brand.save();
        }
        let page = parseInt(req.query.page) || 1;
        let limit = 5; 
        let skip = (page - 1) * limit;
        let products = await Product.find();
        products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        let totalItems = products.length;
        let totalPages = Math.ceil(totalItems / limit);
        products = products.slice(skip, skip + limit);
        res.render("admin/admin-product", {
          products: products,
          searchText: "Search by Name , Brand & Category",
          categoryDB: await Category.find(),
          warning: `${addProduct.brand}'s ${addProduct.name} has been successfully added to the ${categoryDoc.categoryName}'s category.`,
        });
      }
    } catch (error) {
      console.error("Error in addProductSub:", error);
      res.render("admin/admin-addProduct", {
        category: await Category.find(),
        error:
          "Something went wrong while adding the product. Please try again.",
      });
    }
  });
};

const instock = async function (req, res) {
  try {
    const products = await Product.find({ quantity: { $gt: 0 } });
    const total = products.length;

    if (total !== 0) {
      res.render("admin/admin-product", {
        searchresult: `${total} in stock ${
          total === 1 ? "product" : "products"
        } found`,
        type: "success",
        searchText: "Search by Name , Brand & Category",
        products: products,
        categoryDB: await Category.find(),
        button: "in",
      });
    } else {
      res.render("admin/admin-product", {
        searchresult: `There are no in-stock products`,
        type: "danger",
        searchText: "Search by Name , Brand & Category",
        products: products,
        categoryDB: await Category.find(),
        button: "in",
      });
    }
  } catch (error) {
    console.error("Error fetching in-stock products:", error);
    res.render("admin/admin-product", {
      searchresult: "An error occurred while fetching the in-stock products.",
      type: "danger",
      searchText: "Search by Name , Brand & Category",
      products: [],
      categoryDB: await Category.find(),
      button: "in",
    });
  }
};

const outofstock = async function (req, res) {
  try {
    const products = await Product.find({ quantity: 0 });
    const total = products.length;

    if (total !== 0) {
      res.render("admin/admin-product", {
        searchresult: `${total} out of stock ${
          total === 1 ? "product" : "products"
        } found`,
        type: "success",
        searchText: "Search by Name , Brand & Category",
        products: products,
        categoryDB: await Category.find(),
        button: "out",
      });
    } else {
      res.render("admin/admin-product", {
        searchresult: `There are no out-of-stock products`,
        type: "danger",
        searchText: "Search by Name , Brand & Category",
        products: products,
        categoryDB: await Category.find(),
        button: "out",
      });
    }
  } catch (error) {
    console.error("Error fetching out-of-stock products:", error);
    res.render("admin/admin-product", {
      searchresult:
        "An error occurred while fetching the out-of-stock products.",
      type: "danger",
      searchText: "Search by Name , Brand & Category",
      products: [],
      categoryDB: await Category.find(),
      button: "out",
    });
  }
};

const productSearch = async function (req, res) {
  try {
    const search = req.body;

    const matchingProducts1 = await Product.find({
      $or: [
        { name: { $regex: search.search, $options: "i" } },
        { brand: { $regex: search.search, $options: "i" } },
      ],
    });

    const matchingCategory = await Category.find({
      categoryName: { $regex: search.search, $options: "i" },
    });

    const matchingProducts2 = await Product.find({
      category: {
        $in: matchingCategory.map((category) => category._id),
      },
    });

    const seen = new Set();
    const uniqueResults = [...matchingProducts1, ...matchingProducts2].filter(
      (item) => {
        const duplicate = seen.has(item._id.toString());
        seen.add(item._id.toString());
        return !duplicate;
      }
    );

    const total = uniqueResults.length;
    if (search.search === "") {
      res.render("admin/admin-product", {
        searchresult: "Please enter an input",
        type: "danger",
        searchText: "Enter an input here",
        products: await Product.find(),
        categoryDB: await Category.find(),
      });
    } else if (total !== 0) {
      res.render("admin/admin-product", {
        searchresult: `${total} ${total === 1 ? "product" : "products"} Found`,
        type: "success",
        searchText: search.search,
        products: uniqueResults,
        categoryDB: await Category.find(),
      });
    } else {
      res.render("admin/admin-product", {
        searchresult: `${search.search} : This product does not exist`,
        type: "danger",
        searchText: search.search,
        products: uniqueResults,
        categoryDB: await Category.find(),
      });
    }
  } catch (error) {
    console.error("Error during product search:", error);
    res.render("admin/admin-product", {
      searchresult: "An error occurred while searching for products.",
      type: "danger",
      searchText: "Enter an input here",
      products: await Product.find(),
      categoryDB: await Category.find(),
    });
  }
};

const deleteProduct = async function (req, res) {
  try {
    const deleteProductdata = req.body;
    const deleteProductId = new ObjectId(deleteProductdata.id);
    const deleteProductedDB = await Product.findOne({ _id: deleteProductId });
    const deleteproductCategoryDB = await Category.findOne({
      _id: deleteProductedDB.category,
    });

    if (deleteProductedDB.isDeleted) {
      if (deleteproductCategoryDB.isDeleted) {
        res.render("admin/admin-product", {
          products: await Product.find(),
          searchText: "Search by Name , Brand & Category",
          categoryDB: await Category.find(),
          warningInfo: `The product's category '${deleteproductCategoryDB.categoryName}' is inactive. Restore the category to proceed.`,
        });
      } else {
        await Product.findOneAndUpdate(
          { _id: deleteProductId },
          {
            $set: {
              isDeleted: false,
            },
          }
        );
        res.render("admin/admin-product", {
          products: await Product.find(),
          searchText: "Search by Name , Brand & Category",
          categoryDB: await Category.find(),
          warning: `${deleteProductedDB.brand}'s ${deleteProductedDB.name} has been restored to the ${deleteproductCategoryDB.categoryName}'s category.`,
        });
      }
    } else if (!deleteProductedDB.isDeleted) {
      await Product.findOneAndUpdate(
        { _id: deleteProductId },
        {
          $set: {
            isDeleted: true,
          },
        }
      );
      res.render("admin/admin-product", {
        products: await Product.find(),
        searchText: "Search by Name , Brand & Category",
        categoryDB: await Category.find(),
        warning: `${deleteProductedDB.brand}'s ${deleteProductedDB.name} has been soft deleted from the ${deleteproductCategoryDB.categoryName}'s category. You can restore it anytime.`,
      });
    }
  } catch (error) {
    console.error("Error during product deletion:", error);
    res.render("admin/admin-product", {
      products: await Product.find(),
      searchText: "Search by Name , Brand & Category",
      categoryDB: await Category.find(),
      searchresult: "An error occurred while deleting the product.",
      type: "danger",
    });
  }
};

const editProduct = async function (req, res) {
  try {
    const editProduct = req.body;
    const productId = new ObjectId(editProduct.id);
    const product = await Product.findOne({ _id: productId });

    if (!product) {
      return res.render("admin/admin-product", {
        searchresult: "Product not found.",
        type: "danger",
        searchText: "Search by Name , Brand & Category",
        products: await Product.find(),
        categoryDB: await Category.find(),
      });
    }

    res.render("admin/admin-editProduct", {
      product: product,
      categoryDB: await Category.find(),
    });
  } catch (error) {
    console.error("Error during product edit:", error);
    res.render("admin/admin-product", {
      searchresult: "An error occurred while fetching the product details.",
      type: "danger",
      searchText: "Search by Name , Brand & Category",
      products: await Product.find(),
      categoryDB: await Category.find(),
    });
  }
};

const editProductSub = async function (req, res) {
  try {
    upload.array("productImage", 10)(req, res, async function () {
      const editProductData = req.body;
      const productId = new ObjectId(editProductData._id);
      const productDB = await Product.findOne({ _id: productId });
      const categoryDoc = await Category.findOne({
        categoryName: editProductData.category,
      });
      editProductData.category = categoryDoc._id;
      const date = new Date().toString();

      let totalOffer =
        Number(editProductData.offer) + Number(categoryDoc.offer);
      let discountAmount = (Number(editProductData.price) * totalOffer) / 100;
      let finalPrice = Number(editProductData.price) - discountAmount;
      finalPrice = Math.round(finalPrice);

      async function update() {
        await Product.findByIdAndUpdate(productId, {
          $set: {
            name: editProductData.name,
            description: editProductData.description,
            category: editProductData.category,
            price: editProductData.price,
            size: editProductData.size,
            ...(editProductData.colors && {
              colors: JSON.parse(editProductData.colors),
            }),
            offer: editProductData.offer,
            offerPrice: editProductData.offerPrice,
            categoryOfferPrice: finalPrice,
            brand: editProductData.brand,
            quantity: editProductData.quantity,
            productImage: req.files.map((file) => ({
              data: file.buffer,
              contentType: file.mimetype,
            })),
            categoryDeleted: categoryDoc.isDeleted,
            updatedAt: date,
            updatedBy: req.session.admin,
          },
        });
        let brand = await Brand.findOne({ name : editProductData.brand })
        if(!brand){
          brand = new Brand({
            name: editProductData.brand,
          });
          await brand.save();
        }
        let page = parseInt(req.query.page) || 1;
        let limit = 5; 
        let skip = (page - 1) * limit;
        let products = await Product.find();
        products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        let totalItems = products.length;
        let totalPages = Math.ceil(totalItems / limit);
        products = products.slice(skip, skip + limit);
        res.render("admin/admin-product", {
          products: products,
          searchText: "Search by Name , Brand & Category",
          categoryDB: await Category.find(),
          warning: `${editProductData.brand}'s ${editProductData.name} in the ${categoryDoc.categoryName}'s category  has been successfully updated`,
          currentPage: page, 
          totalPages,
        });
      }

      if (
        editProductData.name !== productDB.name ||
        editProductData.brand !== productDB.brand ||
        editProductData.category.toString() !== productDB.category.toString()
      ) {
        const exist = await Product.findOne({
          category: categoryDoc._id,
          brand: editProductData.brand,
          name: editProductData.name,
          size: editProductData.size,
        });
        if (exist) {
          res.render("admin/admin-editProduct", {
            product: productDB,
            categoryDB: await Category.find(),
            warning: `${editProductData.brand}'s ${editProductData.name} in size ${editProductData.size} already exists in the category ${categoryDoc.categoryName}`,
          });
        } else {
          await update();
        }
      } else {
        await update();
      }
    });
  } catch (error) {
    console.error("Error during product update:", error);
    res.render("admin/admin-product", {
      products: await Product.find(),
      searchText: "Search by Name , Brand & Category",
      categoryDB: await Category.find(),
      warning:
        "An error occurred while updating the product. Please try again.",
    });
  }
};

const orderManagement = async function (req, res) {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = 5; 
    let skip = (page - 1) * limit;
    let orders = await Order.find();
    orders.forEach(async (order) => {
      let user = await User.findById(order.userId);
      order.user = user?.email;
    });
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    let totalItems = orders.length;
    let totalPages = Math.ceil(totalItems / limit);
    orders = orders.slice(skip, skip + limit);
    res.render("admin/admin-order", {
      order: orders,
      searchText: "Search by user and id ",
      currentPage: page, 
      totalPages,
    });
  } catch (error) {
    console.error("Error during order management:", error);
    res.render("admin/admin-order", {
      orders: [],
      searchText: "Search by user and id",
      type: "danger",
    });
  }
};

const orderStatus = async function (req, res) {
  try {
    let orderStatus = req.body;
    orderStatus = {
      id: orderStatus.id,
      shipped: JSON.parse(orderStatus.shipped),
      outForDelivery: JSON.parse(orderStatus.outForDelivery),
      delivered: JSON.parse(orderStatus.delivered),
    };
    const orderId = new ObjectId(orderStatus.id);
    const orderDB = await Order.findOne({ _id: orderId });

    if (orderStatus.shipped != orderDB.deliveryStatus.shipped) {
      orderDB.deliveryStatus.shipped = orderStatus.shipped;
      orderDB.deliveryStatus.shippedDate = new Date().toString();
    }
    if (orderStatus.outForDelivery != orderDB.deliveryStatus.OutOfDelivery) {
      orderDB.deliveryStatus.OutOfDelivery = orderStatus.outForDelivery;
      orderDB.deliveryStatus.OutOfDeliveryDate = new Date().toString();
    }
    if (orderStatus.delivered != orderDB.deliveryStatus.delivered) {
      orderDB.deliveryStatus.delivered = orderStatus.delivered;
      orderDB.deliveryStatus.deliveredDate = new Date().toString();
      if (orderDB.deliveryStatus.delivered == true) {
        orderDB.status = "delivered";
      } else {
        orderDB.status = "pending";
      }
    }
    await orderDB.save();
    res.status(200).json({ status: true });
  } catch (error) {
    console.error("Error during order status update:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

const pending = async function (req, res) {
  try {
    let orders = await Order.find({ status: "pending" });
    orders.forEach(async (order) => {
      let user = await User.findById(order.userId);
      order.user = user.email;
    });
    const total = orders.length;

    if (total !== 0) {
      res.render("admin/admin-order", {
        searchresult: `${total} pending ${
          total === 1 ? "order" : "orders"
        } found`,
        type: "success",
        searchText: "Search by user and id",
        order: orders,
        button: "p",
      });
    } else {
      res.render("admin/admin-order", {
        searchresult: `There are no pending orders`,
        type: "danger",
        searchText: "Search by user and id",
        order: orders,
        button: "p",
      });
    }
  } catch (error) {
    console.error("Error fetching pending orders:", error);
    res.render("admin/admin-order", {
      searchresult: "An error occurred while fetching the pending orders.",
      type: "danger",
      searchText: "Search by user and id",
      order: [],
      button: "p",
    });
  }
};

const delivered = async function (req, res) {
  try {
    let orders = await Order.find({ status: "delivered" });
    orders.forEach(async (order) => {
      let user = await User.findById(order.userId);
      order.user = user.email;
    });
    const total = orders.length;

    if (total !== 0) {
      res.render("admin/admin-order", {
        searchresult: `${total} delivered ${
          total === 1 ? "order" : "orders"
        } found`,
        type: "success",
        searchText: "Search by user and id",
        order: orders,
        button: "d",
      });
    } else {
      res.render("admin/admin-order", {
        searchresult: `There are no delivered orders`,
        type: "danger",
        searchText: "Search by user and id",
        order: orders,
        button: "d",
      });
    }
  } catch (error) {
    console.error("Error fetching delivered orders:", error);
    res.render("admin/admin-order", {
      searchresult: "An error occurred while fetching the delivered orders.",
      type: "danger",
      searchText: "Search by user and id",
      oeder: [],
      button: "d",
    });
  }
};

const cancelled = async function (req, res) {
  try {
    let orders = await Order.find({ status: "cancelled" });
    orders.forEach(async (order) => {
      let user = await User.findById(order.userId);
      order.user = user.email;
    });
    const total = orders.length;

    if (total !== 0) {
      res.render("admin/admin-order", {
        searchresult: `${total} cancelled ${
          total === 1 ? "order" : "orders"
        } found`,
        type: "success",
        searchText: "Search by user and id",
        order: orders,
        button: "c",
      });
    } else {
      res.render("admin/admin-order", {
        searchresult: `There are no cancelled orders`,
        type: "danger",
        searchText: "Search by user and id",
        order: orders,
        button: "c",
      });
    }
  } catch (error) {
    console.error("Error fetching cancelled orders:", error);
    res.render("admin/admin-order", {
      searchresult: "An error occurred while fetching the cancelled orders.",
      type: "danger",
      searchText: "Search by user and id",
      order: [],
      button: "c",
    });
  }
};

const returned = async function (req, res) {
  try {
    let orders = await Order.find({ status: "returned" });
    orders.forEach(async (order) => {
      let user = await User.findById(order.userId);
      order.user = user.email;
    });
    const total = orders.length;

    if (total !== 0) {
      res.render("admin/admin-order", {
        searchresult: `${total} returned ${
          total === 1 ? "order" : "orders"
        } found`,
        type: "success",
        searchText: "Search by user and id",
        order: orders,
        button: "r",
      });
    } else {
      res.render("admin/admin-order", {
        searchresult: `There are no returned orders`,
        type: "danger",
        searchText: "Search by user and id",
        order: orders,
        button: "r",
      });
    }
  } catch (error) {
    console.error("Error fetching returned orders:", error);
    res.render("admin/admin-order", {
      searchresult: "An error occurred while fetching the returned orders.",
      type: "danger",
      searchText: "Search by user and id",
      order: [],
      button: "r",
    });
  }
};

const orderSearch = async function (req, res) {
  try {
    let searchText = req.body.search?.toLowerCase() || "";

    let orders = await Order.find({}).lean();

    for (let order of orders) {
      let user = await User.findById(order.userId);
      order.user = user?.email?.toLowerCase() || "";
    }

    orders = orders.filter((order) => order.user.includes(searchText));

    let orderid = await Order.find({}).lean();
    orderid = orderid.filter((order) =>
      order.order_id.toLowerCase().includes(searchText.toLowerCase())
    );

    let combinedOrders = [...orders, ...orderid];

    orders = Array.from(
      new Map(
        combinedOrders.map((order) => [order._id.toString(), order])
      ).values()
    );

    orders.forEach(async (order) => {
      let user = await User.findById(order.userId);
      order.user = user.email;
    });

    const total = orders.length;

    if (searchText === "") {
      res.render("admin/admin-order", {
        searchresult: "Please enter an input",
        type: "danger",
        searchText: "Enter an input here",
        order: [],
      });
    }
    if (total !== 0) {
      res.render("admin/admin-order", {
        searchresult: `${total} ${total === 1 ? "order" : "orders"} Found`,
        type: "success",
        searchText: searchText,
        order: orders,
      });
    } else {
      res.render("admin/admin-order", {
        searchresult: `${search.search} : This order does not exist`,
        type: "danger",
        searchText: searchText,
        order: orders,
      });
    }
  } catch (error) {
    console.error("Error fetching search orders:", error);
    res.render("admin/admin-order", {
      searchresult: "An error occurred while searching orders.",
      type: "danger",
      searchText: "Search by user and id",
      order: [],
    });
  }
};

const offer = async (req, res) => {
  try {
    const coupon = await Coupon.find();
    coupon.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.render("admin/admin-offer", {
      coupon,
    });
  } catch (error) {
    console.error("Error updating offer:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

const addCoupon = async (req, res) => {
  try {
    let added = false;
    let addData = req.body;
    if (!/^[a-zA-Z0-9]{4}$/.test(addData.couponCode)) {
      return res.status(400).json({
        added: false,
        error: "Coupon code must be exactly 4 digits.",
      });
    }
    if (parseInt(addData.minPrice) >= parseInt(addData.maxPrice)) {
      return res.status(400).json({
        added: false,
        error: "Max Purchase must be greater than Min Purchase.",
      });
    }
    let exist = await Coupon.findOne({ couponCode: addData.couponCode });
    if (!exist) {
      addData.expiresAt = moment(addData.expiresAt, "DD-MM-YYYY").toDate();
      added = true;
      const newCoupon = new Coupon({
        couponCode: addData.couponCode,
        discountValue: addData.offer,
        minPurchase: addData.minPrice,
        maxPurchase: addData.maxPrice,
        expiresAt: addData.expiresAt,
      });
      await newCoupon.save();
    }

    res.status(200).json({ added });
  } catch (error) {
    console.error("Error adding coupon:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

const editCoupon = async (req, res) => {
  try {
    let editted = false;
    let editData = req.body;
    let id = new ObjectId(editData.id);
    let exist = "";
    let editDataDB = await Coupon.findOne({ _id: id });

    if (editDataDB.couponCode !== editData.couponCode) {
      exist = await Coupon.findOne({ couponCode: editData.couponCode });
    }

    if (!exist) {
      editted = true;
      editData.expiresAt = moment(editData.expiresAt, "DD-MM-YYYY").toDate();
      editDataDB.couponCode = editData.couponCode;
      editDataDB.discountValue = editData.offer;
      editDataDB.minPurchase = editData.minPrice;
      editDataDB.maxPurchase = editData.maxPrice;
      editDataDB.expiresAt = editData.expiresAt;

      await editDataDB.save();
    }

    res.status(200).json({ editted });
  } catch (error) {
    console.error("Error editing coupon:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

const report = async (req, res) => {
  try {
    let totalPages=null
    let page=null
    let filter = req.body ?? "";
    let isFilter = false;
    let data = [];
    let reportData = null
    if (filter.filter) {
      isFilter = true;
      if (filter.filter == "Total") {
        let orders = await Order.find({status: { $nin: ["cancelled", "returned"] }}).lean();
        let pay = await Payment.find({
          $nor: [{ method: "COD", payed: false }],
        }).lean();
        let sales = orders.reduce(
          (total, num) => total + Number(num.totalAmount),
          0
        );
        let discount = orders.reduce(
          (total, num) => total + Number(num.discountAmount ?? 0),
          0
        );
        let coupon = orders.filter((oder) => oder.couponCode);

        data.push({
          _id: "Total",
          oders: orders.length,
          sales: sales,
          discount: discount,
          coupon: coupon.length,
        });
      } else if (filter.filter == "Weekly") {
        const resultWeek = await Order.aggregate([
          {
            $match: {status: { $nin: ["cancelled", "returned"] }}
          },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                week: { $isoWeek: "$createdAt" },
              },
              sales: { $sum: "$totalAmount" },
              oders: { $sum: 1 },
              discount: { $sum: { $ifNull: ["$discountAmount", 0] } },
              coupon: {
                $sum: {
                  $cond: {
                    if: { $gt: ["$couponCode", null] },
                    then: 1,
                    else: 0,
                  },
                },
              },
              firstOrderDate: { $min: "$createdAt" },
              lastOrderDate: { $max: "$createdAt" },
            },
          },
          {
            $project: {
              _id: {
                $concat: [
                  {
                    $dateToString: {
                      format: "%d - %b - %Y",
                      date: "$firstOrderDate",
                    },
                  },
                  " to ",
                  {
                    $dateToString: {
                      format: "%d - %b - %Y",
                      date: "$lastOrderDate",
                    },
                  },
                ],
              },
              sales: 1,
              oders: 1,
              discount: 1,
              coupon: 1,
            },
          },
          { $sort: { firstOrderDate: -1 } },
        ]);
        data = resultWeek;
      } else if (filter.filter == "Monthly") {
        const resultMonth = await Order.aggregate([
          { $match: { status: { $nin: ["cancelled", "returned"] } } },
          {
            $group: {
              _id: { $dateToString: { format: "%b - %Y", date: "$createdAt" } },
              sales: { $sum: "$totalAmount" },
              oders: { $sum: 1 },
              discount: { $sum: "$discountAmount" ?? 0 },
              coupon: {
                $sum: {
                  $cond: {
                    if: { $gt: ["$couponCode", null] },
                    then: 1,
                    else: 0,
                  },
                },
              },
            },
          },
          { $sort: { _id: -1 } },
        ]);
        data = resultMonth;
      } else if (filter.filter == "Yearly") {
        const resultYear = await Order.aggregate([
          {  $match: {status: { $nin: ["cancelled", "returned"] }} },
          {
            $group: {
              _id: { $dateToString: { format: "%Y", date: "$createdAt" } },
              sales: { $sum: "$totalAmount" },
              oders: { $sum: 1 },
              discount: { $sum: "$discountAmount" ?? 0 },
              coupon: {
                $sum: {
                  $cond: {
                    if: { $gt: ["$couponCode", null] },
                    then: 1,
                    else: 0,
                  },
                },
              },
            },
          },
          { $sort: { _id: -1 } },
        ]);
        data = resultYear;
      } else if (filter.filter == "Custom") {
        filter.dateRange = filter.dateRange.split(" to ");
        if (filter.dateRange.length == 2) {
          const startOfDay = new Date(filter.dateRange[0]);
          const endOfDay = new Date(filter.dateRange[1]);

          const resultCustom = await Order.aggregate([
            {
              $match: {
                status: { $nin: ["cancelled", "returned"] },
                createdAt: { $gte: startOfDay, $lte: endOfDay },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%d - %b - %Y", date: "$createdAt" },
                },
                sales: { $sum: "$totalAmount" },
                oders: { $sum: 1 },
                discount: { $sum: "$discountAmount" ?? 0 },
                coupon: {
                  $sum: {
                    $cond: {
                      if: { $gt: ["$couponCode", null] },
                      then: 1,
                      else: 0,
                    },
                  },
                },
              },
            },
            { $sort: { _id: -1 } },
          ]);
          filter.dateRange = filter.dateRange.join(" to ");
          data = resultCustom;
        } else {
          const specificDate = new Date(filter.dateRange[0]);
          const startOfDay = new Date(specificDate.setHours(0, 0, 0, 0));
          const endOfDay = new Date(specificDate.setHours(23, 59, 59, 999));
          const resultOneDay = await Order.aggregate([
            {
              $match: {
                status: { $nin: ["cancelled", "returned"] },
                createdAt: { $gte: startOfDay, $lte: endOfDay },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%d - %b - %Y", date: "$createdAt" },
                },
                sales: { $sum: "$totalAmount" },
                oders: { $sum: 1 },
                discount: { $sum: "$discountAmount" ?? 0 },
                coupon: {
                  $sum: {
                    $cond: {
                      if: { $gt: ["$couponCode", null] },
                      then: 1,
                      else: 0,
                    },
                  },
                },
              },
            },
          ]);
          data = resultOneDay;
        }
      }
    } else {
      const resultDay = await Order.aggregate([
        { $match: { status: { $nin: ["cancelled", "returned"] } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%d - %b - %Y", date: "$createdAt" },
            },
            sales: { $sum: "$totalAmount" },
            oders: { $sum: 1 },
            discount: { $sum: "$discountAmount" ?? 0 },
            coupon: {
              $sum: {
                $cond: { if: { $gt: ["$couponCode", null] }, then: 1, else: 0 },
              },
            },
          },
        },
        { $sort: { _id: -1 } },
      ]);
      data = resultDay;
      reportData = data
      page = parseInt(req.query.page) || 1;
      let limit = 5; 
      let skip = (page - 1) * limit;
      let totalItems = data.length;
      totalPages = Math.ceil(totalItems / limit);
      data = data.slice(skip, skip + limit);
    }
    if(reportData == null){
      reportData = data;
    }
  

    res.render("admin/admin-report", {
      filteredData: filter,
      isFilter: isFilter,
      data: data,
      currentPage: page, 
      totalPages,
      reportData,
    });
  } catch (error) {
    console.error("Error fetching page:", error);
    res.redirect({ error: "Something went wrong " });
  }
};

const download = async (req, res) => {
  try {
    const { format, data } = req.query;
    const sendData = JSON.parse(decodeURIComponent(data));

    let filePath = "";

    if (format === "excel") {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sales Report");

      worksheet.addRow([
        "No",
        "Date",
        "Sales",
        "Orders",
        "Discount",
        "Coupon Used",
      ]);
      sendData.forEach((row, i) => {
        worksheet.addRow([
          i + 1,
          row._id,
          "₹ " + row.sales,
          row.oders,
          "₹ " + row.discount,
          row.coupon,
        ]);
      });

      filePath = path.join(__dirname, "../public/files/sales_report.xlsx");
      await workbook.xlsx.writeFile(filePath);
    } else {
      const doc = new PDFDocument({ margin: 30 });
      const fontPath = path.join(__dirname, "../public/font/NotoSans.ttf");
      doc.registerFont("NotoSans", fontPath);
      doc.font("NotoSans");
      filePath = path.join(__dirname, "../public/files/sales_report.pdf");

      doc.pipe(fs.createWriteStream(filePath));

      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .text("Sales Report", { align: "center" })
        .moveDown(1);

      const tableTop = doc.y + 10;
      const startX = 50;
      const columnWidths = [50, 120, 80, 80, 80, 80];

      doc
        .rect(
          startX,
          tableTop,
          columnWidths.reduce((a, b) => a + b),
          25
        )
        .fill("#d3d3d3");
      doc.fillColor("black").fontSize(12).font("Helvetica-Bold");

      const headers = ["No", "Date", "Sales", "Orders", "Discount", "Coupon"];
      let xPos = startX;
      headers.forEach((header, i) => {
        doc.text(header, xPos + 5, tableTop + 7, {
          width: columnWidths[i],
          align: "center",
        });
        xPos += columnWidths[i];
      });

      doc.moveDown();
      doc
        .strokeColor("black")
        .lineWidth(1)
        .moveTo(startX, tableTop + 25)
        .lineTo(550, tableTop + 25)
        .stroke();

      let rowY = tableTop + 30;
      sendData.forEach((row, i) => {
        let xPos = startX;
        doc.fontSize(10).font("NotoSans").fillColor("black");

        const rowData = [
          i + 1,
          row._id,
          "\u20B9 " + row.sales,
          row.oders,
          "\u20B9 " + row.discount,
          row.coupon,
        ];

        rowData.forEach((text, index) => {
          doc.text(String(text), xPos + 5, rowY + 5, {
            width: columnWidths[index],
            align: "center",
          });
          xPos += columnWidths[index];
        });

        doc
          .moveTo(startX, rowY + 20)
          .lineTo(550, rowY + 20)
          .stroke();

        rowY += 25;
      });

      doc.end();
    }

    setTimeout(() => {
      res.download(filePath, path.basename(filePath), (err) => {
        if (err) {
          console.error("❌ Error downloading file:", err);
          return res
            .status(500)
            .json({ success: false, message: "Failed to download report." });
        }
        fs.unlinkSync(filePath);
      });
    }, 1000);
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

const logOut = function (req, res) {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/admin");
  });
};

module.exports = {
  sessionCheck,
  login,
  loginSub,
  userManagement,
  deleteUser,
  search,
  active,
  block,
  addUser,
  addUserSub,
  editUser,
  editUserSub,
  category,
  addCategory,
  addCategorySub,
  deleteCategory,
  categorySearch,
  editCategory,
  editCategorySub,
  productManagement,
  addProduct,
  addProductSub,
  instock,
  outofstock,
  productSearch,
  deleteProduct,
  editProduct,
  editProductSub,
  orderManagement,
  orderStatus,
  delivered,
  pending,
  cancelled,
  returned,
  orderSearch,
  offer,
  addCoupon,
  editCoupon,
  report,
  download,
  logOut,
};
