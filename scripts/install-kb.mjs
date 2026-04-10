#!/usr/bin/env node

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const source = path.join(repoRoot, "dist", "src", "cli.js");
const targetDir = path.join(os.homedir(), ".local", "bin");
const target = path.join(targetDir, "kb");

async function main() {
  await assertBuiltCliExists(source);
  await fs.mkdir(targetDir, { recursive: true });

  const existing = await readExistingTarget(target);
  if (existing?.kind === "symlink" && existing.resolved === source) {
    console.log(`kb is already linked: ${target} -> ${source}`);
    return;
  }

  if (existing) {
    throw new Error(
      `Refusing to overwrite existing ${existing.kind} at ${target}. Remove it manually, then rerun npm run install:kb.`
    );
  }

  await fs.symlink(source, target);
  console.log(`Linked kb: ${target} -> ${source}`);
}

async function assertBuiltCliExists(filePath) {
  try {
    await fs.access(filePath);
  } catch {
    throw new Error(`Built CLI missing at ${filePath}. Run npm run build first.`);
  }
}

async function readExistingTarget(filePath) {
  try {
    const stat = await fs.lstat(filePath);
    if (stat.isSymbolicLink()) {
      return {
        kind: "symlink",
        resolved: await fs.realpath(filePath)
      };
    }

    return {
      kind: "file"
    };
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
