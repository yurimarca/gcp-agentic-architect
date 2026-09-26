# rise_html_to_md.py

Converts saved Articulate Rise lesson pages (such as Google Cloud Skills Boost courses saved with the browser's *Save page as…*) into Markdown files.

## Requirements

[`uv`](https://docs.astral.sh/uv/). The script lists its own dependencies (`beautifulsoup4`, `markdownify`), and `uv run` installs them automatically.

## Usage

```bash
# Convert every .html file in a folder (output goes to <folder>/md/)
uv run scripts/rise_html_to_md.py resources/agentops

# Convert a single file
uv run scripts/rise_html_to_md.py "resources/agentops/12-Some lesson.html"

# Choose the output folder
uv run scripts/rise_html_to_md.py resources/agentops --out notes/agentops
```

Each lesson is written to `<NN>-<lesson-title-slug>.md`, where `NN` is the number at the start of the HTML file name. Running the script again overwrites the existing files, so after adding new lessons you can rerun it on the whole folder.

### From Python

```python
from rise_html_to_md import convert_folder, convert_file, html_to_markdown

convert_folder("resources/agentops")          # -> list of written paths
convert_file("resources/agentops/1-....html") # -> written path
title, md = html_to_markdown("resources/agentops/1-....html")  # no file written
```

## Adding lessons

1. Save the lesson page as **Webpage, Complete**, so its `_files` folder is saved next to it.
2. Put a number at the start of the file name (`12-...html`) so the lessons stay in order.
3. Run the script on the folder again.

## How blocks are converted

| Rise block | Markdown |
| --- | --- |
| Text, lists, tables | Standard Markdown |
| Accordion, tabs, process carousel | `####` subsections |
| Flashcards, labeled graphic | `- **term**: description` bullets |
| Knowledge check | Question with `- [ ]` options (the correct answer isn't in the saved HTML) |
| Video | `*[Video: name]*`, the preview image and the transcript if the page has one |
| Embedded YouTube | Link to the video |
| Image | `![alt](<relative path to the _files folder>)` (divider images are skipped) |

Any other block type is converted as plain text, which may come out messy for complex interactive blocks. To support a new block type, add a handler to `HANDLERS` in the script.
