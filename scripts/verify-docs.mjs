#!/usr/bin/env node
/**
 * Verify src/docs/ markdown files contain no banned patterns from AGENTS.md.
 *  - internal company / product names
 *  - internal repo paths like app/<x>/src
 *  - profile JSON filenames
 *  - internal commit hashes (40 hex chars) and internal IPs
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(process.cwd(), 'src/docs')
const BANNED = [
  /app\/(?:[a-z0-9-]+)\/src/i,
  /teamChannelIds|buildLegacyTeamList/i,
  /Profile\s*\.json|sampling\.json/i,
  /192\.168\.\d{1,3}\.\d{1,3}/,
  /10\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/,
  /\b[a-f0-9]{40}\b/  // raw git sha — placeholder, only flag if explicit repo context (best-effort)
]

let errors = 0
const files = []
function walk(p) {
  for (const ent of fs.readdirSync(p, { withFileTypes: true })) {
    if (ent.isDirectory()) walk(path.join(p, ent.name))
    else if (ent.isFile() && ent.name.endsWith('.md')) files.push(path.join(p, ent.name))
  }
}
walk(ROOT)

for (const file of files) {
  const text = fs.readFileSync(file, 'utf-8')
  for (const re of BANNED) {
    if (re.test(text)) {
      errors++
      console.log(`🚫 ${path.relative(process.cwd(), file)}: banned pattern ${re}`)
    }
  }
}
console.log(`\nFiles scanned: ${files.length}; violations: ${errors}`)
process.exit(errors > 0 ? 1 : 0)