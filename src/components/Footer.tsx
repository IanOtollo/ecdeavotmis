export default function Footer() {
  return (
    <footer className="border-t border-border/40 py-3 px-6 flex items-center justify-between">
      <p className="text-xs text-muted-foreground/60">
        ECDEAVOTMIS — Busia County Department of Education
      </p>
      <p className="text-xs text-muted-foreground/40">
        {new Date().getFullYear()}
      </p>
    </footer>
  );
}
