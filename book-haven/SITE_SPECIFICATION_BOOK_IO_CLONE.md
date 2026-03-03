# Complete Site Specification - Book Marketplace Platform (Non-Crypto Version)

> Based on Book.io analysis - A complete digital book marketplace without blockchain/crypto integrations

---

## Table of Contents
1. [Core Pages](#core-pages)
2. [User Pages](#user-pages)
3. [Admin Pages](#admin-pages)
4. [Cart & Checkout](#cart--checkout)
5. [Notifications System](#notifications-system)
6. [Components & Modules](#components--modules)
7. [Database Schema](#database-schema)
8. [API Endpoints](#api-endpoints)

---

## 1. CORE PAGES

### 1.1 HOME PAGE (`/`)

**Layout Sections:**

```
┌─────────────────────────────────────────────────────────────┐
│                         HEADER                               │
│  [Logo]  [Search Bar]  [Home|Store|Authors|About]  [Login]  │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    FEATURED BOOK SLIDER                      │
│  Full-width carousel with featured books                    │
│  - Book cover image (left)                                   │
│  - Book details, title, author, description (right)         │
│  - "View Details" CTA button                                │
│  - Auto-play with navigation arrows                         │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                   RECENT RELEASES                            │
│  Section title: "Recent Releases – Available Now!"          │
│  Subtitle: "These books just got released, get one..."      │
│  Grid of 4 books (compact card layout)                      │
│  - Cover image                                              │
│  - Title, author                                            │
│  - Status badge (Available/Sold Out)                        │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                      WHAT IS [SITE]?                         │
│  Split section with video thumbnail                         │
│  - Headline: "The Future of Books"                          │
│  - Description text                                         │
│  - "Watch Video" link                                       │
└─────────────────────────────────────────────────────────────┐
┌─────────────────────────────────────────────────────────────┐
│                 BESTSELLER RANKINGS                          │
│  Title: "Bestseller Rankings – Weekly Sales"               │
│  Table with columns:                                         │
│  | # | Book | Price | 24Hr Sales | All Time Sales | Market │
│  Top 10 books with expandable mobile view                   │
│  Stats summary: Total Titles, Total Books, Weekly Volume    │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    FEATURED AUTHOR                          │
│  Author photo with bio section                              │
│  - Author name, photo                                       │
│  - Bio text                                                 │
│  - "View Books" button                                      │
└─────────────────────────────────────────────────────────────┐
┌─────────────────────────────────────────────────────────────┐
│                    EDITOR'S PICKS                           │
│  2-column layout with detailed book cards                   │
│  - Cover image                                              │
│  - "See Buying Options" button                              │
│  - Title, author                                            │
│  - Description with "Read more" expander                    │
└─────────────────────────────────────────────────────────────┐
┌─────────────────────────────────────────────────────────────┐
│                   TRENDING AUTHORS                          │
│  4-column compact grid                                      │
│  Author's recent books with covers                          │
└─────────────────────────────────────────────────────────────┐
┌─────────────────────────────────────────────────────────────┐
│                      SPOTLIGHT                              │
│  "Media we think are cool..."                               │
│  5-column grid of featured books                            │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                 GET THE READING APP                         │
│  Mobile app promotion section                               │
│  - iOS App Store button                                     │
│  - Google Play Store button                                 │
│  - Phone/image mockup                                       │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│              WORDS FROM PARTNERS                            │
│  2-column testimonial section                               │
│  Partner logo, quote, person info                           │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    NEWSLETTER                               │
│  Email signup form                                          │
│  "Stay updated..."                                          │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                         FOOTER                               │
│  [Helpful Links] [For Authors] [Social] [Legal]            │
│  Copyright © 2020-2026                                       │
└─────────────────────────────────────────────────────────────┘
```

---

### 1.2 STORE PAGE (`/store` or `/books`)

**Features:**
- Grid/list view toggle
- Filter sidebar:
  - Format (eBook, Audiobook, Both)
  - Genre/Category
  - Author
  - Publisher
  - Price Range
  - Language
  - Rating
  - Availability (In Stock, Pre-order)
- Sort options:
  - Newest First
  - Bestselling
  - Price: Low to High
  - Price: High to Low
  - Title A-Z
  - Rating
- Pagination (24, 48, 96 per page)
- Book cards showing:
  - Cover image
  - Title
  - Author
  - Format badge
  - Price
  - Rating
  - "Add to Cart" / "View Details"

---

### 1.3 BOOK DETAIL PAGE (`/book/{slug}`)

**Layout:**

```
┌───────────────────────────────────────────────────────────────┐
│  BREADCRUMB: Home > Store > Fiction > [Book Title]           │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌─────────────────────────────────────┐  │
│  │              │  │  Book Title                          │  │
│  │   BOOK       │  │  Subtitle (if any)                   │  │
│  │   COVER      │  │  by Author Name                      │  │
│  │   IMAGE      │  │  [★★★★☆] 4.5 (123 reviews)          │  │
│  │              │  │                                       │  │
│  │              │  │  Format: eBook | Audiobook           │  │
│  │  [Zoom icon] │  │  Publisher: Publisher Name           │  │
│  │              │  │  Release Date: January 15, 2024      │  │
│  │              │  │  Pages: 350 | Duration: 5h 23m       │  │
│  │              │  │  Language: English                   │  │
│  └──────────────┘  │                                       │  │
│                    │  PRICE: $12.99                         │  │
│                    │  [ Add to Cart ] [ Buy Now ]          │  │
│                    │  [ ♡ Add to Wishlist ]               │  │
│                    │  [ Share ]                            │  │
│                    └─────────────────────────────────────┘  │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  DESCRIPTION                                            │ │
│  │  Full book description with "Read more" expander       │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌──────────────────┐  ┌────────────────────────────────┐  │
│  │  PRODUCT DETAILS │  │  ABOUT THE AUTHOR              │  │
│  │  - ISBN          │  │  Author photo                   │  │
│  │  - ASIN          │  │  Author bio                     │  │
│  │  - File Size     │  │  [View All Author's Books]      │  │
│  │  - Format        │  └────────────────────────────────┘  │
│  └──────────────────┘                                        │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  SAMPLE CHAPTER                                         │ │
│  │  [Read First Chapter Free] - Opens in reader           │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  CUSTOMER REVIEWS                                       │ │
│  │  Overall: ★★★★☆ 4.5 (123 reviews)                     │ │
│  │  Rating breakdown [★★★★★ 80] [★★★★☆ 20] ...          │ │
│  │                                                         │ │
│  │  Review 1:                                              │ │
│  │  ★★★★★ "Amazing book!" - User Name                     │ │
│  │  "This book was incredible..."                          │ │
│  │  Helpful: [✔ Yes] [✘ No] (12 of 15)                    │ │
│  │                                                         │ │
│  │  [Write a Review] [See All Reviews]                    │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  RELATED BOOKS                                          │ │
│  │  [Grid of similar books]                                │ │
│  └─────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

---

### 1.4 AUTHORS PAGE (`/authors`)

**Features:**
- Search authors by name
- Filter by genre, nationality
- Sort by: A-Z, Z-A, Most Books, Bestselling
- Author cards:
  - Author photo
  - Name
  - Genre(s)
  - Book count
  - "View Books" button
- Pagination

---

### 1.5 AUTHOR DETAIL PAGE (`/author/{slug}`)

**Sections:**
- Author header:
  - Photo
  - Name
  - Bio
  - Social links
  - Website
- Books by author (grid)
- Biography section (expandable)
- Appearances/Events (if any)

---

### 1.6 PUBLISHERS PAGE (`/publishers`)

Similar to authors page with:
- Publisher logos
- Publisher names
- Book count
- "View Books" button

---

### 1.7 ABOUT PAGE (`/about`)

**Sections:**
- Hero: "About [Site Name]"
- Our Mission
- Our Story
- Team section with photos and bios
- Partners/Investors logos
- Contact information
- FAQ section

---

### 1.8 FAQ PAGE (`/faq`)

**Categories:**
- General Questions
- For Readers
- For Authors
- For Publishers
- Technical Support
- Billing & Payments

Accordion-style Q&A items.

---

### 1.9 CONTACT PAGE (`/contact`)

**Form fields:**
- Name
- Email
- Subject (dropdown: General, Support, Partnership, Press, Other)
- Message
- Attachment (optional)

**Contact info:**
- Email address
- Business address
- Social media links

---

### 1.10 SEARCH RESULTS PAGE (`/search`)

**Layout:**
- Search bar at top
- "X results for 'query'"
- Filters sidebar (same as store)
- Results grid (books, authors, publishers)
- "Did you mean..." suggestions
- Recent searches

---

## 2. USER PAGES

### 2.1 LOGIN PAGE (`/login`)

**Form:**
- Email/Username
- Password
- [Remember me] checkbox
- [Login] button
- "Forgot password?" link
- "Don't have an account? Sign up"

**Social login options:**
- Google
- Apple
- Facebook (optional)

---

### 2.2 SIGN UP PAGE (`/register`)

**Form:**
- First Name
- Last Name
- Email
- Password (with strength indicator)
- Confirm Password
- [I agree to Terms of Service] checkbox
- [I want to receive newsletters] checkbox
- [Create Account] button

**Email verification flow:**
1. User submits form
2. Verification email sent
3. User clicks link
4. Account activated, redirect to welcome

---

### 2.3 FORGOT PASSWORD PAGE (`/forgot-password`)

**Form:**
- Email address
- [Send Reset Link] button
- "Remember your password? Login"

**Reset flow:**
1. User enters email
2. Reset email with token sent
3. User clicks link → `/reset-password/{token}`
4. New password form

---

### 2.4 MY LIBRARY / BOOKSHELF (`/library`)

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│  MY LIBRARY                                                 │
├─────────────────────────────────────────────────────────────┤
│  [All Books] [eBooks] [Audiobooks] [Archived] [Wishlist]  │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐  │
│  │  [Search my library...]                              │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Book 1                           [Read] [⋮]         │    │
│  │  Title, Author                                    [✕]│    │
│  │  Progress: ████████░░ 80%                           │    │
│  │  Last read: 2 hours ago                            │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Book 2                           [Read] [⋮]         │    │
│  │  Title, Author                                    [✕]│    │
│  │  Progress: ██░░░░░░░░ 20%                            │    │
│  │  Last read: Yesterday                              │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Grid/list view toggle
- Sort by: Recent, Title, Author, Progress, Date Added
- Filter by: Format, Genre, Finished, Unfinished
- Book menu: [Read] [Archive] [Remove] [Add to Wishlist]
- Reading progress tracking
- Last read timestamps

---

### 2.5 READER PAGE (`/read/{bookId}`)

**Desktop Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│  [← Library]  Book Title                     [⋮ Settings]   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐  ┌──────────────────────────────────┐  │
│  │                 │  │                                  │  │
│  │                 │  │     Book Content                 │  │
│  │   CHAPTER      │  │                                  │  │
│  │   NAVIGATION   │  │     (Scrollable)                  │  │
│  │                 │  │                                  │  │
│  │  Chapter 1     │  │                                  │  │
│  │  Chapter 2     │  │                                  │  │
│  │  Chapter 3     │  │                                  │  │
│  │  ...           │  │                                  │  │
│  │                 │  │                                  │  │
│  └─────────────────┘  └──────────────────────────────────┘  │
│                                                               │
│  [-] Font Size [A+]                    [◀ ▶ Progress 85%]   │
└─────────────────────────────────────────────────────────────┘
```

**Reader Features:**
- Font size adjustment
- Font family selection
- Theme: Light, Dark, Sepia
- Line height adjustment
- Margin adjustment
- Fullscreen mode
- Chapter navigation
- Bookmark chapter
- Highlight text (with colors)
- Add notes
- Search within book
- Table of contents
- Reading progress bar
- Page/chapter jump
- Auto-scroll (speed adjustable)
- Night mode
- Sync reading position across devices

---

### 2.6 USER PROFILE PAGE (`/profile`)

**Sections:**

```
┌─────────────────────────────────────────────────────────────┐
│  MY PROFILE                                                 │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────────────────────┐  │
│  │                 │  │  Account Settings                │  │
│  │   PROFILE       │  │  - Email                         │  │
│  │   PHOTO         │  │  - Username                      │  │
│  │                 │  │  - Password (Change)             │  │
│  │  [Change Photo] │  │  - Phone (optional)              │  │
│  └─────────────────┘  │  - Date of Birth                 │  │
│                       │  - Country                        │  │
│                       └─────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Personal Information                                 │  │
│  │  - First Name                                         │  │
│  │  - Last Name                                          │  │
│  │  - Bio                                                │  │
│  │  - Website                                            │  │
│  │  - Social Links (Twitter, Facebook, Instagram)        │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Reading Preferences                                   │  │
│  │  - Favorite Genres (multi-select)                      │  │
│  │  - Preferred Format (eBook/Audiobook/Both)             │  │
│  │  - Favorite Authors                                    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

### 2.7 USER SETTINGS PAGE (`/settings`)

**Tabs:**

1. **Account**
   - Email
   - Password
   - Two-Factor Authentication (toggle)

2. **Privacy**
   - Profile visibility (Public/Private)
   - Show reading activity
   - Show library

3. **Notifications** (see section 5)

4. **Devices**
   - Linked devices list
   - Sign out all devices

5. **Payment Methods**
   - Credit cards
   - PayPal
   - Other payment methods

6. **Billing History**
   - Invoice list
   - Download PDF

7. **Close Account**
   - Deactivate option
   - Delete account option

---

### 2.8 WISHLIST PAGE (`/wishlist`)

**Features:**
- Grid view of wished books
- "Add to Cart" button
- "Remove from Wishlist" button
- Share wishlist (generate unique URL)
- Sort options
- Price drop alerts (notify when price changes)

---

## 3. ADMIN PAGES

### 3.1 ADMIN DASHBOARD (`/admin`)

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] ADMIN DASHBOARD                    [Admin] [Logout] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │            │  │            │  │            │            │
│  │  1,234     │  │   $45,678  │  │    567     │            │
│  │  Total     │  │   Revenue  │  │   New      │            │
│  │  Users     │  │   (MTD)    │  │   Orders   │            │
│  │            │  │            │  │            │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Sales Chart (Last 30 Days)                          │    │
│  │  [Line/Bar chart]                                    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌──────────────────────┐  ┌──────────────────────────┐    │
│  │  Top Selling Books   │  │  Recent Orders           │    │
│  │  1. Book Title       │  │  Order #12345            │    │
│  │  2. Book Title       │  │  Order #12344            │    │
│  │  3. Book Title       │  │  ...                     │    │
│  └──────────────────────┘  └──────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

### 3.2 ADMIN - BOOKS MANAGEMENT (`/admin/books`)

**Features:**
- Data table with columns:
  - Cover thumbnail
  - Title
  - Author
  - Publisher
  - Price
  - Format
  - Status (Published/Draft/Archived)
  - Sales
  - Date Added
  - Actions ([Edit] [Delete] [View])

**Actions:**
- Add new book
- Bulk actions (Delete, Change Status, Change Category)
- Export CSV
- Import CSV

---

### 3.3 ADMIN - ADD/EDIT BOOK (`/admin/books/new` or `/admin/books/{id}/edit`)

**Form Sections:**

1. **Basic Information**
   - Title
   - Subtitle
   - Author (search/dropdown)
   - Publisher (search/dropdown)
   - ISBN
   - ASIN
   - Release Date
   - Language

2. **Pricing**
   - Base Price
   - Sale Price (optional)
   - Sale Start/End Dates
   - Currency

3. **Formats**
   - eBook (checkbox) → Upload EPUB/MOBI/PDF
   - Audiobook (checkbox) → Upload MP3 files
   - File size limit

4. **Categories & Tags**
   - Primary Genre
   - Secondary Genres
   - Tags (multi-select)

5. **Book Details**
   - Page Count
   - Duration (for audiobook)
   - Narrator (for audiobook)

6. **Description**
   - Short Description (150 chars)
   - Full Description (rich text editor)

7. **Media**
   - Cover Image Upload (512x512 recommended)
   - Additional Images
   - Banner Image

8. **Sample Chapter**
   - Upload sample PDF/EPUB
   - Or select sample chapters

9. **SEO**
   - Meta Title
   - Meta Description
   - URL Slug

10. **Inventory**
    - Stock Status (Unlimited/Limited)
    - Stock Quantity (if limited)

11. **Visibility**
    - Status (Published/Draft)
    - Featured Book (checkbox)
    - Display on Homepage

---

### 3.4 ADMIN - AUTHORS MANAGEMENT (`/admin/authors`)

**List View:**
- Photo
- Name
- Book Count
- Total Sales
- Actions ([Edit] [Delete])

**Add/Edit Author:**
- Name
- Photo Upload
- Bio (rich text)
- Website
- Social Links (Twitter, Facebook, Instagram, LinkedIn)
- Featured Author (checkbox)

---

### 3.5 ADMIN - PUBLISHERS MANAGEMENT (`/admin/publishers`)

Similar to authors, with:
- Publisher Name
- Logo Upload
- Description
- Website
- Contact Email
- Address

---

### 3.6 ADMIN - USERS MANAGEMENT (`/admin/users`)

**List View:**
- Avatar
- Name
- Email
- Role (User/Author/Admin)
- Status (Active/Suspended)
- Join Date
- Total Spent
- Actions ([Edit] [Suspend] [Delete] [View Orders])

**Add/Edit User:**
- Name
- Email
- Role (dropdown)
- Status (Active/Suspended)
- Password (reset option)
- Linked Accounts (Google, Apple)

---

### 3.7 ADMIN - ORDERS MANAGEMENT (`/admin/orders`)

**List View:**
- Order ID
- Customer
- Date
- Items
- Total
- Status (Pending/Completed/Refunded)
- Actions ([View] [Edit] [Refund])

**Order Detail Page:**
- Order Information (ID, Date, Status)
- Customer Details
- Items List
- Payment Information
- Shipping (if physical)
- Invoice (Download PDF)
- Status Change

---

### 3.8 ADMIN - COUPONS & PROMOTIONS (`/admin/coupons`)

**List:**
- Coupon Code
- Discount Type (%/Fixed)
- Value
- Usage Count/Limit
- Valid From/To
- Status

**Add/Edit Coupon:**
- Coupon Code
- Discount Type
- Discount Value
- Minimum Purchase
- Usage Limit (per coupon, per user)
- Valid Dates
- Applicable Products (All/Selected)

---

### 3.9 ADMIN - ANALYTICS (`/admin/analytics`)

**Dashboard with:**

1. **Overview**
   - Revenue chart (daily/weekly/monthly)
   - Sales chart
   - Visitors chart
   - Conversion rate

2. **Products**
   - Bestselling books
   - Top categories
   - Top authors

3. **Customers**
   - New customers
   - Top customers by spending
   - Customer retention

4. **Marketing**
   - Traffic sources
   - Conversion by source
   - Newsletter stats

5. **Export**
   - Export reports (PDF/CSV)

---

### 3.10 ADMIN - CONTENT MANAGEMENT (`/admin/content`)

**Pages Management:**
- List of static pages (About, FAQ, Contact, etc.)
- Edit page content (WYSIWYG editor)
- Page title, slug, meta tags
- Publish/Unpublish

**Blog Management (optional):**
- Posts list
- Add/Edit posts
- Categories
- Tags
- Featured image

---

### 3.11 ADMIN - SETTINGS (`/admin/settings`)

**Tabs:**

1. **General**
   - Site Name
   - Site Logo
   - Favicon
   - Site Description
   - Contact Email
   - Timezone
   - Currency

2. **Payment**
   - Payment Gateways (Stripe, PayPal, etc.)
   - Bank Details
   - Tax Settings

3. **Email**
   - SMTP Settings
   - Email Templates
   - Sender Name/Email

4. **Social**
   - Social Media Links
   - Share Settings

5. **SEO**
   - Default Meta Title
   - Default Meta Description
   - Google Analytics ID
   - Google Tag Manager ID

6. **Legal**
   - Terms of Service
   - Privacy Policy
   - Cookie Policy

7. **API**
   - API Keys
   - Webhook Settings

---

### 3.12 ADMIN - NOTIFICATIONS (`/admin/notifications`)

**Send Notification:**
- Target (All Users / Specific Users / Segments)
- Type (Email / In-App / Push)
- Subject
- Message
- Send Now / Schedule

**Notification History:**
- List of sent notifications
- Open rate
- Click rate

---

### 3.13 ADMIN - REVIEWS MANAGEMENT (`/admin/reviews`)

**List View:**
- Book
- Reviewer
- Rating
- Comment
- Date
- Status (Approved/Pending/Flagged)
- Actions ([Approve] [Delete] [Flag])

---

## 4. CART & CHECKOUT

### 4.1 SHOPPING CART (`/cart`)

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│  SHOPPING CART (3 items)                      [Continue Shopping]
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Book 1                                    [Remove]   │  │
│  │  by Author Name                                    │  │
│  │  Format: eBook                                      │  │
│  │  Price: $12.99                                      │  │
│  │                                          [$12.99]     │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Book 2                                    [Remove]   │  │
│  │  by Author Name                                    │  │
│  │  Format: Audiobook                                  │  │
│  │  Price: $15.99                                      │  │
│  │                                           [$15.99]     │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Book 3                                    [Remove]   │  │
│  │  by Author Name                                    │  │
│  │  Format: eBook                                      │  │
│  │  Price: $9.99                                       │  │
│  │                                           [$9.99]      │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Coupon Code: [Apply Coupon]                        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Subtotal: $38.97                                    │    │
│  │  Discount: -$5.00                                    │    │
│  │  Tax: $3.12                                          │    │
│  │  ────────────────                                    │    │
│  │  Total: $37.09                                       │    │
│  │                       [Proceed to Checkout]          │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

### 4.2 CHECKOUT PAGE (`/checkout`)

**Steps:**

**Step 1: Account**
- Already have an account? [Login]
- Or continue as guest:
  - Email
  - First Name
  - Last Name

**Step 2: Payment**
- Saved Payment Methods (if logged in)
- Or Add New:
  - Card Number
  - Expiry Date
  - CVV
  - Name on Card
  - [Save for future purchases]

**Step 3: Review**
- Order Summary
- Items List
- Billing Address
- Payment Method
- Apply Coupon Code
- [Place Order] button

**Step 4: Confirmation**
- Thank You message
- Order Number
- Order Summary
- "View in My Library" button
- "Continue Shopping" button
- Email confirmation sent

---

### 4.3 ORDER SUCCESS PAGE (`/order/success`)

- Order confirmation
- Order details summary
- Link to library
- Share on social (optional)

---

### 4.4 ORDER FAILED PAGE (`/order/failed`)

- Error message
- Retry payment button
- Contact support link

---

## 5. NOTIFICATIONS SYSTEM

### 5.1 NOTIFICATION TYPES

**Email Notifications:**

| Notification | Default | Description |
|-------------|---------|-------------|
| Welcome Email | On | Sent after registration |
| Email Verification | On | Verification link |
| Password Reset | On | Reset link |
| Order Confirmation | On | After purchase |
| Payment Receipt | On | Payment successful |
| Refund Confirmation | On | Refund processed |
| New Release Alert | Off | New books from followed authors |
| Price Drop Alert | Off | Wishlist item price reduced |
| Reading Reminder | Off | "Continue reading" nudge |
| Weekly Digest | Off | Weekly summary |
| Newsletter | Off | Marketing emails |

**In-App Notifications:**

- New releases
- Price drops
- Reading reminders
- Order updates
- Review requests
- Platform announcements

**Push Notifications (Mobile):**

- New releases
- Price drops
- Reading reminders
- Order updates

---

### 5.2 USER NOTIFICATION PREFERENCES (`/settings/notifications`)

```
┌─────────────────────────────────────────────────────────────┐
│  NOTIFICATION PREFERENCES                                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  EMAIL NOTIFICATIONS                                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  [✓] Order confirmations                              │  │
│  │  [✓] Password resets                                  │  │
│  │  [✓] Security alerts                                  │  │
│  │  [ ] New releases from followed authors               │  │
│  │  [ ] Price drop alerts                                │  │
│  │  [ ] Weekly reading digest                            │  │
│  │  [ ] Newsletter and promotions                        │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  PUSH NOTIFICATIONS                                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  [✓] New releases                                     │  │
│  │  [✓] Price drops                                     │  │
│  │  [ ] Reading reminders                                │  │
│  │  [ ] Order updates                                    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  [Save Preferences]                                          │
└─────────────────────────────────────────────────────────────┘
```

---

### 5.3 IN-APP NOTIFICATIONS CENTER

**Bell Icon in Header** → Opens dropdown:

```
┌─────────────────────────────────────────────────────────────┐
│  NOTIFICATIONS                                [Mark all read] │
├─────────────────────────────────────────────────────────────┤
│  ● New Release: "Book Title" by Author Name         Today    │
│  ● Price Drop: "Book Title" - now $9.99          Yesterday  │
│  ○ Continue reading "Book Title"                 2 days ago  │
│  ○ Your order #12345 has shipped                 3 days ago  │
│  ○ Welcome to [Site]!                            1 week ago  │
│                                                               │
│  [View All Notifications]                                    │
└─────────────────────────────────────────────────────────────┘
```

**Full Notifications Page (`/notifications`):**
- Filter by: All, Unread, Orders, Releases, Price Drops
- Pagination
- Mark individual as read
- Delete notification
- Notification settings link

---

## 6. COMPONENTS & MODULES

### 6.1 HEADER COMPONENT

**Desktop:**
```
┌─────────────────────────────────────────────────────────────┐
│ [Logo]  [Search...]    Home | Store | Authors | About      │
│                                         [Login] [🔔] [🛒]    │
└─────────────────────────────────────────────────────────────┘
```

**Mobile:**
- Hamburger menu
- Collapsible navigation
- Search bar (expandable)

---

### 6.2 BOOK CARD COMPONENT

**Compact Version:**
```
┌─────────────┐
│             │  Title
│   Cover     │  by Author
│   Image     │  [Format Badge]
│             │  $12.99
└─────────────┘
```

**Detailed Version:**
```
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────┐                                                │
│  │         │  Book Title                                    │
│  │ Cover   │  by Author Name                                │
│  │ Image   │  ★★★★☆ 4.5 (123 reviews)                      │
│  │         │  Format: eBook | Audiobook                     │
│  └─────────┘  Publisher Name | Release Date                 │
│               Description excerpt with "Read more"...       │
│               Price: $12.99                                 │
│               [Add to Cart] [Add to Wishlist]               │
└─────────────────────────────────────────────────────────────┘
```

---

### 6.3 SEARCH COMPONENT

**Basic:**
```
┌──────────────────────────────────┐
│  🔍  Search books...     [Search]│
└──────────────────────────────────┘
```

**Advanced (with autocomplete):**
- Real-time suggestions
- Book covers in suggestions
- Categories (Books, Authors, Publishers)
- Recent searches
- "Did you mean..."

---

### 6.4 PAGINATION COMPONENT

```
┌─────────────────────────────────────────────────────────────┐
│  Showing 1-24 of 156 results                                │
│                                                               │
│  [◀ Previous]  [1] [2] [3] ... [7]  [Next ▶]                │
│                                                               │
│  Show per page: [24 ▼]                                      │
└─────────────────────────────────────────────────────────────┘
```

---

### 6.5 RATING COMPONENT

**Display:**
- Stars: ★★★★☆
- Numeric: 4.5
- Count: (123 reviews)

**Input (for reviews):**
- Interactive stars
- Hover effect
- Click to set rating

---

### 6.6 MODAL COMPONENT

**Types:**
- Quick View (book details)
- Image Zoom
- Video Player
- Confirmation Dialogs
- Forms (Login, Signup)

---

### 6.7 TOAST NOTIFICATIONS

**Types:**
- Success (green checkmark)
- Error (red X)
- Warning (yellow triangle)
- Info (blue i)

**Examples:**
- "Added to cart!"
- "Coupon applied!"
- "Payment successful!"

---

### 6.8 FOOTER COMPONENT

```
┌─────────────────────────────────────────────────────────────┐
│  Helpful Links          For Authors             Social       │
│  - About Us             - For Authors            Twitter     │
│  - Contact              - For Publishers         Discord     │
│  - FAQ                 - FAQ                    Facebook    │
│  - Terms               - Creator Portal                     │
│  - Privacy                                                   │
│                         Subscribe to our newsletter         │
│                         [Email] [Subscribe]                 │
│                                                               │
│  Copyright © 2020-2026 [Site]. All Rights Reserved          │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. DATABASE SCHEMA

### 7.1 USERS TABLE
```sql
users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url VARCHAR(500),
  bio TEXT,
  date_of_birth DATE,
  country VARCHAR(100),
  role ENUM('user', 'author', 'admin') DEFAULT 'user',
  status ENUM('active', 'suspended', 'pending') DEFAULT 'pending',
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP
)
```

### 7.2 BOOKS TABLE
```sql
books (
  id UUID PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  subtitle VARCHAR(500),
  author_id UUID REFERENCES authors(id),
  publisher_id UUID REFERENCES publishers(id),
  isbn VARCHAR(20),
  asin VARCHAR(20),
  description TEXT,
  short_description VARCHAR(500),
  cover_image_url VARCHAR(500),
  release_date DATE,
  language VARCHAR(10) DEFAULT 'en',
  page_count INT,
  duration_minutes INT,
  narrator VARCHAR(255),

  -- Pricing
  price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2),
  sale_start_date DATE,
  sale_end_date DATE,
  currency VARCHAR(3) DEFAULT 'USD',

  -- Formats
  has_ebook BOOLEAN DEFAULT FALSE,
  has_audiobook BOOLEAN DEFAULT FALSE,
  ebook_file_url VARCHAR(500),
  audiobook_file_url VARCHAR(500),
  sample_file_url VARCHAR(500),

  -- Categories
  primary_genre_id UUID REFERENCES genres(id),
  tags TEXT[],

  -- Inventory
  stock_status ENUM('unlimited', 'limited', 'out_of_stock') DEFAULT 'unlimited',
  stock_quantity INT DEFAULT 0,

  -- Status
  status ENUM('published', 'draft', 'archived') DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT FALSE,

  -- SEO
  meta_title VARCHAR(500),
  meta_description TEXT,

  -- Stats
  total_sales INT DEFAULT 0,
  total_revenue DECIMAL(15,2) DEFAULT 0,
  average_rating DECIMAL(3,2),
  review_count INT DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### 7.3 AUTHORS TABLE
```sql
authors (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  photo_url VARCHAR(500),
  bio TEXT,
  website VARCHAR(500),
  twitter_handle VARCHAR(100),
  facebook_url VARCHAR(500),
  instagram_handle VARCHAR(100),
  linkedin_url VARCHAR(500),
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
)
```

### 7.4 PUBLISHERS TABLE
```sql
publishers (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  logo_url VARCHAR(500),
  description TEXT,
  website VARCHAR(500),
  contact_email VARCHAR(255),
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)
```

### 7.5 GENRES TABLE
```sql
genres (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  parent_id UUID REFERENCES genres(id),
  description TEXT,
  display_order INT DEFAULT 0
)
```

### 7.6 ORDERS TABLE
```sql
orders (
  id UUID PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  guest_email VARCHAR(255),
  status ENUM('pending', 'completed', 'refunded', 'failed') DEFAULT 'pending',

  -- Payment
  payment_method VARCHAR(50),
  payment_id VARCHAR(255),
  subtotal DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',

  -- Coupon
  coupon_id UUID REFERENCES coupons(id),

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
)
```

### 7.7 ORDER_ITEMS TABLE
```sql
order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  book_id UUID REFERENCES books(id),
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD'
)
```

### 7.8 USER_BOOKS TABLE (Library)
```sql
user_books (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  book_id UUID REFERENCES books(id),
  purchase_date TIMESTAMP DEFAULT NOW(),
  purchase_price DECIMAL(10,2),

  -- Reading Progress
  reading_progress INT DEFAULT 0, -- Percentage
  current_chapter INT,
  last_read_at TIMESTAMP,
  is_finished BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE
)
```

### 7.9 WISHLIST TABLE
```sql
wishlist (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  book_id UUID REFERENCES books(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, book_id)
)
```

### 7.10 REVIEWS TABLE
```sql
reviews (
  id UUID PRIMARY KEY,
  book_id UUID REFERENCES books(id),
  user_id UUID REFERENCES users(id),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  status ENUM('pending', 'approved', 'flagged') DEFAULT 'pending',
  helpful_count INT DEFAULT 0,
  not_helpful_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### 7.11 COUPONS TABLE
```sql
coupons (
  id UUID PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type ENUM('percentage', 'fixed') NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  min_purchase DECIMAL(10,2) DEFAULT 0,
  usage_limit_per_coupon INT,
  usage_limit_per_user INT DEFAULT 1,
  usage_count INT DEFAULT 0,
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  applicable_to ENUM('all', 'selected', 'categories') DEFAULT 'all',
  applicable_book_ids UUID[],
  status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
)
```

### 7.12 NOTIFICATIONS TABLE
```sql
notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  action_url VARCHAR(500),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
)
```

### 7.13 NOTIFICATION_PREFERENCES TABLE
```sql
notification_preferences (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) UNIQUE,
  email_order_confirmations BOOLEAN DEFAULT TRUE,
  email_password_resets BOOLEAN DEFAULT TRUE,
  email_security_alerts BOOLEAN DEFAULT TRUE,
  email_new_releases BOOLEAN DEFAULT FALSE,
  email_price_drops BOOLEAN DEFAULT FALSE,
  email_weekly_digest BOOLEAN DEFAULT FALSE,
  email_newsletter BOOLEAN DEFAULT FALSE,
  push_new_releases BOOLEAN DEFAULT TRUE,
  push_price_drops BOOLEAN DEFAULT TRUE,
  push_reading_reminders BOOLEAN DEFAULT FALSE,
  push_order_updates BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### 7.14 READING_SESSIONS TABLE (Analytics)
```sql
reading_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  book_id UUID REFERENCES books(id),
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  pages_read INT,
  duration_seconds INT,
  device_type VARCHAR(50),
  device_info TEXT
)
```

---

## 8. API ENDPOINTS

### 8.1 AUTHENTICATION

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/verify-email
POST   /api/auth/refresh-token
POST   /api/auth/social/login
```

### 8.2 USERS

```
GET    /api/users/me
PUT    /api/users/me
DELETE /api/users/me
GET    /api/users/me/library
GET    /api/users/me/wishlist
POST   /api/users/me/wishlist/:bookId
DELETE /api/users/me/wishlist/:bookId
GET    /api/users/me/orders
GET    /api/users/me/reading-progress
PUT    /api/users/me/reading-progress/:bookId
GET    /api/users/me/notifications
PUT    /api/users/me/notifications/:id/read
GET    /api/users/me/settings
PUT    /api/users/me/settings
```

### 8.3 BOOKS

```
GET    /api/books
GET    /api/books/:slug
GET    /api/books/:slug/reviews
POST   /api/books/:slug/reviews
GET    /api/books/:slug/related
GET    /api/books/featured
GET    /api/books/bestsellers
GET    /api/books/new-releases
GET    /api/books/trending
POST   /api/books/:id/read-sample
```

### 8.4 AUTHORS

```
GET    /api/authors
GET    /api/authors/:slug
GET    /api/authors/:slug/books
```

### 8.5 PUBLISHERS

```
GET    /api/publishers
GET    /api/publishers/:slug
GET    /api/publishers/:slug/books
```

### 8.6 GENRES

```
GET    /api/genres
GET    /api/genres/:slug
GET    /api/genres/:slug/books
```

### 8.7 SEARCH

```
GET    /api/search?q={query}&type={books,authors,publishers}
GET    /api/search/suggestions?q={query}
```

### 8.8 CART & CHECKOUT

```
GET    /api/cart
POST   /api/cart/items
PUT    /api/cart/items/:itemId
DELETE /api/cart/items/:itemId
POST   /api/cart/coupon
DELETE /api/cart/coupon
POST   /api/checkout
GET    /api/checkout/:orderId/status
```

### 8.9 ORDERS

```
GET    /api/orders
GET    /api/orders/:orderNumber
POST   /api/orders/:orderNumber/refund
```

### 8.10 ADMIN

```
# Dashboard
GET    /api/admin/dashboard/stats
GET    /api/admin/dashboard/sales-chart
GET    /api/admin/dashboard/visitor-chart

# Books
GET    /api/admin/books
POST   /api/admin/books
GET    /api/admin/books/:id
PUT    /api/admin/books/:id
DELETE /api/admin/books/:id
POST   /api/admin/books/:id/publish
POST   /api/admin/books/:id/unpublish

# Authors
GET    /api/admin/authors
POST   /api/admin/authors
GET    /api/admin/authors/:id
PUT    /api/admin/authors/:id
DELETE /api/admin/authors/:id

# Publishers
GET    /api/admin/publishers
POST   /api/admin/publishers
GET    /api/admin/publishers/:id
PUT    /api/admin/publishers/:id
DELETE /api/admin/publishers/:id

# Users
GET    /api/admin/users
GET    /api/admin/users/:id
PUT    /api/admin/users/:id
DELETE /api/admin/users/:id
POST   /api/admin/users/:id/suspend
POST   /api/admin/users/:id/activate

# Orders
GET    /api/admin/orders
GET    /api/admin/orders/:id
PUT    /api/admin/orders/:id/status
POST   /api/admin/orders/:id/refund

# Coupons
GET    /api/admin/coupons
POST   /api/admin/coupons
GET    /api/admin/coupons/:id
PUT    /api/admin/coupons/:id
DELETE /api/admin/coupons/:id

# Reviews
GET    /api/admin/reviews
PUT    /api/admin/reviews/:id/approve
DELETE /api/admin/reviews/:id

# Analytics
GET    /api/admin/analytics/sales
GET    /api/admin/analytics/products
GET    /api/admin/analytics/customers
GET    /api/admin/analytics/traffic

# Settings
GET    /api/admin/settings
PUT    /api/admin/settings
POST   /api/admin/settings/logo

# Notifications
POST   /api/admin/notifications/send
GET    /api/admin/notifications/history
```

---

## 9. ADDITIONAL FEATURES

### 9.1 READING READER FEATURES
- Bookmark pages
- Highlight passages
- Add notes to highlights
- Export highlights
- Dictionary lookup (select word → definition)
- Wikipedia lookup
- Translation
- Text-to-speech (for ebooks)

### 9.2 SOCIAL FEATURES (Optional)
- Follow authors
- Follow other readers
- Share reading progress
- Book clubs
- Discussion forums
- Quote sharing

### 9.3 MOBILE APP FEATURES
- Offline reading (download books)
- Sync progress across devices
- Push notifications
- Biometric login
- Dark mode support
- Adaptive reading interface

### 9.4 MARKETING FEATURES
- Email campaigns
- Promo codes
- Affiliate program
- Gift cards
- Bundle deals
- Pre-orders

---

## 10. DESIGN SYSTEM

### 10.1 COLOR PALETTE

```
Primary:    #00afe5 (Blue)
Secondary:  #00afe5 (Blue gradient)
Accent:     #ffbece (Pink)
Text:       #333333 (Dark Gray)
Text Light: #666666 (Medium Gray)
Background: #ffffff (White)
Background Alt: #f4f4f4 (Light Gray)
Success:    #28a745 (Green)
Warning:    #ffc107 (Yellow)
Danger:     #dc3545 (Red)
```

### 10.2 TYPOGRAPHY

```
Headings:  Nunito, sans-serif
Body:      Poppins, sans-serif
Monospace: 'Courier New', monospace

Font Sizes:
H1: 36px
H2: 30px
H3: 24px
H4: 20px
H5: 16px
H6: 14px
Body: 16px
Small: 13px
```

### 10.3 SPACING

```
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
xxl: 48px
```

### 10.4 BORDER RADIUS

```
sm: 4px
md: 8px
lg: 16px
full: 9999px (pill)
```

---

## 11. TECHNOLOGY STACK RECOMMENDATIONS

### Frontend
- **Framework**: Next.js 14+ (React)
- **UI Library**: shadcn/ui or Tailwind CSS
- **State Management**: Zustand or React Context
- **Forms**: React Hook Form + Zod
- **Data Fetching**: TanStack Query (React Query)

### Backend
- **Runtime**: Node.js with Bun or Node
- **Framework**: Next.js API Routes or Express/Fastify
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **File Storage**: AWS S3 or Cloudflare R2
- **Email**: Resend or SendGrid

### Additional Services
- **Payment**: Stripe
- **Analytics**: Plausible or PostHog
- **Search**: Algolia or Typesense
- **CDN**: Cloudflare
- **Hosting**: Vercel

---

## 12. LAUNCH CHECKLIST

### Pre-Launch
- [ ] All core pages implemented
- [ ] User authentication working
- [ ] Payment processing tested
- [ ] Email templates configured
- [ ] Terms of Service and Privacy Policy
- [ ] SEO meta tags configured
- [ ] Google Analytics installed
- [ ] Error pages (404, 500)
- [ ] Loading states
- [ ] Responsive design tested

### Post-Launch
- [ ] Performance monitoring
- [ ] Error tracking (Sentry)
- [ ] Backup systems
- [ ] Admin documentation
- [ ] Customer support flow
- [ ] Social media accounts

---

## END OF SPECIFICATION

This specification provides a complete blueprint for building a book marketplace platform similar to Book.io, but without blockchain/crypto integrations. All pages, features, database schemas, and API endpoints are documented for development with Lovable or any other development platform.
