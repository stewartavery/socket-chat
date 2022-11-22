import { Configuration } from "webpack";
import path from "path";
import "webpack-dev-server";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env: any, argv: any) => {
  return {
    mode: "development",
    entry: "./src/index.tsx",
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.css$/i,
          use: [
            "style-loader",
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                hmr: argv.mode === "development",
              },
            },
            "css-loader",
            "postcss-loader",
          ],
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "index.html"),
      }),
      new MiniCssExtractPlugin({
        filename: "[name].bundle.css",
        chunkFilename: "[id].css",
      }),
    ],
    devtool: "inline-source-map",
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    devServer: {
      historyApiFallback: true,
      port: 8080,
      proxy: {
        "/": "http://localhost:3000",
      },
    },
    output: {
      filename: "bundle.js",
      path: path.resolve(__dirname, "dist"),
    },
  };
};
