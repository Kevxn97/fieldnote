import test from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DEFAULT_CONFIG, initializeProject } from "../src/config.js";
import {
  buildSourceBundle,
  collectSourceImageInputs,
  extractClipMetadata,
  extractMarkdownAssetReferences,
  extractObsidianEmbedReferences,
  findLatestClip,
  findLatestImportableClipping,
  ingestPath,
  listClipMarkdownFiles,
  listImportableClippingFiles
} from "../src/source.js";

test("listClipMarkdownFiles returns markdown files only", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "kb-clippings-"));
  await fs.mkdir(path.join(root, "nested"), { recursive: true });
  await fs.writeFile(path.join(root, "a.md"), "# A\n", "utf8");
  await fs.writeFile(path.join(root, "nested", "b.md"), "# B\n", "utf8");
  await fs.writeFile(path.join(root, "ignore.txt"), "x\n", "utf8");

  const files = await listClipMarkdownFiles(root);
  const relative = files.map((file) => path.relative(root, file).replace(/\\/g, "/"));

  assert.deepEqual(relative, ["a.md", "nested/b.md"]);
});

test("findLatestClip returns the newest markdown file", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "kb-clippings-"));
  const older = path.join(root, "older.md");
  const newer = path.join(root, "newer.md");

  await fs.writeFile(older, "# Older\n", "utf8");
  await new Promise((resolve) => setTimeout(resolve, 20));
  await fs.writeFile(newer, "# Newer\n", "utf8");

  const latest = await findLatestClip(root);
  assert.equal(latest, newer);
});

test("listImportableClippingFiles returns markdown and pdf files only", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "kb-clippings-"));
  await fs.mkdir(path.join(root, "nested"), { recursive: true });
  await fs.writeFile(path.join(root, "a.md"), "# A\n", "utf8");
  await fs.writeFile(path.join(root, "nested", "paper.pdf"), "%PDF-1.4\n", "utf8");
  await fs.writeFile(path.join(root, "ignore.txt"), "x\n", "utf8");

  const files = await listImportableClippingFiles(root);
  const relative = files.map((file) => path.relative(root, file).replace(/\\/g, "/"));

  assert.deepEqual(relative, ["a.md", "nested/paper.pdf"]);
});

test("findLatestImportableClipping returns the newest supported clipping file", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "kb-clippings-"));
  const older = path.join(root, "older.md");
  const newer = path.join(root, "newer.pdf");

  await fs.writeFile(older, "# Older\n", "utf8");
  await new Promise((resolve) => setTimeout(resolve, 20));
  await fs.writeFile(newer, "%PDF-1.4\n", "utf8");

  const latest = await findLatestImportableClipping(root);
  assert.equal(latest, newer);
});

test("extractClipMetadata and asset reference helpers understand clipper markdown", () => {
  const markdown = [
    "---",
    'title: "Less Is More"',
    'source: "https://example.com/post"',
    'author: "Andrej Example"',
    'published: "2026-04-03"',
    "tags:",
    "  - clippings",
    "  - research",
    "---",
    "",
    "![Figure](assets/figure.png)",
    "![[Clippings/_assets/chart.webp]]",
    "![Remote](https://example.com/remote.png)"
  ].join("\n");

  assert.deepEqual(extractClipMetadata(markdown), {
    title: "Less Is More",
    sourceUrl: "https://example.com/post",
    authors: ["Andrej Example"],
    published: "2026-04-03",
    created: undefined,
    description: undefined,
    tags: ["clippings", "research"]
  });
  assert.deepEqual(extractMarkdownAssetReferences(markdown), ["assets/figure.png", "https://example.com/remote.png"]);
  assert.deepEqual(extractObsidianEmbedReferences(markdown), ["Clippings/_assets/chart.webp"]);
});

test("ingestPath copies referenced clip assets and rewrites markdown paths into raw storage", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "kb-clippings-"));
  const { paths } = await initializeProject(root);
  const clipDir = path.join(paths.clippingsDir, "article-assets");
  await fs.mkdir(path.join(clipDir, "assets"), { recursive: true });

  const assetPath = path.join(clipDir, "assets", "diagram.png");
  const clipPath = path.join(clipDir, "article.md");

  await fs.writeFile(assetPath, "png-bytes\n", "utf8");
  await fs.writeFile(
    clipPath,
    [
      "---",
      'title: "Tiny Networks"',
      'source: "https://arxiv.org/abs/2510.04871"',
      'author: "Research Team"',
      "tags:",
      "  - clippings",
      "---",
      "",
      "# Tiny Networks",
      "",
      "![Diagram](assets/diagram.png)"
    ].join("\n"),
    "utf8"
  );

  const result = await ingestPath(clipPath, paths, [], { bucket: "clips" });
  const storedMarkdown = await fs.readFile(path.join(paths.vaultDir, result.source.storedPath), "utf8");

  assert.equal(result.source.storedPath, "raw/clips/tiny-networks.md");
  assert.equal(result.source.title, "Tiny Networks");
  assert.deepEqual(result.source.metadata?.authors, ["Research Team"]);
  assert.deepEqual(result.source.relatedAssets, ["raw/images/tiny-networks/assets/diagram.png"]);
  assert.deepEqual(
    result.consumedPaths.map((file) => path.basename(file)).sort(),
    ["article.md", "diagram.png"]
  );
  assert.match(storedMarkdown, /!\[Diagram\]\(\.\.\/images\/tiny-networks\/assets\/diagram\.png\)/);
  await fs.access(path.join(paths.rawDir, "images", "tiny-networks", "assets", "diagram.png"));
});

test("buildSourceBundle exposes clip metadata and related local assets", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "kb-clippings-"));
  const { paths } = await initializeProject(root);
  const clipDir = path.join(paths.clippingsDir, "bundle-assets");
  await fs.mkdir(path.join(clipDir, "assets"), { recursive: true });

  const assetPath = path.join(clipDir, "assets", "figure.png");
  const clipPath = path.join(clipDir, "bundle.md");
  await fs.writeFile(assetPath, "png-bytes\n", "utf8");
  await fs.writeFile(
    clipPath,
    [
      "---",
      'title: "Less Is More"',
      'source: "https://example.com/post"',
      'author: "Andrej Example"',
      'published: "2026-04-03"',
      'description: "Research note"',
      "tags:",
      "  - clippings",
      "  - research",
      "---",
      "",
      "# Less Is More",
      "",
      "![Figure](assets/figure.png)"
    ].join("\n"),
    "utf8"
  );

  const { source } = await ingestPath(clipPath, paths, [], { bucket: "clips" });
  const bundle = await buildSourceBundle(source, DEFAULT_CONFIG, paths);

  assert.match(bundle, /Clip metadata:/);
  assert.match(bundle, /Source URL: https:\/\/example\.com\/post/);
  assert.match(bundle, /Authors: Andrej Example/);
  assert.match(bundle, /Related local assets:/);
  assert.match(bundle, /raw\/images\/less-is-more\/assets\/figure\.png/);

  const imageInputs = await collectSourceImageInputs(source, paths);
  assert.deepEqual(imageInputs, [path.join(paths.vaultDir, "raw/images/less-is-more/assets/figure.png")]);
});
