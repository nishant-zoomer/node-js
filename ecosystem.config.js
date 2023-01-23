module.exports = {
  apps: [
    {
      "name": "TS",
      "script": "npm",
      "args": "run watch"
    },
    {
      name: "Admin_Auth",
      script: "dist/admin/services/auth.js",

    },
    {
      name: "Admin_User",
      script: "dist/admin/services/user.js",

    },
    {
      name: "Admin_Product",
      script: "dist/admin/services/product.js",

    },
    {
      name: "Admin_Store",
      script: "dist/admin/services/store.js",

    },
    {
      name: "Auth",
      script: "dist/services/auth.js",

    },
    {
      name: "Product",
      script: "dist/services/product.js",

    },
    {
      name: "Category",
      script: "dist/services/category.js",

    },
    {
      name: "Order",
      script: "dist/services/order.js",

    },
    {
      name: "Cart",
      script: "dist/services/cart.js",

    },


    {
      name: "Public",
      script: "dist/public.js",

    },

  ],
};
