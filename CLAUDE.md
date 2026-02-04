# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Jekyll-based static blog site hosted on GitHub Pages. It's a personal technical blog (LXG Blog) focused on Android development, containing Chinese-language posts about Android source code analysis, system architecture, and various technical topics.

**Live Site**: https://lixiaogang03.github.io/

## Build & Development Commands

### Local Preview
```bash
# Start Jekyll server with auto-rebuild
jekyll serve -w

# Preview the built site (Python 2)
npm run preview

# Preview the built site (Python 3)
npm run py3view

# Watch LESS files and serve (Python 2)
npm run watch

# Watch LESS files and serve (Python 3)
npm run py3wa
```

### Build Assets
```bash
# Build LESS to CSS and minify JS
grunt

# Watch for LESS file changes and auto-compile
grunt watch
```

### Deploy
The site automatically deploys to GitHub Pages when pushing to the `master` branch. No manual deployment is needed.

## Architecture

### Jekyll Structure
- **_posts/**: Blog posts in Markdown format with YAML front matter
  - Naming convention: `YYYY-MM-DD-Title.md`
  - Front matter includes: `layout`, `title`, `subtitle`, `date`, `author`, `header-img`, `catalog`, `tags`
- **_layouts/**: HTML templates for different page types
  - `default.html`: Base layout with header/footer
  - `post.html`: Individual blog post layout with comments, like button, catalog
  - `page.html`: Static pages (about, tags, etc.)
  - `keynote.html`: Presentation-style posts
- **_includes/**: Reusable HTML components (head, nav, footer)
- **_config.yml**: Site configuration (title, description, social links, Gitalk settings)

### Assets Pipeline
- **less/**: LESS source files compiled to CSS via Grunt
  - `hux-blog.less`: Main styles entry point
  - `variables.less`: Color/size variables
  - `sidebar.less`, `side-catalog.less`: Component styles
- **css/**: Compiled CSS output (generated, don't edit directly)
- **js/**: JavaScript files (jQuery, Bootstrap, custom blog features)
  - `hux-blog.js`: Main blog functionality (navigation, responsive tables, catalog)

### Key Features
- **Gitalk Comments**: Issue-based comments using GitHub API (configured in `_config.yml`)
- **Like System**: Post like button with count (in `post.html` lines 65-77)
- **Side Catalog**: Auto-generated table of contents for posts with `catalog: true`
- **Tag System**: Featured tags on homepage and dedicated tags page
- **Search**: Jekyll search functionality via `search.json`
- **PWA Support**: Progressive web app with service worker (`sw.js`)

## Working with Content

### Creating New Posts
1. Create file in `_posts/` with naming pattern: `YYYY-MM-DD-Title.md`
2. Add required front matter:
```yaml
---
layout: post
title: Your Title
subtitle: Optional Subtitle
date: YYYY-MM-DD
author: LXG
header-img: img/post-bg-image.jpg
catalog: true
tags:
    - Tag1
    - Tag2
---
```
3. Write content in Markdown below the front matter

### Modifying Styles
1. Edit LESS files in `less/` directory (never edit CSS directly)
2. Run `grunt` to compile LESS to CSS
3. Or use `grunt watch` for automatic compilation during development

### Navigation Links
Edit the navigation bar in `_includes/nav.html`. The footer links are in `_includes/footer.html`.

## Configuration Notes

- **Site Config**: All main configuration is in `_config.yml`
- **Gitalk**: Comments are tied to GitHub issues in this repository
- **Analytics**: Baidu Analytics tracking ID is configured (ID: 48fe9730565c2edaf9f27e1ecbfcb514)
- **Pagination**: Set to 10 posts per page
- **Markdown Engine**: Uses kramdown with GFM (GitHub Flavored Markdown)
- **Syntax Highlighting**: Uses rouge highlighter

## Dependencies

- **Jekyll**: Static site generator (install via Ruby gems)
- **Grunt**: Task runner for asset compilation (install via npm)
- **Node Modules**: Bootstrap, Less compiler, jQuery (see `package.json`)

## Important Files to Preserve

- `_config.yml`: Core site configuration
- `CNAME`: Custom domain configuration for GitHub Pages
- `sw.js`: Service worker for PWA functionality
- `search.json`: Search index template
- `Gruntfile.js`: Asset build configuration
