# Security Policy

ImpactForge is a **prototype**. It processes no real payments and stores no personal data on a server: campaigns and donations live in the visitor's browser (`localStorage`).

## Reporting a vulnerability

Please **don't** open a public issue for security problems. Use GitHub's [private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability) on this repository instead. We aim to respond within 72 hours.

## Built-in safeguards

- The AI never produces markup. Output is JSON, validated by Zod, and rendered through typed React components, so there's no HTML injection path.
- Prompts are length-limited (280 characters), wrapped as untrusted input, and rate-limited per IP on `/api/generate`.
- The Anthropic API key is only read on the server and is never sent to the browser.
- The demo checkout never transmits card numbers. They're checked locally with a Luhn check and discarded.
