import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
// expand each suite's case list
const toggles = await page.$$('text=pre-built test case')
for (const t of toggles) await t.click()
await page.waitForTimeout(300)
await page.screenshot({ path: '/tmp/new_suite_list.png', fullPage: true })
console.log('errors:', errors)
await browser.close()
