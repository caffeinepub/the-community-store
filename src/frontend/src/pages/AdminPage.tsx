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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  BookOpen,
  Check,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Pencil,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { RentalRequestStatus } from "../backend.d";
import type { Book, RentalRequest } from "../backend.d";
import { useActor } from "../hooks/useActor";
import {
  useAddBook,
  useCheckAdminPassword,
  useGetBooks,
  useGetRentalRequestsWithPassword,
  useIsAdminPasswordSet,
  useRemoveBook,
  useSetAdminPassword,
  useUpdateBook,
  useUpdateRequestStatusWithPassword,
} from "../hooks/useQueries";

function formatDate(nanoseconds: bigint): string {
  const ms = Number(nanoseconds / 1_000_000n);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

function statusBadgeClass(status: RentalRequestStatus) {
  switch (status) {
    case RentalRequestStatus.approved:
      return "bg-green-50 text-green-700 border-green-200";
    case RentalRequestStatus.rejected:
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
}

function ShareLinkCard() {
  const customerUrl = `${window.location.origin}/books`;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(customerUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = customerUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="mb-8 p-5 rounded-xl border border-accent/30 bg-accent/5 flex flex-col sm:flex-row sm:items-center gap-4"
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
          <Users className="w-4 h-4 text-accent" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground mb-0.5">
            Share with Customers
          </p>
          <p className="text-xs text-muted-foreground mb-2">
            Send this link to customers so they can browse and request books.
          </p>
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-sm text-foreground font-mono truncate select-all">
              {customerUrl}
            </span>
          </div>
        </div>
      </div>
      <Button
        type="button"
        data-ocid="admin.share_link.button"
        onClick={handleCopy}
        variant="outline"
        size="sm"
        className={`shrink-0 rounded-full gap-2 transition-all duration-200 ${
          copied
            ? "border-green-300 bg-green-50 text-green-700 hover:bg-green-50"
            : "border-accent/40 text-accent hover:bg-accent/10 hover:border-accent"
        }`}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5" /> Copied!
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" /> Copy Link
          </>
        )}
      </Button>
    </motion.div>
  );
}

function ChangePasswordPanel({ adminPassword }: { adminPassword: string }) {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const { mutateAsync: setPw, isPending } = useSetAdminPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (newPw !== confirmPw) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (newPw.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters.",
      });
      return;
    }
    try {
      const ok = await setPw({
        newPassword: newPw,
        currentPassword: currentPw || adminPassword,
      });
      if (ok) {
        setMessage({ type: "success", text: "Password updated successfully." });
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
      } else {
        setMessage({ type: "error", text: "Current password is incorrect." });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Connection error. Please refresh the page and try again.",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="mb-8 p-5 rounded-xl border border-border bg-card"
    >
      <div className="flex items-center gap-2 mb-4">
        <KeyRound className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">
          Change Admin Password
        </span>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-3 items-end flex-wrap"
      >
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">
            Current Password
          </Label>
          <div className="relative">
            <Input
              data-ocid="admin.change_password.current_input"
              type={showCurrent ? "text" : "password"}
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="Current password"
              className="pr-9 h-9 text-sm w-44"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showCurrent ? (
                <EyeOff className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">New Password</Label>
          <div className="relative">
            <Input
              data-ocid="admin.change_password.new_input"
              type={showNew ? "text" : "password"}
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="New password"
              className="pr-9 h-9 text-sm w-44"
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showNew ? (
                <EyeOff className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">
            Confirm New Password
          </Label>
          <Input
            data-ocid="admin.change_password.confirm_input"
            type="password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            placeholder="Confirm password"
            className="h-9 text-sm w-44"
          />
        </div>
        <Button
          data-ocid="admin.change_password.submit_button"
          type="submit"
          size="sm"
          disabled={isPending || !newPw || !confirmPw}
          className="h-9 rounded-full px-5 gap-2"
        >
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          Update Password
        </Button>
      </form>
      {message && (
        <p
          data-ocid={
            message.type === "success"
              ? "admin.change_password.success_state"
              : "admin.change_password.error_state"
          }
          className={`mt-3 text-xs font-medium ${
            message.type === "success" ? "text-green-600" : "text-destructive"
          }`}
        >
          {message.text}
        </p>
      )}
    </motion.div>
  );
}

type BookFormData = {
  title: string;
  author: string;
  description: string;
  available: boolean;
};

function ManageBooksPanel({ adminPassword }: { adminPassword: string }) {
  const { data: books } = useGetBooks();
  const { mutateAsync: addBook, isPending: isAdding } = useAddBook();
  const { mutateAsync: updateBook, isPending: isUpdating } = useUpdateBook();
  const { mutateAsync: removeBook, isPending: isRemoving } = useRemoveBook();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<bigint | null>(null);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState<BookFormData>({
    title: "",
    author: "",
    description: "",
    available: true,
  });

  const openAdd = () => {
    setEditingBook(null);
    setFormData({ title: "", author: "", description: "", available: true });
    setFormError("");
    setDialogOpen(true);
  };

  const openEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      description: book.description,
      available: book.available,
    });
    setFormError("");
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingBook(null);
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!formData.title.trim()) {
      setFormError("Title is required.");
      return;
    }
    if (!formData.author.trim()) {
      setFormError("Author is required.");
      return;
    }
    try {
      if (editingBook) {
        await updateBook({
          password: adminPassword,
          id: editingBook.id,
          title: formData.title.trim(),
          author: formData.author.trim(),
          description: formData.description.trim(),
          available: formData.available,
        });
      } else {
        await addBook({
          password: adminPassword,
          title: formData.title.trim(),
          author: formData.author.trim(),
          description: formData.description.trim(),
        });
      }
      handleDialogClose();
    } catch {
      setFormError("Failed to save book. Please try again.");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await removeBook({ password: adminPassword, id });
      setConfirmDeleteId(null);
    } catch {
      // silently ignore, list will not refresh
    }
  };

  const isFormPending = isAdding || isUpdating;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.12 }}
        className="mb-8 p-5 rounded-xl border border-border bg-card"
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">
              Manage Books
            </span>
            {books && books.length > 0 && (
              <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                {books.length}
              </span>
            )}
          </div>
          <Button
            data-ocid="admin.books.open_modal_button"
            type="button"
            size="sm"
            onClick={openAdd}
            className="rounded-full gap-1.5 h-8 px-3 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Book
          </Button>
        </div>

        {(!books || books.length === 0) && (
          <div
            data-ocid="admin.books.empty_state"
            className="flex flex-col items-center gap-2 py-10 text-center"
          >
            <BookOpen className="w-10 h-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              No books yet. Add your first book!
            </p>
          </div>
        )}

        {books && books.length > 0 && (
          <div
            data-ocid="admin.books.table"
            className="rounded-lg border border-border overflow-hidden"
          >
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="font-semibold text-xs">Title</TableHead>
                  <TableHead className="font-semibold text-xs">
                    Author
                  </TableHead>
                  <TableHead className="font-semibold text-xs">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-xs text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {books.map((book, i) => (
                  <TableRow
                    key={book.id.toString()}
                    data-ocid={`admin.books.row.${i + 1}`}
                  >
                    <TableCell
                      className="font-medium text-sm max-w-[180px] truncate"
                      title={book.title}
                    >
                      {book.title}
                    </TableCell>
                    <TableCell
                      className="text-sm text-muted-foreground max-w-[140px] truncate"
                      title={book.author}
                    >
                      {book.author}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-xs border ${
                          book.available
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {book.available ? "Available" : "Rented Out"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {confirmDeleteId === book.id ? (
                          <>
                            <span className="text-xs text-muted-foreground mr-1">
                              Delete?
                            </span>
                            <Button
                              data-ocid={`admin.books.confirm_button.${i + 1}`}
                              type="button"
                              size="sm"
                              variant="destructive"
                              className="h-7 px-2 text-xs rounded-full gap-1"
                              disabled={isRemoving}
                              onClick={() => handleDelete(book.id)}
                            >
                              {isRemoving ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : null}
                              Yes, delete
                            </Button>
                            <Button
                              data-ocid={`admin.books.cancel_button.${i + 1}`}
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs rounded-full"
                              onClick={() => setConfirmDeleteId(null)}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              data-ocid={`admin.books.edit_button.${i + 1}`}
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-7 w-7 p-0 rounded-full"
                              onClick={() => openEdit(book)}
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                              data-ocid={`admin.books.delete_button.${i + 1}`}
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-7 w-7 p-0 rounded-full text-destructive hover:bg-destructive/10 hover:border-destructive/40"
                              onClick={() => setConfirmDeleteId(book.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </motion.div>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => !o && handleDialogClose()}>
        <DialogContent data-ocid="admin.books.dialog" className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingBook ? "Edit Book" : "Add New Book"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="book-title" className="text-sm font-medium">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="book-title"
                data-ocid="admin.books.title.input"
                placeholder="e.g. The Great Gatsby"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="book-author" className="text-sm font-medium">
                Author <span className="text-destructive">*</span>
              </Label>
              <Input
                id="book-author"
                data-ocid="admin.books.author.input"
                placeholder="e.g. F. Scott Fitzgerald"
                value={formData.author}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, author: e.target.value }))
                }
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="book-description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="book-description"
                data-ocid="admin.books.description.textarea"
                placeholder="A short description of the book..."
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                className="resize-none"
              />
            </div>

            {editingBook && (
              <div className="flex items-center gap-3">
                <Switch
                  id="book-available"
                  data-ocid="admin.books.available.switch"
                  checked={formData.available}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, available: checked }))
                  }
                />
                <Label
                  htmlFor="book-available"
                  className="text-sm cursor-pointer"
                >
                  Available for borrowing
                </Label>
              </div>
            )}

            {formError && (
              <div
                data-ocid="admin.books.error_state"
                className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <DialogFooter className="flex-col sm:flex-row gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                data-ocid="admin.books.cancel_button"
                onClick={handleDialogClose}
                className="w-full sm:w-auto rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-ocid="admin.books.submit_button"
                disabled={isFormPending}
                className="w-full sm:w-auto rounded-full gap-2"
              >
                {isFormPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {isFormPending
                  ? editingBook
                    ? "Saving..."
                    : "Adding..."
                  : editingBook
                    ? "Save Changes"
                    : "Add Book"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function RequestRow({
  request,
  bookTitle,
  rowIndex,
  adminPassword,
}: {
  request: RentalRequest;
  bookTitle: string;
  rowIndex: number;
  adminPassword: string;
}) {
  const { mutate: updateStatus, isPending } =
    useUpdateRequestStatusWithPassword();

  const handleStatusChange = (newStatus: string) => {
    updateStatus({
      password: adminPassword,
      requestId: request.id,
      newStatus: newStatus as RentalRequestStatus,
    });
  };

  return (
    <TableRow data-ocid={`admin.requests.row.${rowIndex}`}>
      <TableCell className="font-medium">{request.borrowerName}</TableCell>
      <TableCell className="text-muted-foreground">
        {request.borrowerEmail}
      </TableCell>
      <TableCell className="max-w-[160px] truncate" title={bookTitle}>
        {bookTitle}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
        {formatDate(request.submittedAt)}
      </TableCell>
      <TableCell>
        <Badge
          className={`text-xs border ${statusBadgeClass(request.status)} capitalize`}
        >
          {request.status}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Select
            defaultValue={request.status}
            onValueChange={handleStatusChange}
            disabled={isPending}
          >
            <SelectTrigger
              data-ocid={`admin.requests.select.${rowIndex}`}
              className="h-8 w-32 text-xs"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={RentalRequestStatus.pending}>
                Pending
              </SelectItem>
              <SelectItem value={RentalRequestStatus.approved}>
                Approved
              </SelectItem>
              <SelectItem value={RentalRequestStatus.rejected}>
                Rejected
              </SelectItem>
            </SelectContent>
          </Select>
          {isPending && (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

// Setup screen for first-time password creation
function SetupPasswordScreen({ onSetup }: { onSetup: (pw: string) => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const { mutateAsync: setPw, isPending } = useSetAdminPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    try {
      const ok = await setPw({ newPassword: password, currentPassword: "" });
      if (ok) {
        onSetup(password);
      } else {
        setError("Failed to set password. Please try again.");
      }
    } catch {
      setError("Connection error. Please refresh the page and try again.");
    }
  };

  return (
    <div
      data-ocid="admin.page"
      className="container mx-auto px-4 sm:px-6 py-20 flex flex-col items-center text-center gap-6 max-w-sm"
    >
      <div className="w-20 h-20 rounded-full bg-primary/8 flex items-center justify-center">
        <KeyRound className="w-9 h-9 text-primary" />
      </div>
      <div>
        <h1 className="font-display text-3xl text-foreground mb-2">
          Set Admin Password
        </h1>
        <p className="text-muted-foreground text-sm">
          Create a password to protect the admin area. Only you will know it.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
        <div className="relative">
          <Input
            data-ocid="admin.setup.password_input"
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Choose a password"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPw ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <Input
          data-ocid="admin.setup.confirm_input"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm password"
        />
        {error && (
          <p
            data-ocid="admin.setup.error_state"
            className="text-xs text-destructive text-left"
          >
            {error}
          </p>
        )}
        <Button
          data-ocid="admin.setup.submit_button"
          type="submit"
          disabled={isPending || !password || !confirm}
          className="rounded-full gap-2"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Lock className="w-4 h-4" />
          )}
          Set Password & Enter
        </Button>
      </form>
    </div>
  );
}

// Login screen
function LoginScreen({ onLogin }: { onLogin: (pw: string) => void }) {
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const { mutateAsync: checkPw, isPending } = useCheckAdminPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const ok = await checkPw(password);
      if (ok) {
        onLogin(password);
      } else {
        setError("Incorrect password. Please try again.");
      }
    } catch {
      setError("Connection error. Please refresh the page and try again.");
    }
  };

  return (
    <div
      data-ocid="admin.page"
      className="container mx-auto px-4 sm:px-6 py-20 flex flex-col items-center text-center gap-6 max-w-sm"
    >
      <div className="w-20 h-20 rounded-full bg-primary/8 flex items-center justify-center">
        <Shield className="w-9 h-9 text-primary" />
      </div>
      <div>
        <h1 className="font-display text-3xl text-foreground mb-2">
          Admin Access
        </h1>
        <p className="text-muted-foreground text-sm">
          Enter your admin password to manage rental requests.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
        <div className="relative">
          <Input
            data-ocid="admin.login.password_input"
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="pr-10"
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPw ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {error && (
          <p
            data-ocid="admin.login.error_state"
            className="text-xs text-destructive text-left"
          >
            {error}
          </p>
        )}
        <Button
          data-ocid="admin.login.submit_button"
          type="submit"
          disabled={isPending || !password}
          className="rounded-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Lock className="w-4 h-4" />
          )}
          Login
        </Button>
      </form>
    </div>
  );
}

export default function AdminPage() {
  const [adminPassword, setAdminPassword] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { isFetching: actorLoading } = useActor();

  const { data: isPasswordSet, isLoading: checkingPassword } =
    useIsAdminPasswordSet();
  const {
    data: requests,
    isLoading: requestsLoading,
    isError: requestsError,
    refetch,
  } = useGetRentalRequestsWithPassword(adminPassword ?? "");
  const { data: books } = useGetBooks();

  const bookMap = new Map((books ?? []).map((b) => [b.id.toString(), b.title]));

  const handleLogout = () => {
    setAdminPassword(null);
    queryClient.removeQueries({ queryKey: ["rentalRequestsWithPassword"] });
  };

  // Loading state — wait for actor AND password check
  if (actorLoading || checkingPassword) {
    return (
      <div
        data-ocid="admin.page"
        className="container mx-auto px-4 sm:px-6 py-20 flex flex-col items-center gap-4"
      >
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Loading admin...</p>
      </div>
    );
  }

  // First-time setup
  if (!isPasswordSet) {
    return (
      <SetupPasswordScreen
        onSetup={(pw) => {
          setAdminPassword(pw);
          queryClient.invalidateQueries({ queryKey: ["isAdminPasswordSet"] });
        }}
      />
    );
  }

  // Login
  if (!adminPassword) {
    return <LoginScreen onLogin={setAdminPassword} />;
  }

  // Admin view
  return (
    <div
      data-ocid="admin.page"
      className="container mx-auto px-4 sm:px-6 py-12"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-accent" />
            <span className="text-xs font-medium text-accent uppercase tracking-widest">
              Admin Panel
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-foreground">
            My Responses
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all book borrow requests from your community.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="rounded-full gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
          <Button
            data-ocid="admin.logout.button"
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="rounded-full gap-2"
          >
            Log out
          </Button>
        </div>
      </motion.div>

      {/* Share with Customers card */}
      <ShareLinkCard />

      {/* Manage Books */}
      <ManageBooksPanel adminPassword={adminPassword} />

      {/* Change Password */}
      <ChangePasswordPanel adminPassword={adminPassword} />

      {/* Loading */}
      {requestsLoading && (
        <div
          data-ocid="admin.requests.loading_state"
          className="flex items-center justify-center py-16 gap-3"
        >
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Loading requests...</span>
        </div>
      )}

      {/* Error */}
      {requestsError && (
        <div
          data-ocid="admin.requests.error_state"
          className="flex flex-col items-center gap-3 py-16 text-center"
        >
          <AlertCircle className="w-10 h-10 text-destructive" />
          <p className="font-medium text-foreground">Failed to load requests</p>
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="rounded-full gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </Button>
        </div>
      )}

      {/* Empty */}
      {!requestsLoading && !requestsError && (requests ?? []).length === 0 && (
        <div
          data-ocid="admin.requests.empty_state"
          className="flex flex-col items-center gap-3 py-16 text-center"
        >
          <Shield className="w-12 h-12 text-muted-foreground/30" />
          <p className="font-medium text-foreground">No rental requests yet</p>
          <p className="text-sm text-muted-foreground">
            When customers submit borrow requests, they'll appear here.
          </p>
        </div>
      )}

      {/* Table */}
      {!requestsLoading && !requestsError && (requests ?? []).length > 0 && (
        <div
          data-ocid="admin.requests.table"
          className="rounded-xl border border-border overflow-hidden shadow-card"
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Book</TableHead>
                <TableHead className="font-semibold whitespace-nowrap">
                  Submitted
                </TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(requests ?? []).map((req, i) => (
                <RequestRow
                  key={req.id.toString()}
                  request={req}
                  bookTitle={
                    bookMap.get(req.bookId.toString()) ?? `Book #${req.bookId}`
                  }
                  rowIndex={i + 1}
                  adminPassword={adminPassword}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
