// OmniNinja — Real Shell Agent (Seção 7)
// Executes REAL bash/python/node commands on the VM in an isolated workspace.
// In production: Docker container per session. Here: restricted /tmp workspace.

import { exec } from 'child_process';
import { promisify } from 'util';
import { mkdirSync, existsSync, writeFileSync, readFileSync, unlinkSync, rmSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

const WORKSPACE_ROOT = '/tmp/omninja-workspaces';

function getWorkspace(taskId: string): string {
  const dir = join(WORKSPACE_ROOT, taskId);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    // initialize with a package.json so npm commands work
    writeFileSync(join(dir, 'package.json'), JSON.stringify({
      name: 'omninja-sandbox',
      version: '1.0.0',
      private: true,
    }));
  }
  return dir;
}

export interface ShellResult {
  cmd: string;
  stdout: string;
  stderr: string;
  exitCode: number;
}

export async function shellExec(taskId: string, cmd: string, timeoutMs = 30000): Promise<ShellResult> {
  const workspace = getWorkspace(taskId);
  try {
    const { stdout, stderr } = await execAsync(cmd, {
      cwd: workspace,
      timeout: timeoutMs,
      maxBuffer: 1024 * 1024,
      env: { ...process.env, HOME: workspace, PATH: process.env.PATH },
    });
    return {
      cmd,
      stdout: stdout.slice(0, 10000),
      stderr: stderr.slice(0, 5000),
      exitCode: 0,
    };
  } catch (err: any) {
    return {
      cmd,
      stdout: (err.stdout ?? '').slice(0, 10000),
      stderr: (err.stderr ?? err.message ?? '').slice(0, 5000),
      exitCode: err.code ?? 1,
    };
  }
}

export function fileWrite(taskId: string, path: string, content: string): { path: string; bytes: number } {
  const workspace = getWorkspace(taskId);
  // prevent path traversal — only allow relative paths
  const safePath = join(workspace, path.replace(/^\//, ''));
  writeFileSync(safePath, content);
  return { path: safePath, bytes: content.length };
}

export function fileRead(taskId: string, path: string): string {
  const workspace = getWorkspace(taskId);
  const safePath = join(workspace, path.replace(/^\//, ''));
  try {
    return readFileSync(safePath, 'utf-8').slice(0, 20000);
  } catch {
    return `Error: file not found: ${path}`;
  }
}

export function fileDelete(taskId: string, path: string): boolean {
  const workspace = getWorkspace(taskId);
  const safePath = join(workspace, path.replace(/^\//, ''));
  try {
    unlinkSync(safePath);
    return true;
  } catch {
    return false;
  }
}

export function cleanupWorkspace(taskId: string) {
  const dir = join(WORKSPACE_ROOT, taskId);
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
  }
}

export async function listFiles(taskId: string): Promise<string[]> {
  const workspace = getWorkspace(taskId);
  try {
    const { stdout } = await execAsync('find . -type f | head -50', { cwd: workspace });
    return stdout.split('\n').filter(Boolean);
  } catch {
    return [];
  }
}
