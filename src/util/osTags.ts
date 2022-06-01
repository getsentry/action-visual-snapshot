import os from 'os';

export function getOSTags(): Record<string, string> {
  return {
    'os.cpus.total': os.cpus().length.toFixed(0),
    'os.memory.total': os.totalmem().toFixed(0),
    'os.memory.free': os.freemem().toFixed(0),
  };
}
