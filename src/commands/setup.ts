import { execSync } from "child_process";
import { Command } from "commander";
import pc from "picocolors";
import boxen from "boxen";

type Platform = "darwin" | "linux" | "win32";

const PM: Record<Platform, { name: string; check: string; install: string }> = {
  darwin: {
    name: "Homebrew",
    check: "brew --version",
    install:
      '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
  },
  linux: {
    name: "apt",
    check: "apt-get --version",
    install: "sudo apt-get update",
  },
  win32: {
    name: "Chocolatey",
    check: "choco --version",
    install: "powershell -Command \"Set-ExecutionPolicy Bypass -Scope Process; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))\"",
  },
};

const DEPS = [
  {
    name: "ImageMagick",
    check: "magick --version",
    fallback: "convert --version",
    install: {
      darwin: "brew install imagemagick",
      linux: "sudo apt-get install -y imagemagick",
      win32: "choco install imagemagick -y",
    },
  },
] as const;

export const setup = new Command("setup")
  .description("Check and install required system dependencies")
  .option("--auto", "Automatically install missing dependencies")
  .action(async (opts) => {
    const platform = process.platform as "darwin" | "linux" | "win32";
    const missing: (typeof DEPS)[number][] = [];

    console.log(pc.bold("Checking dependencies...\n"));

    for (const dep of DEPS) {
      const installed = isInstalled(dep.check, dep.fallback);
      if (installed) {
        console.log(pc.green(`  ✓ ${dep.name}`));
      } else {
        console.log(pc.red(`  ✗ ${dep.name} ${pc.dim("(missing)")}`));
        missing.push(dep);
      }
    }

    if (missing.length === 0) {
      console.log(pc.green("\nAll dependencies are installed."));
      return;
    }

    const installCmds = missing.map(
      (d) => `  ${d.name}: ${pc.cyan(d.install[platform])}`,
    );

    console.log(
      boxen(
        `Missing dependencies:\n\n${installCmds.join("\n")}\n\n${pc.dim(
          "Run with --auto to install automatically",
        )}`,
        {
          padding: 1,
          borderColor: "yellow",
          title: pc.yellow("Action needed"),
        },
      ),
    );

    if (opts.auto) {
      const pm = PM[platform];

      if (!isInstalled(pm.check)) {
        console.log(pc.bold(`\n${pm.name} not found. Installing ${pm.name} first...\n`));
        try {
          execSync(pm.install, { stdio: "inherit" });
          console.log(pc.green(`  ✓ ${pm.name} installed\n`));
        } catch {
          console.log(pc.red(`  ✗ Failed to install ${pm.name}. Install it manually and try again.`));
          return;
        }
      }

      console.log(pc.bold("Installing dependencies...\n"));
      for (const dep of missing) {
        const cmd = dep.install[platform];
        console.log(pc.dim(`$ ${cmd}`));
        try {
          execSync(cmd, { stdio: "inherit" });
          console.log(pc.green(`  ✓ ${dep.name} installed\n`));
        } catch {
          console.log(pc.red(`  ✗ Failed to install ${dep.name}\n`));
        }
      }
    }
  });

function isInstalled(check: string, fallback?: string): boolean {
  try {
    execSync(check, { stdio: "ignore" });
    return true;
  } catch {
    if (fallback) {
      try {
        execSync(fallback, { stdio: "ignore" });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}
