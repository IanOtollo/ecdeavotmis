const Footer = () => {
  return (
    <footer className="border-t bg-card py-4 px-6">
      <div className="text-center text-sm text-muted-foreground">
        © 2025 ECDEAVOTMIS | Developed by{" "}
        <a
          href="https://ianotollo.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary-hover transition-colors underline"
        >
          Ian Otollo
        </a>
      </div>
    </footer>
  );
};

export default Footer;
