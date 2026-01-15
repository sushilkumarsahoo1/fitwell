module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            "@": "./",
            "@context": "./src/context",
            "@screens": "./src/screens",
            "@components": "./src/components",
            "@hooks": "./src/hooks",
            "@utils": "./src/utils",
            "@types": "./src/types",
            "@constants": "./src/constants",
            "@services": "./src/services",
          },
        },
      ],
    ],
  };
};
