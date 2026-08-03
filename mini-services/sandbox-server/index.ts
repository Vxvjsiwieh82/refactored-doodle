/**
 * OmmiNinja — Sandbox Server (roda no OpenClaw AWS)
 * Usa o Google Chrome já instalado no OpenClaw (channel: 'chrome')
 * Porta: 3005
 */

import { createServer, type IncomingMessage, type ServerResponse } from 'http';
import { exec } from 'child_process';
import { promisify } from 'util';
import { mkdirSync, existsSync, writeFileSync, readFileSync, unlinkSync, readdirSync, statSync, rmSync } from 'fs';
import { join } from 'path';
import { chromium } from 'playwright-core';

const execAsync = promisify(exec);
const PORT = 3005;
const WORKSPACE_ROOT = '/tmp/omninja-workspaces';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
};

function cors(res: ServerResponse) {
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
}

function getWorkspace(taskId: string): string {
  const dir = join(WORKSPACE_ROOT, taskId || 'default');
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'omninja-sandbox', version: '1.0.0' }));
  }
  return dir;
}

async function shellExec(taskId: string, cmd: string, timeoutMs = 30000) {
  const workspace = getWorkspace(taskId);
  try {
    const { stdout, stderr } = await execAsync(cmd, {
      cwd: workspace,
      timeout: timeoutMs,
      maxBuffer: 1024 * 1024,
      env: { ...process.env, HOME: workspace },
    });
    return { cmd, stdout: stdout.slice(0, 10000), stderr: stderr.slice(0, 5000), exitCode: 0 };
  } catch (err: any) {
    return {
      cmd,
      stdout: (err.stdout ?? '').slice(0, 10000),
      stderr: (err.stderr ?? err.message ?? '').slice(0, 5000),
      exitCode: err.code ?? 1,
    };
  }
}

function fileWrite(taskId: string, path: string, content: string) {
  const workspace = getWorkspace(taskId);
  const safePath = join(workspace, path.replace(/^\//, ''));
  writeFileSync(safePath, content);
  return { path: safePath, bytes: content.length };
}

function fileRead(taskId: string, path: string) {
  const workspace = getWorkspace(taskId);
  const safePath = join(workspace, path.replace(/^\//, ''));
  try { return readFileSync(safePath, 'utf-8').slice(0, 20000); }
  catch { return `Error: file not found: ${path}`; }
}

function fileList(taskId: string) {
  const workspace = getWorkspace(taskId);
  try {
    return readdirSync(workspace).map((name) => {
      const stat = statSync(join(workspace, name));
      return { name, size: stat.size, isDir: stat.isDirectory() };
    });
  } catch { return []; }
}

// Browser — USA O GOOGLE CHROME DO OPENCLAW (channel: 'chrome')
let browser: any = null;

async function getBrowser() {
  if (browser && browser.isConnected?.()) return browser;
  browser = await chromium.launch({
    channel: 'chrome', // USA O GOOGLE CHROME 150 JÁ INSTALADO NO OPENCLAW!
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--window-size=1280,720'],
  });
  return browser;
}

async function browserAction(action: string, args: any, page: any) {
  const result: any = {};
  switch (action) {
    case 'navigate':
      await page.goto(args.url, { timeout: 30000, waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(500);
      break;
    case 'click':
      await page.click(args.selector, { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(300);
      break;
    case 'type':
      await page.fill(args.selector, args.text, { timeout: 5000 }).catch(() => {
        page.keyboard.type(args.text, { delay: 50 }).catch(() => {});
      });
      await page.waitForTimeout(200);
      break;
    case 'scroll_down':
      await page.mouse.wheel(0, 600);
      await page.waitForTimeout(300);
      break;
    case 'scroll_up':
      await page.mouse.wheel(0, -600);
      await page.waitForTimeout(300);
      break;
    case 'press_key':
      await page.keyboard.press(args.key);
      await page.waitForTimeout(200);
      break;
    case 'go_back':
      await page.goBack({ timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(500);
      break;
    case 'get_text':
      result.text = (await page.innerText('body')).slice(0, 5000);
      break;
    case 'execute_js':
      result.text = String(await page.evaluate(args.script).catch((e: any) => `Error: ${e.message}`)).slice(0, 3000);
      break;
    case 'screenshot':
      break;
    default:
      result.error = `Unknown action: ${action}`;
  }
  // SEMPRE tira screenshot
  const buf = await page.screenshot({ type: 'png', fullPage: false });
  result.screenshot = buf.toString('base64');
  result.url = page.url();
  result.title = await page.title().catch(() => '');
  return result;
}

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  cors(res);
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const parseBody = (): Promise<any> => new Promise((resolve) => {
    let body = '';
    req.on('data', (c) => body += c);
    req.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve({}); } });
  });

  const url = req.url || '';

  if (req.method === 'GET' && url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({
      ok: true,
      service: 'omninja-sandbox',
      port: PORT,
      os: 'Ubuntu 24.04 (OpenClaw)',
      chrome: 'Google Chrome 150',
      hasChromium: true,
      workspaces: existsSync(WORKSPACE_ROOT) ? readdirSync(WORKSPACE_ROOT).length : 0,
    }));
    return;
  }

  try {
    if (url === '/shell' && req.method === 'POST') {
      const { taskId, cmd } = await parseBody();
      const result = await shellExec(taskId, cmd);
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }

    if (url === '/file/write' && req.method === 'POST') {
      const { taskId, path, content } = await parseBody();
      const result = fileWrite(taskId, path, content);
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }
    if (url === '/file/read' && req.method === 'POST') {
      const { taskId, path } = await parseBody();
      const content = fileRead(taskId, path);
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ content }));
      return;
    }
    if (url === '/file/list' && req.method === 'POST') {
      const { taskId } = await parseBody();
      const files = fileList(taskId);
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ files }));
      return;
    }

    if (url === '/browser' && req.method === 'POST') {
      const { action, args, pageState } = await parseBody();
      const b = await getBrowser();
      const context = await b.newContext({ viewport: { width: 1280, height: 720 } });
      const page = await context.newPage();
      if (pageState?.url) {
        await page.goto(pageState.url, { timeout: 30000, waitUntil: 'domcontentloaded' }).catch(() => {});
      }
      const result = await browserAction(action, args, page);
      await page.close().catch(() => {});
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }

    if (url === '/cleanup' && req.method === 'POST') {
      const { taskId } = await parseBody();
      const dir = join(WORKSPACE_ROOT, taskId);
      if (existsSync(dir)) rmSync(dir, { recursive: true, force: true });
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    res.writeHead(404, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'not found', endpoints: ['/health', '/shell', '/file/write', '/file/read', '/file/list', '/browser', '/cleanup'] }));
  } catch (err: any) {
    res.writeHead(500, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🥷 OmmiNinja Sandbox Server rodando na porta ${PORT}`);
  console.log(`   OpenClaw AWS · Ubuntu 24.04 · Google Chrome 150`);
  console.log(`   Health: http://localhost:${PORT}/health`);
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));
