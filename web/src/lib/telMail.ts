/** Normalize phone for tel: links */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/\s/g, "")}`;
}

export function mailHref(email: string): string {
  return `mailto:${email.trim()}`;
}
