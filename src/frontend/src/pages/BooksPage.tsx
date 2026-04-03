import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Info,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import type { Book } from "../backend.d";
import { useGetBooks, useSubmitRentalRequest } from "../hooks/useQueries";

const CAPTAIN_UNDERPANTS_TITLES = new Set([
  "Professor Poopypants",
  "Bionic Booger Boy Part 2",
  "Wicked Wedgie Woman",
  "Plight Of The Purple Potty People",
]);

const GERONIMO_STILTON_TITLES = new Set([
  "Kingdom Of Fantasy : The Dragon Prophecy",
  "Kingdom Of Fantasy : The Volcano of Fire",
  "Kingdom Of Fantasy : The Wizards Wand",
  "It's Halloween You 'Fraidy Mouse",
  "The Cheese Coloured Camper",
  "The Hunt For The Golden Book",
  "The Journey Through Time - Book 1",
]);

const ROALD_DAHL_TITLES = new Set([
  "The BFG",
  "The Witches",
  "The Twits",
  "Matilda",
  "James and the Giant Peach",
  "Esio Trot",
  "The Magic Finger",
  "Charlie and the Chocolate Factory",
  "Charlie and the Great Glass Elevator",
  "Going Solo",
  "Dahlmanac Fun facts and Jokes",
]);

const SUDHA_MURTY_TITLES = new Set([
  "Grandma's Bag Of Stories",
  "How I Taught My Grandmother To Read And other stories",
  "The Daughter From A Wishing Tree",
  "The Magic Of the Lost Temple",
  "The Magic Of the Lost Story",
]);

function getSeriesLabel(book: Book): string {
  const title = book.title.trim();

  if (title.startsWith("Diary Of A Wimpy Kid")) return "Diary Of A Wimpy Kid";
  if (title.startsWith("Demon Slayer")) return "Demon Slayer";
  if (
    title.startsWith("Five ") ||
    title === "Five On A Hike Together" ||
    title === "Five Get Into A Fix" ||
    title === "Five Go Off In A Caravan" ||
    title === "Five Fall Into Adventure"
  )
    return "Famous Five";
  if (title.startsWith("Twinkle Digest")) return "Twinkle Comics";
  if (CAPTAIN_UNDERPANTS_TITLES.has(title)) return "Captain Underpants";
  if (GERONIMO_STILTON_TITLES.has(title)) return "Geronimo Stilton";
  if (ROALD_DAHL_TITLES.has(title)) return "Roald Dahl";
  if (SUDHA_MURTY_TITLES.has(title)) return "Sudha Murty";

  return "Other";
}

function BookCard({
  book,
  index,
  onBorrow,
}: {
  book: Book;
  index: number;
  onBorrow: (book: Book) => void;
}) {
  const ocidIndex = index + 1;

  return (
    <motion.div
      data-ocid={`books.item.${ocidIndex}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.6) }}
      className="group flex flex-col bg-card border border-border rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
    >
      <div
        className={`h-1.5 w-full ${book.available ? "bg-accent" : "bg-muted"}`}
      />

      <div className="flex flex-col flex-1 p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg text-foreground leading-tight line-clamp-2">
              {book.title}
            </h3>
          </div>
          <Badge
            variant={book.available ? "default" : "secondary"}
            className={`shrink-0 text-xs ${
              book.available
                ? "bg-accent/15 text-accent border-accent/30 hover:bg-accent/20"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {book.available ? "Available" : "Rented Out"}
          </Badge>
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-border">
          <Button
            data-ocid="books.borrow.open_modal_button"
            onClick={() => onBorrow(book)}
            disabled={!book.available}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5 text-sm"
          >
            {book.available ? "Borrow This Book" : "Unavailable"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function BorrowModal({
  book,
  open,
  onClose,
}: {
  book: Book | null;
  open: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const { mutate, isPending } = useSubmitRentalRequest();

  const handleClose = () => {
    setName("");
    setEmail("");
    setSubmitted(false);
    setError("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!book) return;
    setError("");
    mutate(
      { name, email, bookId: book.id },
      {
        onSuccess: () => setSubmitted(true),
        onError: (err) =>
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong. Please try again.",
          ),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent data-ocid="borrow.dialog" className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {submitted ? "Request Submitted!" : `Borrow: ${book?.title}`}
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div
            data-ocid="borrow.success_state"
            className="py-6 flex flex-col items-center gap-4 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-accent" />
            </div>
            <div>
              <p className="font-medium text-foreground mb-1">
                We received your request!
              </p>
              <p className="text-sm text-muted-foreground">
                We'll be in touch at <strong>{email}</strong> to confirm your
                rental of <em>{book?.title}</em>.
              </p>
            </div>
            <Button onClick={handleClose} className="mt-2 rounded-full px-6">
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="borrow-book" className="text-sm font-medium">
                Book
              </Label>
              <Input
                id="borrow-book"
                value={book?.title ?? ""}
                disabled
                className="bg-muted/50 text-muted-foreground"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="borrow-name" className="text-sm font-medium">
                Your Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="borrow-name"
                data-ocid="borrow.name.input"
                placeholder="e.g. Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="borrow-email" className="text-sm font-medium">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="borrow-email"
                data-ocid="borrow.email.input"
                type="email"
                placeholder="e.g. jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {error && (
              <div
                data-ocid="borrow.error_state"
                className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                data-ocid="borrow.cancel_button"
                onClick={handleClose}
                className="w-full sm:w-auto rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-ocid="borrow.submit_button"
                disabled={isPending}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-full gap-2"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

const SKELETON_IDS = ["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"];

export default function BooksPage() {
  const { data: books, isLoading, isError, refetch } = useGetBooks();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      (books ?? []).filter((b) =>
        b.title.toLowerCase().includes(search.toLowerCase()),
      ),
    [books, search],
  );

  // When searching, show flat list; otherwise group by series
  const groupedSeries = useMemo(() => {
    if (search.trim()) return null;

    const map = new Map<string, Book[]>();
    for (const book of books ?? []) {
      const series = getSeriesLabel(book);
      if (!map.has(series)) map.set(series, []);
      map.get(series)!.push(book);
    }

    // Sort series alphabetically, but put "Other" last
    const sorted = Array.from(map.entries()).sort(([a], [b]) => {
      if (a === "Other") return 1;
      if (b === "Other") return -1;
      return a.localeCompare(b);
    });

    return sorted;
  }, [books, search]);

  const handleBorrow = (book: Book) => {
    setSelectedBook(book);
    setModalOpen(true);
  };

  // Running index for ocid markers across all sections
  let globalIndex = 0;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="font-display text-4xl sm:text-5xl text-foreground mb-3">
          Our Book Collection
        </h1>
        <p className="text-muted-foreground text-lg max-w-lg">
          Browse all available books and submit a borrow request for any title
          you'd like.
        </p>
      </motion.div>

      {/* Rental Guidelines Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mb-8 flex items-start gap-3 rounded-xl border border-amber-300/60 bg-amber-50/80 px-5 py-4 shadow-sm"
      >
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <p className="mb-1.5 text-sm font-semibold text-amber-800 uppercase tracking-wide">
            Rental Guidelines
          </p>
          <ul className="space-y-1 text-sm text-amber-900">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
              All books must be returned in the same condition they were
              borrowed.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
              Rental price is a flat <strong>₹10</strong> for all books.
            </li>
          </ul>
        </div>
      </motion.div>

      <div className="relative max-w-sm mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          data-ocid="books.search_input"
          placeholder="Search by title..."
          className="pl-9 rounded-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading && (
        <div
          data-ocid="books.loading_state"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {SKELETON_IDS.map((id) => (
            <div
              key={id}
              className="rounded-xl border border-border overflow-hidden"
            >
              <div className="h-1.5 bg-muted" />
              <div className="p-6 flex flex-col gap-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-8 w-full mt-2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div
          data-ocid="books.error_state"
          className="flex flex-col items-center gap-3 py-16 text-center"
        >
          <AlertCircle className="w-10 h-10 text-destructive" />
          <p className="text-foreground font-medium">Failed to load books</p>
          <p className="text-sm text-muted-foreground">
            Please try again in a moment.
          </p>
          <Button
            data-ocid="books.error_state"
            onClick={() => refetch()}
            variant="outline"
            className="mt-2 rounded-full px-6 gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <div
          data-ocid="books.empty_state"
          className="flex flex-col items-center gap-3 py-16 text-center"
        >
          <BookOpen className="w-12 h-12 text-muted-foreground/40" />
          <p className="text-foreground font-medium">No books found</p>
          <p className="text-sm text-muted-foreground">
            {search
              ? "Try a different search term."
              : "No books are available right now."}
          </p>
        </div>
      )}

      {/* Flat search results */}
      {!isLoading && !isError && search.trim() && filtered.length > 0 && (
        <div
          data-ocid="books.list"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filtered.map((book, i) => (
            <BookCard
              key={book.id.toString()}
              book={book}
              index={i}
              onBorrow={handleBorrow}
            />
          ))}
        </div>
      )}

      {/* Grouped by series */}
      {!isLoading &&
        !isError &&
        !search.trim() &&
        groupedSeries &&
        groupedSeries.length > 0 && (
          <div data-ocid="books.list" className="space-y-12">
            {groupedSeries.map(([seriesName, seriesBooks], sIdx) => {
              const sectionStart = globalIndex;
              globalIndex += seriesBooks.length;
              return (
                <motion.section
                  key={seriesName}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: sIdx * 0.08 }}
                  aria-label={seriesName}
                >
                  <div className="flex items-center gap-4 mb-6 pb-3 border-b-2 border-primary/20">
                    <h2 className="font-display text-2xl sm:text-3xl text-primary tracking-wide">
                      {seriesName}
                    </h2>
                    <span className="text-sm text-muted-foreground font-medium">
                      {seriesBooks.length}{" "}
                      {seriesBooks.length === 1 ? "book" : "books"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {seriesBooks.map((book, i) => (
                      <BookCard
                        key={book.id.toString()}
                        book={book}
                        index={sectionStart + i}
                        onBorrow={handleBorrow}
                      />
                    ))}
                  </div>
                </motion.section>
              );
            })}
          </div>
        )}

      <BorrowModal
        book={selectedBook}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
