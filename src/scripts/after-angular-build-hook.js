// File needs to be CommonJs
const fs = require("fs");

const INDEX_HTML_PATH = "./www/index.html";
const htmlContent =
  '<script type="text/javascript">const currentLocale = navigator.language; if (currentLocale === "de") { window.location.href = "./de/index.html"; } else { window.location.href = "./en/index.html"; } </script>';

module.exports = function () {
  console.log("creating index.html...");
  createIndexHtml();
};

function createIndexHtml() {
  fs.writeFile(INDEX_HTML_PATH, htmlContent, (error) => {
    if (error) {
      throw new Error(`Error writing file: ${INDEX_HTML_PATH}`, { cause: error });
    } else {
      console.log("Successfully created file:", INDEX_HTML_PATH);
    }
  });
}