// OmniNinja — Real Browser Agent (Seção 8)
// Connects to Browserless cloud via CDP, runs REAL browser actions,
// takes REAL screenshots. No simulation.

import { chromium, type Browser, type Page } from 'playwright-core';

const REGION = process.env.BROWSERLESS_REGION ?? 'production-sfo';
const TOKEN = process.env.BROWSERLESS_API_KEY;

let browserInstance: Browser | null = null;

export async function getBrowser(): Promise<Browser> {
  if (!TOKEN) throw new Error('BROWSERLESS_API_KEY not configured');
  if (browserInstance && browserInstance.isConnected()) return browserInstance;
  browserInstance = await chromium.connectOverCDP(
    `wss://${REGION}.browserless.io?token=${TOKEN}&blockAds=true`
  );
  return browserInstance;
}

export async function createPage(): Promise<Page> {
  const browser = await getBrowser();
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  return page;
}

export interface BrowserActionResult {
  screenshot?: string; // base64
  url?: string;
  title?: string;
  text?: string;
  error?: string;
}

// All functions take a Page and return a result + screenshot.
// Screenshots are taken BEFORE and AFTER each action (Seção 8).

async function screenshot(page: Page): Promise<string> {
  const buf = await page.screenshot({ type: 'png', fullPage: false });
  return buf.toString('base64');
}

async function waitForStable(page: Page) {
  try { await page.waitForLoadState('networkidle', { timeout: 8000 }); } catch {}
  await page.waitForTimeout(500);
}

export const browserTools = {
  navigate: async (page: Page, url: string): Promise<BrowserActionResult> => {
    await page.goto(url, { timeout: 30000, waitUntil: 'domcontentloaded' });
    await waitForStable(page);
    return {
      screenshot: await screenshot(page),
      url: page.url(),
      title: await page.title(),
    };
  },

  click: async (page: Page, selector: string): Promise<BrowserActionResult> => {
    await page.click(selector, { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(300);
    return { screenshot: await screenshot(page), url: page.url() };
  },

  type: async (page: Page, selector: string, text: string): Promise<BrowserActionResult> => {
    await page.fill(selector, text, { timeout: 5000 }).catch(() => {
      // if fill fails, try keyboard type
      page.keyboard.type(text).catch(() => {});
    });
    await page.waitForTimeout(200);
    return { screenshot: await screenshot(page) };
  },

  scroll_down: async (page: Page): Promise<BrowserActionResult> => {
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(300);
    return { screenshot: await screenshot(page) };
  },

  scroll_up: async (page: Page): Promise<BrowserActionResult> => {
    await page.mouse.wheel(0, -600);
    await page.waitForTimeout(300);
    return { screenshot: await screenshot(page) };
  },

  screenshot: async (page: Page): Promise<BrowserActionResult> => {
    return { screenshot: await screenshot(page), url: page.url(), title: await page.title() };
  },

  get_text: async (page: Page): Promise<BrowserActionResult> => {
    const text = await page.innerText('body');
    return { text: text.slice(0, 5000), screenshot: await screenshot(page) };
  },

  get_html: async (page: Page): Promise<BrowserActionResult> => {
    const html = await page.content();
    return { text: html.slice(0, 5000) };
  },

  execute_js: async (page: Page, script: string): Promise<BrowserActionResult> => {
    const result = await page.evaluate(script).catch((e) => `Error: ${e.message}`);
    return { text: String(result).slice(0, 3000), screenshot: await screenshot(page) };
  },

  press_key: async (page: Page, key: string): Promise<BrowserActionResult> => {
    await page.keyboard.press(key);
    await page.waitForTimeout(200);
    return { screenshot: await screenshot(page) };
  },

  go_back: async (page: Page): Promise<BrowserActionResult> => {
    await page.goBack({ timeout: 10000 }).catch(() => {});
    await waitForStable(page);
    return { screenshot: await screenshot(page), url: page.url() };
  },

  go_forward: async (page: Page): Promise<BrowserActionResult> => {
    await page.goForward({ timeout: 10000 }).catch(() => {});
    await waitForStable(page);
    return { screenshot: await screenshot(page), url: page.url() };
  },
};

export async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close().catch(() => {});
    browserInstance = null;
  }
}
