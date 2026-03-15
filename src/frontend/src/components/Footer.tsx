import { BookOpen, Heart } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-display text-base text-foreground">
                The Community Store
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs text-center md:text-left">
              Sharing stories, building community — one book at a time.
            </p>
          </div>

          <div className="flex flex-col items-center gap-1">
            <p className="text-xs text-muted-foreground">
              &copy; {year}. Built with{" "}
              <Heart className="inline w-3 h-3 text-accent fill-accent" /> using{" "}
              <a
                href={utmLink}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-foreground transition-colors"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
