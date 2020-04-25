export function getEmailVerificationSubject(): string {
  return `Bestätige deine E-Mail Adresse`;
}

export function getEmailVerificationBody(link: string): string {
  return `<p>Hallo</p>` + `Bitte bestätige deine E-Mail Adresse indem du auf diesen Link clickst: ${link}`;
}
