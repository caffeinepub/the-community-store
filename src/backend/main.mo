import Text "mo:core/Text";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Auth "authorization/access-control";
import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import Nat "mo:core/Nat";
import Bool "mo:core/Bool";
import Principal "mo:core/Principal";
import Int "mo:core/Int";

actor {
  var nextRequestId = 1;
  let accessControlState = Auth.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  type Book = {
    id : Nat;
    title : Text;
    author : Text;
    description : Text;
    rentalPrice : Nat; // in USD cents
    available : Bool;
  };

  type RentalRequestStatus = {
    #pending;
    #approved;
    #rejected;
  };

  module RentalRequestStatus {
    public func toText(status : RentalRequestStatus) : Text {
      switch (status) {
        case (#pending) { "pending" };
        case (#approved) { "approved" };
        case (#rejected) { "rejected" };
      };
    };
  };

  type RentalRequest = {
    id : Nat;
    bookId : Nat;
    borrowerName : Text;
    borrowerEmail : Text;
    submittedAt : Time.Time;
    status : RentalRequestStatus;
  };

  module Book {
    public func compare(book1 : Book, book2 : Book) : Order.Order {
      Nat.compare(book1.id, book2.id);
    };

    public func compareByTitle(book1 : Book, book2 : Book) : Order.Order {
      switch (Text.compare(book1.title, book2.title)) {
        case (#equal) { Nat.compare(book1.id, book2.id) };
        case (order) { order };
      };
    };
  };

  module RentalRequest {
    public func compare(request1 : RentalRequest, request2 : RentalRequest) : Order.Order {
      Nat.compare(request1.id, request2.id);
    };

    public func compareByStatus(request1 : RentalRequest, request2 : RentalRequest) : Order.Order {
      switch (Text.compare(RentalRequestStatus.toText(request1.status), RentalRequestStatus.toText(request2.status))) {
        case (#equal) { Nat.compare(request1.id, request2.id) };
        case (order) { order };
      };
    };

    public func compareByTimestamp(request1 : RentalRequest, request2 : RentalRequest) : Order.Order {
      switch (Int.compare(request1.submittedAt, request2.submittedAt)) {
        case (#equal) { Nat.compare(request1.id, request2.id) };
        case (order) { order };
      };
    };
  };

  let books = Map.fromIter<Nat, Book>(
    [
      (
        1,
        {
          id = 1;
          title = "The Pragmatic Programmer";
          author = "Andrew Hunt, David Thomas";
          description = "A guide to software craftsmanship with practical advice for programmers.";
          rentalPrice = 199;
          available = true;
        },
      ),
      (
        2,
        {
          id = 2;
          title = "Clean Code";
          author = "Robert C. Martin";
          description = "A handbook of agile software craftsmanship, focusing on writing clean, maintainable code.";
          rentalPrice = 149;
          available = true;
        },
      ),
      (
        3,
        {
          id = 3;
          title = "Atomic Habits";
          author = "James Clear";
          description = "A book about building good habits and breaking bad ones through small changes.";
          rentalPrice = 99;
          available = true;
        },
      ),
      (
        4,
        {
          id = 4;
          title = "1984";
          author = "George Orwell";
          description = "A dystopian novel set in a totalitarian society under constant surveillance.";
          rentalPrice = 79;
          available = true;
        },
      ),
      (
        5,
        {
          id = 5;
          title = "To Kill a Mockingbird";
          author = "Harper Lee";
          description = "A classic novel about racial injustice in the American South.";
          rentalPrice = 89;
          available = true;
        },
      ),
      (
        6,
        {
          id = 6;
          title = "The Lean Startup";
          author = "Eric Ries";
          description = "A guide to entrepreneurship and building successful startups using lean principles.";
          rentalPrice = 159;
          available = true;
        },
      ),
      (
        7,
        {
          id = 7;
          title = "The Great Gatsby";
          author = "F. Scott Fitzgerald";
          description = "A novel about the American Dream and the Jazz Age in the 1920s.";
          rentalPrice = 79;
          available = true;
        },
      ),
      (
        8,
        {
          id = 8;
          title = "Harry Potter and the Sorcerer's Stone";
          author = "J.K. Rowling";
          description = "The first book in the beloved Harry Potter series.";
          rentalPrice = 99;
          available = true;
        },
      ),
    ].values()
  );

  let rentalRequests = Map.empty<Nat, RentalRequest>();

  // User profile functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not Auth.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Public functions - no auth required
  public query ({ caller }) func getBooks() : async [Book] {
    books.values().toArray().sort();
  };

  public shared ({ caller }) func submitRentalRequest(borrowerName : Text, borrowerEmail : Text, bookId : Nat) : async Nat {
    // Anyone can submit a rental request (including guests)
    switch (books.get(bookId)) {
      case (null) { Runtime.trap("Book not found") };
      case (?book) {
        if (not book.available) {
          Runtime.trap("Book is not available");
        };
      };
    };

    let newRequest : RentalRequest = {
      id = nextRequestId;
      bookId;
      borrowerName;
      borrowerEmail;
      submittedAt = Time.now();
      status = #pending;
    };

    rentalRequests.add(nextRequestId, newRequest);
    nextRequestId += 1;
    newRequest.id;
  };

  // Admin-only functions
  public query ({ caller }) func getRentalRequests() : async [RentalRequest] {
    if (not (Auth.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access rental requests");
    };
    rentalRequests.values().toArray().sort();
  };

  public shared ({ caller }) func updateRequestStatus(requestId : Nat, newStatus : RentalRequestStatus) : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update request status");
    };
    switch (rentalRequests.get(requestId)) {
      case (null) { Runtime.trap("Request not found") };
      case (?request) {
        let updatedRequest : RentalRequest = {
          id = request.id;
          bookId = request.bookId;
          borrowerName = request.borrowerName;
          borrowerEmail = request.borrowerEmail;
          submittedAt = request.submittedAt;
          status = newStatus;
        };
        rentalRequests.add(requestId, updatedRequest);
      };
    };
  };

  public shared ({ caller }) func addBook(title : Text, author : Text, description : Text, rentalPrice : Nat) : async Nat {
    if (not (Auth.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add books");
    };

    let newBook : Book = {
      id = books.size() + 1;
      title;
      author;
      description;
      rentalPrice;
      available = true;
    };

    books.add(newBook.id, newBook);
    newBook.id;
  };

  public shared ({ caller }) func updateBookAvailability(bookId : Nat, available : Bool) : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update book availability");
    };
    switch (books.get(bookId)) {
      case (null) { Runtime.trap("Book not found") };
      case (?book) {
        let updatedBook : Book = {
          id = book.id;
          title = book.title;
          author = book.author;
          description = book.description;
          rentalPrice = book.rentalPrice;
          available;
        };
        books.add(bookId, updatedBook);
      };
    };
  };
};
