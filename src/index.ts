#!/usr/bin/env bun
import { Command } from "commander";

import { version } from "../package.json";
import { setup } from "./commands/setup";

const program = new Command();
program.name("shrinkx").version(version, "-v, --version");

program.addCommand(setup);

program.parse(process.argv);
