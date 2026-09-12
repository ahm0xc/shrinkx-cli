import { execSync } from "child_process";
import { Command } from "commander";
import pc from "picocolors";
import boxen from "boxen";
import { version } from "../../package.json";

const BASE_URL = "https://github.com/ahm0xc/shrinkx-cli/releases";

function detectArch(): string {
  switch (process.arch) {
    case "arm64": return "arm64";
    case "x64": return "amd64";
    default: return "unsupported";
  }
}

function detectOS(): string {
  switch (process.platform) {
    case "darwin": return "macos";
    case "linux": return "linux";
    default: return "unsupported";
  }
}

function findBinary(): string | null {
  try {
    const path = execSync("which shrinkx", { encoding: "utf-8" }).trim();
    return path || null;
  } catch {
    return null;
  }
}

export const upgrade = new Command("upgrade")
  .description("Upgrade shrinkx to the latest version")
  .option("-f, --force", "Force upgrade even if already up to date")
  .action(async (opts) => {
    const arch = detectArch();
    const os = detectOS();

    if (arch === "unsupported" || os === "unsupported") {
      console.log(pc.red(`Error: Unsupported platform: ${os}/${arch}`));
      return;
    }

    const binaryPath = findBinary();
    if (!binaryPath) {
      console.log(pc.red("Could not find shrinkx binary. Install it first using the install script."));
      console.log(pc.dim("Run: curl -fsSL https://github.com/ahm0xc/shrinkx-cli/raw/main/scripts/install.sh | sh"));
      return;
    }

    const currentVersion = version;
    console.log(pc.bold(`\nCurrent version: ${pc.cyan(currentVersion)}`));

    let latestVersion: string;
    try {
      const tag = execSync(
        `curl -fsSL "${BASE_URL}/latest" | grep -o '"tag_name": *"v[^"]*"' | head -1 | sed 's/.*: *"//;s/"//'`,
        { encoding: "utf-8" },
      ).trim();
      latestVersion = tag.replace(/^v/, "");
    } catch {
      console.log(pc.red("Failed to fetch latest version. Check your internet connection."));
      return;
    }

    if (latestVersion === currentVersion && !opts.force) {
      console.log(pc.green(`\nAlready on the latest version (${latestVersion}).`));
      return;
    }

    if (latestVersion === currentVersion && opts.force) {
      console.log(pc.yellow(`\nReinstalling version ${latestVersion}...`));
    } else {
      console.log(pc.bold(`Latest version: ${pc.cyan(latestVersion)}`));
      console.log(pc.bold(`\nUpgrading from ${currentVersion} to ${latestVersion}...\n`));
    }

    const downloadUrl = `${BASE_URL}/download/latest/shrinkx-${os}-${arch}`;

    try {
      execSync(`curl -fsSL "${downloadUrl}" -o "${binaryPath}"`, { stdio: "inherit" });
      execSync(`chmod +x "${binaryPath}"`, { stdio: "inherit" });

      const installedVersion = execSync(`${binaryPath} --version`, { encoding: "utf-8" }).trim();
      console.log(boxen(pc.green(`✓ Upgraded successfully to ${installedVersion}`), {
        padding: 1,
        borderColor: "green",
        margin: 1,
      }));
    } catch {
      console.log(pc.red("Upgrade failed. Please try again or reinstall manually."));
    }
  });
