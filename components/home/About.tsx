export function About({ title, body }: { title: string; body: string }) {
  if (!title && !body) return null;
  return (
    <section id="about" className="scroll-mt-24 bg-cream py-20">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="font-heading text-3xl text-ink md:text-4xl">
          {title || "About us"}
        </h2>
        <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-ink/70">
          {body}
        </p>
      </div>
    </section>
  );
}
