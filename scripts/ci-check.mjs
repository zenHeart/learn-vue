#!/usr/bin/env node
/**
 * Aggregator: run all verification + typecheck + build for the learning site.
 *
 * Use after parallel agents complete. Stops at first failure.
 */
import { spawnSync } from 'node:child_process'

function step(label, cmd, args) {
  console.log(`\n══ ${label} ══`)
  const res = spawnSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' })
  if (res.status !== 0) {
    console.error(`✗ ${label} failed (exit ${res.status})`)
    process.exit(res.status || 1)
  }
  console.log(`✓ ${label}`)
}

step('verify-learning-paths', 'node', ['scripts/verify-learning-paths.mjs'])
step('verify-docs', 'node', ['scripts/verify-docs.mjs'])
step('pnpm typecheck', 'pnpm', ['typecheck'])
step('pnpm build', 'pnpm', ['build'])