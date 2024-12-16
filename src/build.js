const fs = require("fs");

const files_bundled = [
  "000.header.js",
  "001.ufs.js",
  "002.store.js",
  "999.footer.js",
].map(f => __dirname + "/lib/" + f);

const files_unbundled = [
  "000.header.js",
  // "001.ufs.js",
  "002.store.js",
  "999.footer.js",
].map(f => __dirname + "/lib/" + f);

const build_from_fileset = function(files, output_file) {
  let output = "";
  for(let index=0; index<files.length; index++) {
    const file = files[index];
    const content = fs.readFileSync(file).toString();
    output += content + "\n";
  }
  fs.writeFileSync(output_file, output, "utf8");
};

build_from_fileset(files_bundled, __dirname + "/../dist/store.js");
build_from_fileset(files_unbundled, __dirname + "/../dist/store.unbundled.js");