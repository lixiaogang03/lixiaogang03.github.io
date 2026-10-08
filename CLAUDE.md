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
- **_config.yml**: Site configuration (title, description, social links, Giscus settings)

### Assets Pipeline
- **less/**: LESS source files compiled to CSS via Grunt
  - `hux-blog.less`: Main styles entry point
  - `variables.less`: Color/size variables
  - `sidebar.less`, `side-catalog.less`: Component styles
- **css/**: Compiled CSS output (generated, don't edit directly) plus hand-maintained `blog-features.css` (search/code-block/like/back-to-top styles, NOT generated from LESS)
- **js/**: JavaScript files (jQuery, Bootstrap, custom blog features)
  - `hux-blog.js`: Main blog functionality (navigation, responsive tables, catalog)
  - `blog-features.js`: Hand-maintained feature bundle (search overlay, code-block copy button, like button, back-to-top); reads `window.__BLOG__` (baseurl/version) injected by `footer.html`

### Key Features
- **Giscus Comments**: GitHub Discussions-based comments (configured under `giscus:` in `_config.yml`)
- **Like System**: One-way like button (like once per browser, cannot un-like) with a real global count via the free CountAPI service (`https://countapi.mileshilliard.com`, key format `lxgblog_like_<djb2 hash of post URL>`); per-browser liked flag and a cached last-seen count live in `localStorage` (in `js/blog-features.js`)
- **Side Catalog**: Auto-generated table of contents for posts with `catalog: true`
- **Tag System**: Featured tags on homepage and dedicated tags page
- **Search**: Title/tag search via SimpleJekyllSearch and `search.json`
- **Code Blocks**: Language label + copy button enhancement
- **Back to Top**: Floating button with scroll progress ring
- **SEO**: Open Graph/Twitter Card meta in `_includes/head.html`, JSON-LD in `post.html`, `sitemap.xml` + `robots.txt`
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
mathjax: true   # optional: add ONLY if the post contains LaTeX math ($...$ / $$...$$)
tags:
    - Tag1
    - Tag2
---
```
3. Write content in Markdown below the front matter
4. MathJax is disabled site-wide (`mathjax: false` in `_config.yml`); it loads only for posts with `mathjax: true`

### Modifying Styles
1. Edit LESS files in `less/` directory (never edit CSS directly)
2. Run `grunt` to compile LESS to CSS
3. Or use `grunt watch` for automatic compilation during development

### Navigation Links
Edit the navigation bar in `_includes/nav.html`. The footer links are in `_includes/footer.html`.

## Configuration Notes

- **Site Config**: All main configuration is in `_config.yml`
- **Navigation**: Nav links are an explicit whitelist in `_config.yml` (`nav_links`); add new pages there, they no longer auto-appear
- **Comments**: Giscus comments are tied to GitHub Discussions in this repository
- **MathJax**: Disabled site-wide (`mathjax: false`); enable per post with `mathjax: true`
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
- `CNAME`: Custom domain configuration for GitHub Pages (bare domain, no scheme)
- `sw.js`: Service worker for PWA functionality
- `search.json`: Search index template (title/url/date/tags)
- `sitemap.xml` / `robots.txt`: SEO files (Liquid-generated sitemap; robots.txt points to it)
- `js/blog-features.js` + `css/blog-features.css`: Custom feature bundle loaded on every page (referenced from `_includes/footer.html` and `_includes/head.html`)
- `Gruntfile.js`: Asset build configuration (compiles `less/hux-blog.less` → `css/hux-blog.(min.)css`, uglifies `js/hux-blog.js`)
