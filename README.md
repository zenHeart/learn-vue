# Vue Learning Path

Interactive Vue learning site built with [VitePress](https://vitepress.dev/).

Live site: [https://vue.zenheart.site](https://vue.zenheart.site)

## Features

- Step-by-step learning paths with embedded Vue REPL demos
- Vue 2 and Vue 3 REPL support
- Reference docs for Vue APIs, theory, and tooling

## Development

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
pnpm preview
```

## Project Structure

```
.
├── .vitepress/       # VitePress config, theme, plugins
├── src/
│   ├── docs/         # Reference documentation
│   └── learning-path/  # Interactive tutorials
├── _examples/        # Standalone webpack demo apps
└── graph/            # Diagrams and training materials
```

## License

MIT
