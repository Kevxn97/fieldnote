---
kind: "concept"
title: "browser extension distribution"
concept: "browser extension distribution"
source_count: 1
tags:
  - "concept"
---
# browser extension distribution

## Definition
Browser extension distribution is the delivery of an extension through browser-specific installation channels and support paths. In this material, it refers to making Obsidian Web Clipper available through official listings for Chrome/Chromium browsers, Firefox, Safari, and Edge, with each channel covering a defined set of browsers or devices.

## Description
Browser extension distribution here is organized by ecosystem rather than by a single universal installer. Obsidian Web Clipper is offered through the Chrome Web Store, Firefox Add-Ons, Safari Extensions, and Edge Add-Ons.

Those channels map to different compatibility groups. The Chrome listing is described as covering Chrome, Brave, Arc, Orion, and other Chromium-based browsers. The Firefox listing covers Firefox and Firefox Mobile. The Safari listing covers macOS, iOS, and iPadOS.

Distribution is tied to feature access. The extension is presented as a free browser extension for highlighting pages and saving web content to an Obsidian vault, with linked documentation for clipping, highlighting, reader mode, interpreter features, troubleshooting, templates, variables, filters, and template logic.

The distributed product is also defined by its operating model. The extension saves content locally to the user’s Obsidian vault, does not collect user data, does not gather usage metrics, and is open source and auditable.

## Why It Matters
Distribution determines where users can install the extension and which browser families are covered. In practice, that makes the extension available across Chromium browsers, Firefox environments including mobile, and Safari across Apple platforms instead of limiting it to one browser vendor.

It also shapes trust. The documented install locations are official store channels, while the extension’s privacy posture is explicit: local saving, no user-data collection, no usage metrics, and open-source auditability. Together, those points make distribution part of the product’s security and transparency story.

Distribution also affects reach for the feature set. Clipping, highlighting, reader mode, interpreter functions, and template-based workflows are only useful if the extension is available in the browsers people actually use.

Because the extension is positioned as local-first, distribution matters without implying a cloud service dependency. Users install through browser ecosystems, but the saved content goes directly to their own Obsidian vault.

## Tensions And Debates
- Cross-browser distribution broadens reach, but the material does not establish whether all stores and platforms provide the same feature set.
- Official store presence supports discoverability and trust, but distribution is still fragmented across separate browser ecosystems.
- The Chrome listing covers multiple Chromium-based browsers, which simplifies reach, while Safari and Firefox are described through their own distinct support paths.
- Local-first and no-metrics positioning strengthens privacy claims, but it leaves unclear how usage or compatibility issues are assessed across distributed versions.
- Open-source auditability supports transparency, but the relationship between the public codebase and store-delivered builds is not detailed here.

## Open Questions
- Are there functional differences between the Chrome/Chromium, Firefox, Safari, and Edge versions of the extension?
- How consistent are clipping, highlighting, reader mode, and interpreter features across the listed browser ecosystems?
- Does distribution through Safari on macOS, iOS, and iPadOS impose capabilities or limitations that differ from other browsers?
- How are updates coordinated across the different official store channels?
- Are there browser-specific edge cases for saving content locally to an Obsidian vault?
- How closely do the publicly auditable sources correspond to each store-distributed release?

<!-- kb:concept-links:start -->
## Evidence Links
- [[wiki/sources/introduction-to-obsidian-web-clipper]]

## Related Concepts
- [[wiki/concepts/web-clipping]]
- [[wiki/concepts/local-first-saving]]
- [[wiki/concepts/highlighting]]
- [[wiki/concepts/reader-mode]]
- [[wiki/concepts/natural-language-page-interpretation]]
- [[wiki/concepts/template-variables-and-filters]]
- [[wiki/concepts/template-logic]]
<!-- kb:concept-links:end -->
