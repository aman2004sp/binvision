// Hands a file chosen on the dashboard over to the scanner page (in memory only; never persisted).
let pending: File | null = null

export function setPendingFile(file: File | null): void {
  pending = file
}

export function takePendingFile(): File | null {
  const file = pending
  pending = null
  return file
}
