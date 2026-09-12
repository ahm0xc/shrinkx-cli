import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import pc from "picocolors";

import { IMAGE_FORMATS, VIDEO_FORMATS } from "../constants";
import { isValidFormat } from "../utils";
import { upgrade } from "./upgrade";

export { upgrade };

export function compress(
  files: string[],
  opts: {
    quality: string;
    depth: string;
    resize?: string;
    format?: string;
    onlyImages?: boolean;
    onlyVideos?: boolean;
  },
) {
  if (opts.format && !isValidFormat(opts.format)) {
    console.log(pc.red(`Invalid format: ${opts.format}`));
    console.log(
      pc.dim(
        `Supported formats: ${[...IMAGE_FORMATS, ...VIDEO_FORMATS].join(", ")}`,
      ),
    );
    return;
  }

  if (opts.resize && opts.resize !== "0" && !isValidResize(opts.resize)) {
    console.log(pc.red(`Invalid resize: ${opts.resize}`));
    console.log(
      pc.dim(
        "Valid formats: 1920x, 1920x1080, 1920x>, 50%, 50%>",
      ),
    );
    return;
  }

  const allFiles: string[] = [];
  const depth = parseInt(opts.depth, 10);

  for (const file of files) {
    const resolved = path.resolve(file);
    if (fs.statSync(resolved).isDirectory()) {
      const dirFiles = getFiles(resolved, depth);
      const filtered = dirFiles.filter((f) => isMedia(f, opts));
      allFiles.push(...filtered);
    } else if (isMedia(resolved, opts)) {
      allFiles.push(resolved);
    }
  }

  console.log(pc.bold("\nFiles:"));
  allFiles.forEach((f) => console.log(`  ${f}`));
  console.log(pc.bold("\nOptions:"));
  console.log(`  Quality: ${opts.quality}`);
  console.log(`  Depth: ${opts.depth}`);
  if (opts.resize && opts.resize !== "0")
    console.log(`  Resize: ${opts.resize}`);
  if (opts.format) console.log(`  Format: ${opts.format}`);
  if (opts.onlyImages) console.log(`  Only Images: true`);
  if (opts.onlyVideos) console.log(`  Only Videos: true`);
  console.log();

  for (const file of allFiles) {
    const ext = getExt(file);
    const isImg = IMAGE_FORMATS.has(ext);
    const isVid = VIDEO_FORMATS.has(ext);
    const targetFormat = opts.format?.toLowerCase();

    if (isImg && targetFormat) {
      if (ext === targetFormat) {
        console.log(
          pc.dim(`Skipping ${file} - already in ${targetFormat} format`),
        );
        continue;
      }
      console.log(pc.bold(`Converting ${file} -> ${targetFormat}`));
      convertImage(file, targetFormat, opts.quality, opts.resize);
    } else if (isImg) {
      console.log(pc.bold(`Minifying ${file}`));
      minifyImage(file, opts.quality, opts.resize);
    } else if (isVid && targetFormat) {
      console.log(pc.dim(`Skipping video ${file} - keeping original format`));
    }
  }
}

function isMedia(
  filePath: string,
  opts: { format?: string; onlyImages?: boolean; onlyVideos?: boolean },
): boolean {
  const ext = getExt(filePath);
  const isImg = IMAGE_FORMATS.has(ext);
  const isVid = VIDEO_FORMATS.has(ext);

  if (!isImg && !isVid) return false;
  if (opts.onlyVideos && !isVid) return false;
  if (opts.onlyImages && !isImg) return false;

  return true;
}

function getExt(filePath: string): string {
  return filePath.split(".").pop()?.toLowerCase() ?? "";
}

function isValidResize(value: string): boolean {
  return /^\d+x(\d*>?)?$/.test(value) || /^\d+%>?$/.test(value);
}

function getFiles(dir: string, depth: number, currentDepth = 0): string[] {
  const entries = fs.readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    if (fs.statSync(fullPath).isDirectory() && currentDepth < depth) {
      files.push(...getFiles(fullPath, depth, currentDepth + 1));
    } else if (fs.statSync(fullPath).isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

function convertImage(
  inputFile: string,
  targetFormat: string,
  quality: string,
  resize?: string,
) {
  const outputFile = `${path.join(path.dirname(inputFile), path.basename(inputFile, path.extname(inputFile)))}.${targetFormat}`;
  const cmd = buildMagickCommand(
    inputFile,
    outputFile,
    quality,
    targetFormat,
    resize,
  );
  try {
    execSync(cmd, { stdio: "inherit" });
    fs.unlinkSync(inputFile);
    console.log(pc.green(`  ✓ Converted ${inputFile} -> ${outputFile}`));
  } catch {
    console.log(pc.red(`  ✗ Failed to convert ${inputFile}`));
  }
}

function minifyImage(file: string, quality: string, resize?: string) {
  const ext = getExt(file);
  const tmpFile = `${file}.tmp`;
  const cmd = buildMagickCommand(file, tmpFile, quality, ext, resize);
  try {
    execSync(cmd, { stdio: "inherit" });
    fs.renameSync(tmpFile, file);
    console.log(pc.green(`  ✓ Minified ${file}`));
  } catch {
    console.log(pc.red(`  ✗ Failed to minify ${file}`));
    try {
      fs.unlinkSync(tmpFile);
    } catch {}
  }
}

function buildMagickCommand(
  input: string,
  output: string,
  quality: string,
  format: string,
  resize?: string,
): string {
  const fmt = format.toLowerCase();
  const defines: string[] = [];
  const optimizations: string[] = [];
  const resizeCmd = resize && resize !== "0" ? `-resize ${resize}` : "";

  switch (fmt) {
    case "png":
      defines.push(`-define png:compression-level=9`);
      defines.push(`-define png:compression-strategy=1`);
      optimizations.push(`-optimize`);
      break;
    case "webp":
      defines.push(`-define webp:method=6`);
      optimizations.push(`-layers optimize`);
      break;
    case "jpg":
    case "jpeg":
      optimizations.push(`-sampling-factor 4:2:0`);
      optimizations.push(`-interlace JPEG`);
      optimizations.push(`-layers optimize`);
      break;
    case "avif":
      defines.push(`-define avif:speed=1`);
      break;
  }

  const defineStr = defines.join(" ");
  const optimizeStr = optimizations.join(" ");
  const strip = "-strip";

  return `magick "${input}" ${resizeCmd} ${strip} ${optimizeStr} ${defineStr} -quality ${quality} "${output}"`;
}
