# OVARC TASK

## Tech Stack
- **Vite**: Fast build tool and dev server.
- **React Router**: Dynamic routing with code splitting.
- **Tailwind CSS**: Utility-first CSS framework.


## Setup
1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Start the mock API server**:
   ```bash
   npm run mock-server
   ```
3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```  

## Environment configuration

The frontend can talk to either the real backend or the local mock API by setting `VITE_API_SOURCE`.

- `VITE_API_SOURCE=backend` – use the actual backend defined by `VITE_BACKEND_URL` (defaults to the bundled `/data` JSON files).
- `VITE_API_SOURCE=mock` – proxy requests to the mock API defined by `VITE_MOCK_SERVER_URL` (defaults to `http://localhost:4000/api`).

Create env file =>   `.env`:

```
VITE_API_SOURCE=mock
VITE_BACKEND_URL=/data
VITE_MOCK_SERVER_URL=http://localhost:4000/api
```

## Authentication

- The UI now starts in a signed-out state, so no user profile is shown until a user signs in.
- To sign in Use the mock credentials `admin@ovarc.dev / password123` when the mock server is running to authenticate.
- Signing out clears the local session.
- Only authenticated users can add inventory items or edit/delete entries within a the system.

## Features

1. **Shop Page**: 
   It has a list of cards containing the book cover page, title & author, and which stores this book is available in. The sell button should mark this as sold but keep the card on the page.

2. **Authors Page** 

   It has a simple list of authors and two CTAs to edit the name (in-line edit) or delete the author entirely. There is a CTA & a modal too for adding a new author.

3. **Books Page** 

   It has a list of books, the number of pages, and who the author is. The edit CTA is an in-line edit for the book title.

4. **Stores Page** 

   Same as the above two. The entire row is a CTA for the next page.

5. **Store Inventory Page**

   This is where the admin adds more books to the store’s
   inventory. The books should be viewable either in a list view or grouped by the author via the tab selection. The add to inventory CTA pops up a modal to select the new book and set its price.

## Project Structure
- src/pages/: Contains page components like Home, BrowseStores, Browse, BrowseAuthors, and Inventory.

- src/components/: Includes reusable UI components such as StoreCard, BookCard, AuthorCard, BooksTable, Modal, and Header.

- src/hooks/: Custom hooks like useLibraryData for data fetching and state management.

- src/assets/: Stores static assets like author images (a1.png, a2.png).

- data/: JSON files (stores.json, books.json, authors.json, inventory.json) for mock data.

Routes
- /: Home page with sections for Stores, Books, and Authors.

- /browse-stores: Browse all stores with their book counts and average prices.

- /browse: Browse all books with their authors and store availability.

- /browse-authors: Browse all authors with their published book counts.


