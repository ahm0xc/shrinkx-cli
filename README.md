# shrinkx

<p align="center">
  <img src="https://img.shields.io/badge/version-0.0.1-blue" alt="Version" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
</p>

<p align="center">
  A fast, lightweight CLI tool for optimizing and compressing media files.
</p>

---

## ✨ Features

- **Image Compression** &mdash; Minify and convert images with intelligent optimization
- **Format Conversion** &mdash; Convert between supported formats (JPEG, PNG, WebP, AVIF)
- **Resize Capabilities** &mdash; Scale images by percentage or fixed dimensions
- **Directory Traversal** &mdash; Compress entire folders with configurable depth
- **Cross-Platform** &mdash; Works on macOS, Linux, and Windows
- **Zero Configuration** &mdash; Sensible defaults, powerful options when you need them

---

## 📦 Installation

### Quick Install (curl)

```bash
curl -fsSL https://github.com/ahm0xc/shrinkx-cli/raw/main/scripts/install.sh | sh
```

Or install a specific version:

```bash
curl -fsSL https://github.com/ahm0xc/shrinkx-cli/raw/main/scripts/install.sh | sh -s -- install v0.0.1
```

### Upgrade

Upgrade to the latest version using the built-in command:

```bash
shrinkx upgrade
```

Or use the install script with upgrade mode:

```bash
curl -fsSL https://github.com/ahm0xc/shrinkx-cli/raw/main/scripts/install.sh | sh -s -- upgrade
```

Or upgrade to a specific version:

```bash
curl -fsSL https://github.com/ahm0xc/shrinkx-cli/raw/main/scripts/install.sh | sh -s -- upgrade v0.0.1
```

---

## 🚀 Usage

```bash
shrinkx <files...> [options]
```

Compress one or more image files or directories.

### Options

| Option               | Description                                               | Default |
| -------------------- | --------------------------------------------------------- | ------- |
| `<files...>`         | Files or folders to compress                              | —       |
| `--quality <number>` | Compression quality (0–100)                               | `75`    |
| `--depth <number>`   | Folder traversal depth                                    | `0`     |
| `--format <format>`  | Target format to convert images to (jpg, png, webp, avif) | —       |
| `--only-images`      | Only include image files                                  | —       |
| `--only-videos`      | Only include video files                                  | —       |
| `--resize <width>`   | Resize dimensions (e.g. `1920x`, `50%`, `1920x>`, `50%>`) | `0`     |

### Examples

```bash
# Compress a single image with default settings
shrinkx photo.png

# Compress multiple images with custom quality
shrinkx photo1.png photo2.jpg --quality 80

# Convert all PNGs in a directory to WebP
shrinkx ./images --format webp

# Compress all images in a folder recursively
shrinkx ./assets --depth 2

# Resize and compress an image
shrinkx banner.png --resize 1920x --quality 85

# Compress only images, skipping any video files
shrinkx ./media --only-images
```

### Setup

Ensure required dependencies are installed:

```bash
shrinkx setup
```

Use `--auto` to automatically install missing dependencies:

```bash
shrinkx setup --auto
```

---

## 🛠️ Development

> Development guide will be available soon. Stay tuned!

---

## 🤝 Contributing

> Contribution guide will be available soon. Stay tuned!

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
