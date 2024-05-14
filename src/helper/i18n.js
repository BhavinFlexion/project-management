const I18n = require("i18n");
const path = require("path");

const i18n = I18n.configure({
  locales: ["en"],
  defaultLocale: "en",
  directory: path.resolve(__dirname, "../locales"),
});

module.exports = I18n;
