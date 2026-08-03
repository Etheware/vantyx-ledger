"use client";

import type { FormEvent } from "react";
import { useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setStatus(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      subject: String(formData.get("subject") || ""),
      message: String(formData.get("message") || ""),
    };

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setPending(false);
    setStatus(response.ok ? "Message sent." : "We could not send your message.");
    if (response.ok) form.reset();
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={onSubmit}>
      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium text-white/80">
          Name
        </label>
        <input id="contact-name" name="name" type="text" required className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 transition hover:border-white/20 focus:border-blue-500/50 focus:outline-none" placeholder="Your name" />
      </div>
      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium text-white/80">
          Email
        </label>
        <input id="contact-email" name="email" type="email" required className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 transition hover:border-white/20 focus:border-blue-500/50 focus:outline-none" placeholder="your@email.com" />
      </div>
      <div>
        <label htmlFor="contact-subject" className="block text-sm font-medium text-white/80">
          Subject
        </label>
        <input id="contact-subject" name="subject" type="text" required className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 transition hover:border-white/20 focus:border-blue-500/50 focus:outline-none" placeholder="How can we help?" />
      </div>
      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-white/80">
          Message
        </label>
        <textarea id="contact-message" name="message" required rows={5} className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 transition hover:border-white/20 focus:border-blue-500/50 focus:outline-none" placeholder="Tell us more..." />
      </div>
      <button type="submit" disabled={pending} className="w-full rounded-lg border border-blue-500/40 bg-blue-500/20 py-3 font-semibold text-blue-300 transition hover:bg-blue-500/30 disabled:opacity-60">
        {pending ? "Sending..." : "Send Message"}
      </button>
      {status ? <p className="text-sm text-white/70">{status}</p> : null}
    </form>
  );
}
