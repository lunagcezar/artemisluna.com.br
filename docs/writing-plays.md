# Writing Plays and Screenplays

This guide explains how to format play scripts and screenplays in the writing collection.

## Overview

The writing collection supports two layout modes:

- **Prose** (default): Standard article layout with justified text
- **Play**: Monospace font with centered scene headings, character names, and stage directions

## Frontmatter

```yaml
---
title: "Play Title"
description: "Brief description"
tags: ["drama", "comedy"]
date: 2024-01-15
author: "Author Name"
lang: en
layout: play # Required for play scripts
---
```

## Formatting Conventions

### Act and Scene Headings

Use **bold text** for act and scene headings. The CSS will center and style them appropriately.

```markdown
**ACT I**

**INT. LIVING ROOM - NIGHT**

**EXT. PARK - DAY**
```

**Rules:**

- Act headings: `**ACT I**`, `**ACT II**`, etc.
- Scene headings start with `INT.` (interior) or `EXT.` (exterior)
- Include location and time of day
- Use ALL CAPS for scene headings (optional but recommended)

### Character Names

Write character names in **bold** and ALL CAPS on their own line before dialogue.

```markdown
**OSKARO**

Saluton! Kiel vi estas?

**KAROLINE**

Mi estas bone, dankon!
```

**Rules:**

- Character names must be in **bold** and ALL CAPS
- Place on their own line with blank lines before and after
- Dialogue follows on the next line (or after emotional direction)

### Emotional Directions

Use _italics_ in parentheses for emotional directions, on their own line after the character name.

```markdown
**OSKARO**

_(feliĉe)_

Ni alvenos baldaŭ!

**KAROLINE**

_(turning to look out the window)_

Kia bela pejzaĝo!
```

**Rules:**

- Wrap in parentheses: `*(emotional direction)*`
- Place on their own line after character name
- Use italics for all emotional directions
- Dialogue follows on the next line

### Action Lines

Regular text for narrative descriptions and actions.

```markdown
La buso alvenis kaj ĉiuj ekenbusiĝis.

Poste, ili iris al la hotelo por enskribiĝi.
```

**Rules:**

- Write in present tense
- Describe what the audience sees and hears
- Keep concise and visual
- No special formatting needed

## Complete Example

```markdown
---
title: "La Vojaĝo"
description: "Esperanta teatraĵo pri vojaĝo al Guaramiranga"
tags: ["teatro", "esperanto"]
date: 2020-03-24
author: "Murcio Filho"
lang: eo
layout: play
---

**1A AKTO**

**INT. – BUSSTACIDOMO – MATENE**

La geedzoj OSKARO kaj KAROLINE atendas la buson.

**KAROLINE**

_(malpacience)_

Ĉu la buso alvenos baldaŭ?

**BUSKONTROLISTO**

Jes, ĝi alvenos en dek minutoj.

**EXT. – GUARAMIRANGA – TAGO**

Ili alvenis kaj miras la belan urbon.

**KAROLINE**

_(entuziasme)_

Kia bela loko!
```

## CSS Styling

The `.play-script` CSS class applies:

| Element                      | Style                        |
| ---------------------------- | ---------------------------- |
| Overall                      | Monospace font, smaller text |
| `**bold**` (alone on line)   | Centered, bold, uppercase    |
| `*(italic)*` (alone on line) | Centered, italic             |
| Regular text                 | Left-aligned, normal         |

**Note:** Character names and emotional directions must be on their own lines (with blank lines before and after) to be centered properly.

## File Naming

Follow the standard convention:

```
YYYYMMDD-slug-in-kebab-case.md
```

Examples:

- `20200324-teatrajxo.md`
- `20240115-hamlet-adapto.md`
- `20231201-komedio-tri-akt.md`

## Tips

1. **Keep it visual**: Write what can be seen and heard on stage
2. **Present tense**: Always use present tense for actions
3. **Minimal directions**: Only include essential stage directions
4. **Character consistency**: Use the same name format throughout
5. **Scene transitions**: Use scene headings to indicate location/time changes

## Fountain Format

If you prefer writing in [Fountain](https://fountain.io/) format, you can:

1. Write your script in Fountain (.fountain file)
2. Convert to markdown manually or with a converter
3. Apply the formatting conventions above
4. Set `layout: play` in frontmatter

The project does not currently auto-convert Fountain to markdown, but the formatting conventions align with Fountain's syntax.
