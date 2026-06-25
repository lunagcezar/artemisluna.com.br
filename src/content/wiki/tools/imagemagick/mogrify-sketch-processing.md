---
title: "Pencil sketch processing with mogrify"
description: ""
tags:
  - imagemagick
  - mogrify
  - scanning
  - sketch
date: "2026-06-24"
author: Luna G. Cezar
lang: en
index: false
---

While scanning, you may notice a lack of contrast in pencil sketch scans, even in color mode. To solve that, you can use the `mogrify`, an [[imagemagick]] command that allows batch processing. Note that this will overwrite the existing files:

```bash
mogrify -colorspace Gray -gamma 0.65 -white-threshold 85% -level 10%,90% *.png
```

If you want to be safe and not overwrite your scans, you can specify an output folder using the `-path` argument:

```bash
mogrify -path output -colorspace Gray -gamma 0.65 -white-threshold 85% -level 10%,90% *.png
```
