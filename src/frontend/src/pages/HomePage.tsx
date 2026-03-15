import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Clock, Star, Users } from "lucide-react";
import { motion } from "motion/react";

const HOW_IT_WORKS = [
  {
    icon: BookOpen,
    title: "Browse Our Collection",
    desc: "Explore hundreds of titles across genres — fiction, non-fiction, children's books, and more.",
  },
  {
    icon: Clock,
    title: "Rent for a Set Period",
    desc: "Choose any book and rent it at an affordable flat price. No hidden fees, no surprises.",
  },
  {
    icon: Users,
    title: "Return & Repeat",
    desc: "Bring it back when you're done, and explore something new. Keep the cycle going for the community.",
  },
];

const FEATURED_QUOTES = [
  {
    id: "martin",
    quote: "A reader lives a thousand lives before he dies.",
    author: "George R.R. Martin",
  },
  {
    id: "tolkien",
    quote: "Not all those who wander are lost.",
    author: "J.R.R. Tolkien",
  },
  {
    id: "zappa",
    quote: "So many books, so little time.",
    author: "Frank Zappa",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[560px] flex items-center grain-overlay">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/assets/generated/hero-books.dim_1400x600.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-[#1a1f4e]/70" />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 py-20">
          <motion.div
            className="max-w-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-xs font-medium mb-6 backdrop-blur-sm">
              <Star className="w-3 h-3 fill-current text-amber-400" />
              <span className="text-white/90">
                Your neighbourhood book community
              </span>
            </div>

            <h1 className="font-display text-6xl sm:text-7xl md:text-8xl text-white leading-[1.0] mb-6">
              The Community
              <br />
              <span className="text-amber-400">Store</span>
            </h1>

            <p className="text-white/85 text-lg sm:text-xl leading-relaxed mb-8 max-w-lg font-medium">
              Rent any book from our curated collection at affordable prices.
              Discover stories, share knowledge, and keep your community
              reading.
            </p>

            <Link to="/books">
              <Button
                size="lg"
                data-ocid="home.browse_books.primary_button"
                className="bg-amber-500 hover:bg-amber-400 text-white font-semibold px-8 gap-2 rounded-full text-base"
              >
                Browse Books
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>

        <div className="absolute right-8 bottom-8 opacity-10 pointer-events-none select-none hidden lg:block">
          <span className="font-display text-[200px] text-white leading-none">
            &ldquo;
          </span>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display text-4xl sm:text-5xl text-foreground mb-3">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Three simple steps to start your reading journey with us.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="flex flex-col items-start p-7 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                  <step.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="font-display text-sm text-amber-500 mb-1 tracking-widest uppercase">
                  Step {i + 1}
                </div>
                <h3 className="font-display text-2xl text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote strip */}
      <section className="py-14 bg-[#1a1f4e] overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURED_QUOTES.map((q, i) => (
              <motion.blockquote
                key={q.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="flex flex-col gap-3"
              >
                <p className="font-display text-xl text-white/90 leading-snug">
                  &ldquo;{q.quote}&rdquo;
                </p>
                <cite className="text-sm text-white/50 not-italic">
                  &mdash; {q.author}
                </cite>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-20 bg-[#1a1f4e]/5">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display text-4xl sm:text-5xl text-foreground mb-4">
              Ready to start reading?
            </h2>
            <p className="text-muted-foreground text-base mb-8 max-w-sm mx-auto">
              Browse our full collection and rent your next favourite book
              today.
            </p>
            <Link to="/books">
              <Button
                size="lg"
                className="bg-[#1a1f4e] hover:bg-[#1a1f4e]/90 text-white rounded-full px-8 gap-2"
              >
                View All Books <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
