#!/usr/bin/env bun
import { Command } from "commander";

import { version } from "../package.json";

const program = new Command();
program.name("shrinkx").version(version, "-v, --version");

program.parse(process.argv);
