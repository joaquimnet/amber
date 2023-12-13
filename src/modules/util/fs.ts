import { readdirSync, lstatSync } from 'fs';
import { join } from 'path';
import { logger } from '../../log';

export function getFilesRecursively(dir: string): string[] {
  logger.debug(`Reading files in ${dir}`);
  const files = readdirSync(dir);
  let result: string[] = [];

  for (const file of files) {
    const filePath = join(dir, file);
    const stat = lstatSync(filePath);

    if (stat.isDirectory()) {
      const nestedFiles = getFilesRecursively(filePath);
      result = result.concat(nestedFiles);
    } else {
      result.push(filePath);
    }
  }

  return result;
}

// "commands\amber.ts" to ""./commands/amber.ts"
export function absoluteToRelative(dirname: string, absolutePath: string): string {
  const relativePath = absolutePath.replace(dirname, '');
  return relativePath.replace(/\\/g, '/');
}
