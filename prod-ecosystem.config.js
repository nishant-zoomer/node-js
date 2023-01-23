module.exports = {
  apps: [

    {
      name: "fr_admin",
      script: "dist/admin/app.js",

    },
    {
      name: "fr_app",
      script: "dist/users/app.js",

    },

    {
      name: "fr_public",
      script: "dist/public.js",

    },

    {
      name: "fr_socket",
      script: "dist/socket/index.js",

    },

  ],
};
