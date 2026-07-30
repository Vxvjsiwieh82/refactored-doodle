// OmniNinja — Sandbox Client (chama a EC2 Ubuntu remota via ngrok)
// URL hardcoded — não precisa configurar .env

const SANDBOX_URL = process.env.SANDBOX_URL || 'https://alkaline-flanking-transform.ngrok-free.dev';

export const hasSandbox = !!SANDBOX_URL;

export async function sandboxShell(taskId: string, cmd: string) {
  const res = await fetch(`${SANDBOX_URL}/shell`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ taskId, cmd }),
  });
  return res.json();
}

export async function sandboxFileWrite(taskId: string, path: string, content: string) {
  const res = await fetch(`${SANDBOX_URL}/file/write`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ taskId, path, content }),
  });
  return res.json();
}

export async function sandboxFileRead(taskId: string, path: string) {
  const res = await fetch(`${SANDBOX_URL}/file/read`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ taskId, path }),
  });
  const data = await res.json();
  return data.content;
}

export async function sandboxFileList(taskId: string) {
  const res = await fetch(`${SANDBOX_URL}/file/list`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ taskId }),
  });
  return res.json();
}

export async function sandboxBrowser(action: string, args: any, pageState?: { url?: string }) {
  const res = await fetch(`${SANDBOX_URL}/browser`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action, args, pageState }),
  });
  return res.json();
}

export async function sandboxCleanup(taskId: string) {
  await fetch(`${SANDBOX_URL}/cleanup`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ taskId }),
  }).catch(() => {});
}

export async function sandboxHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${SANDBOX_URL}/health`, { signal: AbortSignal.timeout(5000) });
    return res.ok;
  } catch {
    return false;
  }
}
