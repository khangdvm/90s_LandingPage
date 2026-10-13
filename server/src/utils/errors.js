export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
export function found(value) {
  if (!value) throw new HttpError(404, "Not found");
  return value;
}
