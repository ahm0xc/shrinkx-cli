#!/usr/bin/env bun
import { Command } from "commander";

import { version } from "../package.json";
import { setup } from "./commands/setup";
import { compress, upgrade } from "./commands";

const program = new Command();
program.name("shrinkx").version(version, "-v, --version");

program.addCommand(setup);
program.addCommand(upgrade);

program
  .argument("<files...>", "Files or folders to compress")
  .option("--quality <number>", "Compression quality (0-100)", "75")
  .option("--depth <number>", "Folder traversal depth", "0")
  .option("--format <format>", "Target format to convert images to (jpg, png, webp, etc.)")
  .option("--only-images", "Only include image files")
  .option("--only-videos", "Only include video files")
  .option("--resize <width>", "Resize image dimensions (e.g. 1920x, 50%, or 1920x> to only shrink larger)", "0")
  .action((files, opts) => compress(files, opts));

program.parse(process.argv);
