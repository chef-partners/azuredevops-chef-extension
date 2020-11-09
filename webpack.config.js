// include libs
const path = require("path");
const fs = require("fs");

// initialise the copy-webpack-plugin so that the task.json files are
// copied into the dist folder for each task
const copyWebpackPlugin = require("copy-webpack-plugin");

// build up the entries to be compiled
const entries = {};
const srcDir = path.join(__dirname, "src");
fs.readdirSync(srcDir)
  .filter(dir => fs.statSync(path.join(srcDir, dir)).isDirectory() && dir != "common")
  .forEach(dir => (entries[dir] = "./" + path.join("src", dir, dir)))

var config = {
  devtool: "inline-source-map",
  devServer: {
    https: true,
    port: 3000,
    contentBase: path.join(__dirname, "build", "preview")
  },
  entry: entries,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node-modules/
      }
    ]
  },
  output: {
    publicPath: "/dist/",
    filename: "[name]/[name].js"
  },  
  plugins: [
    new copyWebpackPlugin({
      patterns: [
        {
          from: "**/task.json",
          context: "src"
        },
        {
          from: "**/icon.png",
          context: "src"
        },
        {
          from: "conf/*.json",
          to: "../.."
        },
        {
          from: "common",
          to: "common",
          context: "src"
        }
      ]
    })
  ],
  resolve: {
    extensions: [
      ".ts",
      ".js",
      ".json"
    ]
  },
  target: 'node'
};

module.exports = (env, argv) => {

  // function variables
  // - set the type the build
  var buildType = "preview";

  // - define buildPath
  var buildPath;

  // if the DEV env var is true, then set the development path to the dev build
  if (argv.mode == "development" && process.env.dev == "true") {
    buildType = "dev"
  }

  // if the mode is production set the buildType
  if (argv.mode == "production") {
    buildType = "release";
  }

  // set the build path
  buildPath = path.join(__dirname, "build", buildType, "tasks");

  console.log(buildPath);
  config.output.path = buildPath;

  return config;
};