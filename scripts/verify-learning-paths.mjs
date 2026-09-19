#!/usr/bin/env node
/**
 * Verify all learning path demos conform to the contributor spec.
 *
 * Walks every src/learning-path/<chapter>/src/<NN.demo>/ directory and checks:
 *   - description.md exists and is non-empty
 *   - App/App.vue exists and is non-empty
 *   - description.md does not contain banned AGENTS.md strings
 *   - App.vue does not have a computed getter with side effects
 *
 * Exit 0 on success; non-zero with printed list on any failure.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(process.cwd(), 'src/learning-path')
const BANNED = [
  /\bNN\b(?:\s+公司|\s+team|\s+apps?)/i,
  /teamChannelIds|buildLegacyTeamList/i,
  /Profile JSON|sampling\.json/i,
  /\.nn\.com|192\.168\.\d/i
]

let errors = 0
const report = []

function readUtf8(p) {
  return fs.readFileSync(p, 'utf-8')
}

function walk(p) {
  return fs.readdirSync(p, { withFileTypes: true })
}

function checkDemo(demoDir, chapter) {
  const descPath = path.join(demoDir, 'description.md')
  const appPath = path.join(demoDir, 'App', 'App.vue')
  const rel = path.relative(process.cwd(), demoDir)

  if (!fs.existsSync(descPath)) {
    errors++
    report.push(`❌ ${rel}: missing description.md`)
    return
  }
  if (!fs.existsSync(appPath)) {
    errors++
    report.push(`❌ ${rel}: missing App/App.vue`)
    return
  }

  const desc = readUtf8(descPath)
  const app = readUtf8(appPath)
  if (desc.trim().length < 80) {
    errors++
    report.push(`⚠️  ${rel}: description.md too short (${desc.trim().length} chars)`)
  }
  if (app.trim().length < 80) {
    errors++
    report.push(`⚠️  ${rel}: App/App.vue too short (${app.trim().length} chars)`)
  }

  for (const re of BANNED) {
    if (re.test(desc) || re.test(app)) {
      errors++
      report.push(`🚫 ${rel}: banned pattern ${re} (AGENTS.md privacy gate)`)
      break
    }
  }

  // Heuristic: detect computed getter with assignment.
  const computedWithAssignment = /computed\s*\(\s*(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>\s*\{[^}]*(?:[a-zA-Z_$][\w$.]*\.value\s*(?:=(?!=)|\+\+|--)|store\.\w+\s*=(?!=)|state\.\w+\s*=(?!=)|list\.push)/m
  if (computedWithAssignment.test(app)) {
    errors++
    report.push(`⚠️  ${rel}: suspected side-effect inside computed getter`)
  }

  report.push(`✓ ${rel}`)
}

for (const chapterEntry of walk(ROOT)) {
  if (!chapterEntry.isDirectory()) continue
  if (chapterEntry.name.startsWith('.')) continue
  const chapter = chapterEntry.name
  const srcDir = path.join(ROOT, chapter, 'src')
  if (!fs.existsSync(srcDir)) continue
  for (const demoEntry of walk(srcDir).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))) {
    if (!demoEntry.isDirectory()) continue
    checkDemo(path.join(srcDir, demoEntry.name), chapter)
  }
}

console.log(report.join('\n'))
console.log(`\nTotal demos checked: ${report.filter((r) => r.startsWith('✓')).length}`)
console.log(`Errors / warnings: ${errors}`)
process.exit(errors > 0 ? 1 : 0)