#!/usr/bin/env bash
set -euo pipefail

INSTALL_DIR="${SHRINKX_INSTALL_DIR:-$HOME/.local/bin}"
MODE="${1:-install}"
VERSION="${2:-latest}"

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
    MINGW*|MSYS*|CYGWIN*|MINGW64*|MINGW32*) echo "windows" ;;
    *) echo "unsupported" ;;
  esac
}

ARCH=$(detect_arch)
OS=$(detect_os)

if [ "$OS" = "windows" ]; then
  echo "Error: Windows is not supported yet." >&2
  echo "shrinkx currently supports macOS and Linux only." >&2
  echo "Stay tuned for a Windows release!" >&2
  exit 1
fi

if [ "$ARCH" = "unsupported" ] || [ "$OS" = "unsupported" ]; then
  echo "Error: Unsupported platform: $OS/$ARCH" >&2
  exit 1
fi

STEP=0
progress() {
  STEP=$((STEP + 1))
  echo "[${STEP}] $1"
}

progress "Detecting platform: $OS/$ARCH"

BASE_URL="https://github.com/ahm0xc/shrinkx-cli/releases"
if [ "$VERSION" = "latest" ]; then
  progress "Fetching latest version..."
  LATEST_TAG=$(curl -fsSL "https://api.github.com/repos/ahm0xc/shrinkx-cli/releases/latest" | grep -o '"tag_name": *"v[^"]*"' | head -1 | sed 's/.*: *"//;s/"//')
  VERSION="${LATEST_TAG#v}"
  DOWNLOAD_URL="${BASE_URL}/download/${LATEST_TAG}/shrinkx-${OS}-${ARCH}"
else
  VERSION="${VERSION#v}"
  DOWNLOAD_URL="${BASE_URL}/download/v${VERSION}/shrinkx-${OS}-${ARCH}"
fi

progress "Download URL resolved: $DOWNLOAD_URL"

if [ "$MODE" = "upgrade" ]; then
  if [ ! -f "${INSTALL_DIR}/shrinkx" ]; then
    echo "Error: shrinkx not found at ${INSTALL_DIR}/shrinkx. Install it first." >&2
    exit 1
  fi
  echo ""
  progress "Upgrading shrinkx to v${VERSION}"
  mkdir -p "$INSTALL_DIR"
  progress "Downloading binary..."
  curl -fsSL --progress-bar "$DOWNLOAD_URL" -o "${INSTALL_DIR}/shrinkx.tmp"
  progress "Installing binary..."
  chmod +x "${INSTALL_DIR}/shrinkx.tmp"
  mv "${INSTALL_DIR}/shrinkx.tmp" "${INSTALL_DIR}/shrinkx"
  if [[ ":$PATH:" != *":${INSTALL_DIR}:"* ]]; then
    CONFIG_FILE="$HOME/.zshrc"
    if [ -f "$HOME/.bashrc" ]; then CONFIG_FILE="$HOME/.bashrc"; fi
    if [ -f "$HOME/.bash_profile" ]; then CONFIG_FILE="$HOME/.bash_profile"; fi
    echo "export PATH=\"\$PATH:${INSTALL_DIR}\"" >> "$CONFIG_FILE"
    echo ""
    echo "shrinkx upgraded successfully to v${VERSION}"
    echo "Run 'source ${CONFIG_FILE}' to use shrinkx in this terminal."
  else
    echo ""
    echo "shrinkx upgraded successfully to v${VERSION}"
  fi
  "${INSTALL_DIR}/shrinkx" --version
else
  echo ""
  progress "Installing shrinkx v${VERSION} for ${OS}/${ARCH}"
  mkdir -p "$INSTALL_DIR"
  progress "Downloading binary..."
  curl -fsSL --progress-bar "$DOWNLOAD_URL" -o "${INSTALL_DIR}/shrinkx"
  progress "Setting permissions..."
  chmod +x "${INSTALL_DIR}/shrinkx"
  progress "Verifying installation..."
  echo ""
  echo "shrinkx installed successfully at ${INSTALL_DIR}/shrinkx"
  if [[ ":$PATH:" != *":${INSTALL_DIR}:"* ]]; then
    CONFIG_FILE="$HOME/.zshrc"
    if [ -f "$HOME/.bashrc" ]; then CONFIG_FILE="$HOME/.bashrc"; fi
    if [ -f "$HOME/.bash_profile" ]; then CONFIG_FILE="$HOME/.bash_profile"; fi
    echo "export PATH=\"\$PATH:${INSTALL_DIR}\"" >> "$CONFIG_FILE"
    echo ""
    echo "Run 'source ${CONFIG_FILE}' to use shrinkx in this terminal."
  fi
  "${INSTALL_DIR}/shrinkx" --version 2>/dev/null || true
fi
