import Text "mo:core/Text";
import Auth "authorization/access-control";
import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import Nat "mo:core/Nat";
import Bool "mo:core/Bool";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Order "mo:core/Order";

actor {
  var nextRequestId = 1;
  var nextBookId = 78;
  let accessControlState = Auth.initState();
  include MixinAuthorization(accessControlState);

  stable var adminPassword : ?Text = null;

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  type Book = {
    id : Nat;
    title : Text;
    author : Text;
    description : Text;
    rentalPrice : Nat;
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
    public func compare(b1 : Book, b2 : Book) : Order.Order {
      Nat.compare(b1.id, b2.id);
    };
  };

  module RentalRequest {
    public func compare(r1 : RentalRequest, r2 : RentalRequest) : Order.Order {
      Nat.compare(r1.id, r2.id);
    };
  };

  // Kept for upgrade compatibility with previous version that declared this stable var.
  // Its contents are migrated into stableBooks in postupgrade and it is cleared.
  stable var SEED_BOOKS : [(Nat, Book)] = [];

  // Primary stable storage for books and rental requests
  stable var stableBooks : [(Nat, Book)] = [
    (1, { id=1; title="Diary Of A Wimpy Kid"; author="Jeff Kinney"; description=""; rentalPrice=10; available=true }),
    (2, { id=2; title="Diary Of A Wimpy Kid : Rodrick Rules"; author="Jeff Kinney"; description=""; rentalPrice=10; available=true }),
    (3, { id=3; title="Diary Of A Wimpy Kid : Last Straw"; author="Jeff Kinney"; description=""; rentalPrice=10; available=true }),
    (4, { id=4; title="Diary Of A Wimpy Kid : Dog Days"; author="Jeff Kinney"; description=""; rentalPrice=10; available=true }),
    (5, { id=5; title="Diary Of A Wimpy Kid : The Ugly Truth"; author="Jeff Kinney"; description=""; rentalPrice=10; available=true }),
    (6, { id=6; title="Diary Of A Wimpy Kid : Cabin Fever"; author="Jeff Kinney"; description=""; rentalPrice=10; available=true }),
    (7, { id=7; title="Diary Of A Wimpy Kid : The Third Wheel"; author="Jeff Kinney"; description=""; rentalPrice=10; available=true }),
    (8, { id=8; title="Diary Of A Wimpy Kid : Hard Luck"; author="Jeff Kinney"; description=""; rentalPrice=10; available=true }),
    (9, { id=9; title="Diary Of A Wimpy Kid : The Long Haul"; author="Jeff Kinney"; description=""; rentalPrice=10; available=true }),
    (10, { id=10; title="Diary Of A Wimpy Kid : Old School"; author="Jeff Kinney"; description=""; rentalPrice=10; available=true }),
    (11, { id=11; title="Diary Of A Wimpy Kid : Double Down"; author="Jeff Kinney"; description=""; rentalPrice=10; available=true }),
    (12, { id=12; title="Diary Of A Wimpy Kid : The Getaway"; author="Jeff Kinney"; description=""; rentalPrice=10; available=true }),
    (13, { id=13; title="Diary Of A Wimpy Kid : The Meltdown"; author="Jeff Kinney"; description=""; rentalPrice=10; available=true }),
    (14, { id=14; title="Diary Of A Wimpy Kid : Wrecking Ball"; author="Jeff Kinney"; description=""; rentalPrice=10; available=true }),
    (15, { id=15; title="Diary Of A Wimpy Kid : The Deep End"; author="Jeff Kinney"; description=""; rentalPrice=10; available=true }),
    (16, { id=16; title="Diary Of A Wimpy Kid : Big Shot"; author="Jeff Kinney"; description=""; rentalPrice=10; available=true }),
    (17, { id=17; title="Diary Of A Wimpy Kid : Diper Overlode"; author="Jeff Kinney"; description=""; rentalPrice=10; available=true }),
    (18, { id=18; title="Diary Of A Wimpy Kid : No Brainer"; author="Jeff Kinney"; description=""; rentalPrice=10; available=true }),
    (19, { id=19; title="Demon Slayer Book 1"; author="Koyoharu Gotouge"; description=""; rentalPrice=10; available=true }),
    (20, { id=20; title="Demon Slayer Book 2"; author="Koyoharu Gotouge"; description=""; rentalPrice=10; available=true }),
    (21, { id=21; title="Demon Slayer Book 3"; author="Koyoharu Gotouge"; description=""; rentalPrice=10; available=true }),
    (22, { id=22; title="Demon Slayer Book 4"; author="Koyoharu Gotouge"; description=""; rentalPrice=10; available=true }),
    (23, { id=23; title="Demon Slayer Book 5"; author="Koyoharu Gotouge"; description=""; rentalPrice=10; available=true }),
    (24, { id=24; title="Demon Slayer Book 6"; author="Koyoharu Gotouge"; description=""; rentalPrice=10; available=true }),
    (25, { id=25; title="Demon Slayer Book 7"; author="Koyoharu Gotouge"; description=""; rentalPrice=10; available=true }),
    (26, { id=26; title="Demon Slayer Book 8"; author="Koyoharu Gotouge"; description=""; rentalPrice=10; available=true }),
    (27, { id=27; title="Demon Slayer Book 9"; author="Koyoharu Gotouge"; description=""; rentalPrice=10; available=true }),
    (28, { id=28; title="Demon Slayer Book 10"; author="Koyoharu Gotouge"; description=""; rentalPrice=10; available=true }),
    (29, { id=29; title="Demon Slayer Book 11"; author="Koyoharu Gotouge"; description=""; rentalPrice=10; available=true }),
    (30, { id=30; title="Demon Slayer Book 12"; author="Koyoharu Gotouge"; description=""; rentalPrice=10; available=true }),
    (31, { id=31; title="Demon Slayer Book 13"; author="Koyoharu Gotouge"; description=""; rentalPrice=10; available=true }),
    (32, { id=32; title="Demon Slayer Book 14"; author="Koyoharu Gotouge"; description=""; rentalPrice=10; available=true }),
    (33, { id=33; title="Demon Slayer Book 15"; author="Koyoharu Gotouge"; description=""; rentalPrice=10; available=true }),
    (34, { id=34; title="Demon Slayer Book 16"; author="Koyoharu Gotouge"; description=""; rentalPrice=10; available=true }),
    (35, { id=35; title="Demon Slayer Book 17"; author="Koyoharu Gotouge"; description=""; rentalPrice=10; available=true }),
    (36, { id=36; title="Demon Slayer Book 18"; author="Koyoharu Gotouge"; description=""; rentalPrice=10; available=true }),
    (37, { id=37; title="Demon Slayer Book 19"; author="Koyoharu Gotouge"; description=""; rentalPrice=10; available=true }),
    (38, { id=38; title="Demon Slayer Book 20"; author="Koyoharu Gotouge"; description=""; rentalPrice=10; available=true }),
    (39, { id=39; title="Demon Slayer Book 21"; author="Koyoharu Gotouge"; description=""; rentalPrice=10; available=true }),
    (40, { id=40; title="Demon Slayer Book 22"; author="Koyoharu Gotouge"; description=""; rentalPrice=10; available=true }),
    (41, { id=41; title="Demon Slayer Book 23"; author="Koyoharu Gotouge"; description=""; rentalPrice=10; available=true }),
    (42, { id=42; title="Kingdom Of Fantasy : The Dragon Prophecy"; author="Geronimo Stilton"; description=""; rentalPrice=10; available=true }),
    (43, { id=43; title="Kingdom Of Fantasy : The Volcano of Fire"; author="Geronimo Stilton"; description=""; rentalPrice=10; available=true }),
    (44, { id=44; title="Kingdom Of Fantasy : The Wizards Wand"; author="Geronimo Stilton"; description=""; rentalPrice=10; available=true }),
    (45, { id=45; title="It's Halloween You 'Fraidy Mouse"; author="Geronimo Stilton"; description=""; rentalPrice=10; available=true }),
    (46, { id=46; title="The Cheese Coloured Camper"; author="Geronimo Stilton"; description=""; rentalPrice=10; available=true }),
    (47, { id=47; title="The Hunt For The Golden Book"; author="Geronimo Stilton"; description=""; rentalPrice=10; available=true }),
    (48, { id=48; title="The Journey Through Time - Book 1"; author="Geronimo Stilton"; description=""; rentalPrice=10; available=true }),
    (49, { id=49; title="The BFG"; author="Roald Dahl"; description=""; rentalPrice=10; available=true }),
    (50, { id=50; title="The Witches"; author="Roald Dahl"; description=""; rentalPrice=10; available=true }),
    (51, { id=51; title="The Twits"; author="Roald Dahl"; description=""; rentalPrice=10; available=true }),
    (52, { id=52; title="Matilda"; author="Roald Dahl"; description=""; rentalPrice=10; available=true }),
    (53, { id=53; title="James and the Giant Peach"; author="Roald Dahl"; description=""; rentalPrice=10; available=true }),
    (54, { id=54; title="Esio Trot"; author="Roald Dahl"; description=""; rentalPrice=10; available=true }),
    (55, { id=55; title="The Magic Finger"; author="Roald Dahl"; description=""; rentalPrice=10; available=true }),
    (56, { id=56; title="Charlie and the Chocolate Factory"; author="Roald Dahl"; description=""; rentalPrice=10; available=true }),
    (57, { id=57; title="Charlie and the Great Glass Elevator"; author="Roald Dahl"; description=""; rentalPrice=10; available=true }),
    (58, { id=58; title="Going Solo"; author="Roald Dahl"; description=""; rentalPrice=10; available=true }),
    (59, { id=59; title="Dahlmanac Fun facts and Jokes"; author="Roald Dahl"; description=""; rentalPrice=10; available=true }),
    (60, { id=60; title="Five Get Into A Fix"; author="Enid Blyton"; description=""; rentalPrice=10; available=true }),
    (61, { id=61; title="Five On A Hike Together"; author="Enid Blyton"; description=""; rentalPrice=10; available=true }),
    (62, { id=62; title="Five Go Off In A Caravan"; author="Enid Blyton"; description=""; rentalPrice=10; available=true }),
    (63, { id=63; title="Five Fall Into Adventure"; author="Enid Blyton"; description=""; rentalPrice=10; available=true }),
    (64, { id=64; title="Professor Poopypants"; author="Dav Pilkey"; description=""; rentalPrice=10; available=true }),
    (65, { id=65; title="Bionic Booger Boy Part 2"; author="Dav Pilkey"; description=""; rentalPrice=10; available=true }),
    (66, { id=66; title="Wicked Wedgie Woman"; author="Dav Pilkey"; description=""; rentalPrice=10; available=true }),
    (67, { id=67; title="Plight Of The Purple Potty People"; author="Dav Pilkey"; description=""; rentalPrice=10; available=true }),
    (68, { id=68; title="Twinkle Digest Book no.1"; author="D.C. Thomson"; description=""; rentalPrice=10; available=true }),
    (69, { id=69; title="Twinkle Digest Book no. 63"; author="D.C. Thomson"; description=""; rentalPrice=10; available=true }),
    (70, { id=70; title="Twinkle Digest Book no. 83"; author="D.C. Thomson"; description=""; rentalPrice=10; available=true }),
    (71, { id=71; title="Twinkle Digest Book no. 84"; author="D.C. Thomson"; description=""; rentalPrice=10; available=true }),
    (72, { id=72; title="Twinkle Digest Book no. 104"; author="D.C. Thomson"; description=""; rentalPrice=10; available=true }),
    (73, { id=73; title="Grandma's Bag Of Stories"; author="Sudha Murty"; description=""; rentalPrice=10; available=true }),
    (74, { id=74; title="How I Taught My Grandmother To Read And other stories"; author="Sudha Murty"; description=""; rentalPrice=10; available=true }),
    (75, { id=75; title="The Daughter From A Wishing Tree"; author="Sudha Murty"; description=""; rentalPrice=10; available=true }),
    (76, { id=76; title="The Magic Of the Lost Temple"; author="Sudha Murty"; description=""; rentalPrice=10; available=true }),
    (77, { id=77; title="The Magic Of the Lost Story"; author="Sudha Murty"; description=""; rentalPrice=10; available=true }),
  ];

  stable var stableRentalRequests : [(Nat, RentalRequest)] = [];

  // Runtime maps loaded from stable storage
  let books = Map.fromIter<Nat, Book>(stableBooks.values());
  let rentalRequests = Map.fromIter<Nat, RentalRequest>(stableRentalRequests.values());

  // After upgrade: if SEED_BOOKS was populated by old version, merge into books map
  system func postupgrade() {
    if (SEED_BOOKS.size() > 0) {
      for ((k, v) in SEED_BOOKS.vals()) {
        if (books.get(k) == null) {
          books.add(k, v);
        };
      };
      SEED_BOOKS := [];
    };
  };

  // Save runtime maps back to stable storage before every upgrade
  system func preupgrade() {
    stableBooks := books.entries().toArray();
    stableRentalRequests := rentalRequests.entries().toArray();
  };

  func verifyPassword(password : Text) : Bool {
    switch (adminPassword) {
      case (null) { false };
      case (?stored) { stored == password };
    };
  };

  public query func isAdminPasswordSet() : async Bool {
    switch (adminPassword) {
      case (null) { false };
      case (?_) { true };
    };
  };

  public shared func setAdminPassword(newPassword : Text, currentPassword : Text) : async Bool {
    switch (adminPassword) {
      case (null) {
        adminPassword := ?newPassword;
        true;
      };
      case (?stored) {
        if (stored == currentPassword) {
          adminPassword := ?newPassword;
          true;
        } else {
          false;
        };
      };
    };
  };

  public query func checkAdminPassword(password : Text) : async Bool {
    verifyPassword(password);
  };

  public query func getRentalRequestsWithPassword(password : Text) : async [RentalRequest] {
    if (not verifyPassword(password)) {
      Runtime.trap("Unauthorized: incorrect password");
    };
    rentalRequests.values().toArray().sort();
  };

  public shared func updateRequestStatusWithPassword(password : Text, requestId : Nat, newStatus : RentalRequestStatus) : async () {
    if (not verifyPassword(password)) {
      Runtime.trap("Unauthorized: incorrect password");
    };
    switch (rentalRequests.get(requestId)) {
      case (null) { Runtime.trap("Request not found") };
      case (?request) {
        let updated : RentalRequest = {
          id = request.id;
          bookId = request.bookId;
          borrowerName = request.borrowerName;
          borrowerEmail = request.borrowerEmail;
          submittedAt = request.submittedAt;
          status = newStatus;
        };
        rentalRequests.add(requestId, updated);
      };
    };
  };

  public shared func addBook(password : Text, title : Text, author : Text, description : Text) : async Nat {
    if (not verifyPassword(password)) {
      Runtime.trap("Unauthorized: incorrect password");
    };
    let id = nextBookId;
    nextBookId += 1;
    let newBook : Book = { id; title; author; description; rentalPrice=10; available=true };
    books.add(id, newBook);
    id;
  };

  public shared func updateBook(password : Text, id : Nat, title : Text, author : Text, description : Text, available : Bool) : async Bool {
    if (not verifyPassword(password)) {
      Runtime.trap("Unauthorized: incorrect password");
    };
    switch (books.get(id)) {
      case (null) { false };
      case (?book) {
        books.add(id, { id=book.id; title; author; description; rentalPrice=book.rentalPrice; available });
        true;
      };
    };
  };

  public shared func removeBook(password : Text, id : Nat) : async Bool {
    if (not verifyPassword(password)) {
      Runtime.trap("Unauthorized: incorrect password");
    };
    switch (books.get(id)) {
      case (null) { false };
      case (?_) {
        ignore books.remove(id);
        true;
      };
    };
  };

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

  public query func getBooks() : async [Book] {
    books.values().toArray().sort();
  };

  public shared ({ caller }) func submitRentalRequest(borrowerName : Text, borrowerEmail : Text, bookId : Nat) : async Nat {
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
};
