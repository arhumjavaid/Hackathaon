import { chromium } from 'playwright'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1400, height: 1100 } })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

await page.goto('http://localhost:5173/builder', { waitUntil: 'networkidle' })
await page.fill('input[placeholder="e.g. Refund Flow Suite"]', 'Generated Suite Demo')
await page.fill('input[placeholder*="Make sure ineligible"]', 'Check that a customer can successfully get a refund for an eligible recent order and receives a confirmation email')
await page.screenshot({ path: '/tmp/gen_before.png', fullPage: true })
await page.click('text=Generate draft')
await page.waitForSelector('text=Generating…', { state: 'detached', timeout: 120000 })
await page.waitForTimeout(800)
await page.screenshot({ path: '/tmp/gen_after.png', fullPage: true })
console.log('errors:', errors)
await browser.close()
