#!/usr/bin/env bash
set -euo pipefail

INSTALL_DIR="${SHRINKX_INSTALL_DIR:-/usr/local/bin}"
VERSION="${1:-latest}"

detect_arch() {
  case "$(uname -m)" in
    arm64|aarch64) echo "arm64" ;;
    x86_64|amd64) echo "amd64" ;;
    *) echo "unsupported" ;;
  esac
}

detect_os() {
  case "$(uname -s)" in
    Darwin) echo "macos" ;;
    Linux) echo "linux" ;;
    *) echo "unsupported" ;;
  esac
}

ARCH=$(detect_arch)
OS=$(detect_os)

if [ "$ARCH" = "unsupported" ] || [ "$OS" = "unsupported" ]; then
  echo "Error: Unsupported platform: $OS/$ARCH" >&2
  exit 1
fi

BASE_URL="https://github.com/ahm0xc/shrinkx-cli/releases"
if [ "$VERSION" = "latest" ]; then
  LATEST_TAG=$(curl -fsSL "https://api.github.com/repos/ahm0xc/shrinkx-cli/releases/latest" | grep -o '"tag_name": *"v[^"]*"' | head -1 | sed 's/.*: *"//;s/"//')
  VERSION="${LATEST_TAG#v}"
  DOWNLOAD_URL="${BASE_URL}/download/${LATEST_TAG}/shrinkx-${OS}-${ARCH}"
else
  DOWNLOAD_URL="${BASE_URL}/download/v${VERSION}/shrinkx-${OS}-${ARCH}"
fi

echo "Downloading shrinkx v${VERSION} for ${OS}/${ARCH}..."
curl -fsSL "$DOWNLOAD_URL" -o "${INSTALL_DIR}/shrinkx"
chmod +x "${INSTALL_DIR}/shrinkx"

echo "shrinkx installed successfully at ${INSTALL_DIR}/shrinkx"
"${INSTALL_DIR}/shrinkx" --version 2>/dev/null || true
