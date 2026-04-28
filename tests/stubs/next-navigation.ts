export function redirect(destination: string): never {
  throw new Error(`redirect:${destination}`);
}

export function notFound(): never {
  throw new Error('notFound');
}
