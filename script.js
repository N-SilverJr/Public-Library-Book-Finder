let books = [];
let suggestions = [];

async function loadSuggestions() {
    const suggestionsDiv = document.getElementById('suggestionsList');
    suggestionsDiv.innerHTML = 'Loading suggestions...';

    try {
        // Fetch a larger pool of books (e.g., 50) for randomization
        const response = await fetch('https://openlibrary.org/search.json?q=fiction&limit=50');
        if (!response.ok) throw new Error('Suggestions fetch failed');
        const data = await response.json();

        // Map all fetched books
        const allBooks = data.docs.map(book => ({
            title: book.title || 'Unknown Title',
            author: book.author_name ? book.author_name[0] : 'Unknown Author',
            year: book.first_publish_year || 'N/A',
            coverId: book.cover_i || null,
            workKey: book.key || null,
            summary: null
        }));

        // Randomly select 5 books
        suggestions = [];
        const shuffled = allBooks.sort(() => 0.5 - Math.random()); // Shuffle array
        suggestions = shuffled.slice(0, 5); // Take first 5

        displaySuggestions();
    } catch (error) {
        suggestionsDiv.innerHTML = 'Failed to load suggestions.';
        console.error(error);
    }
}

async function searchBooks() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) {
        alert('Please enter a search term');
        return;
    }

    // Hide suggestions when search is performed
    const suggestionsSection = document.querySelector('.suggestions');
    suggestionsSection.style.display = 'none';

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = 'Loading...';

    try {
        const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();

        books = data.docs.map(book => ({
            title: book.title || 'Unknown Title',
            author: book.author_name ? book.author_name[0] : 'Unknown Author',
            year: book.first_publish_year || 'N/A',
            coverId: book.cover_i || null,
            workKey: book.key || null,
            summary: null
        }));

        if (books.length === 0) {
            resultsDiv.innerHTML = 'No results found.';
            return;
        }

        displayBooks(books);
        populateAuthorFilter();
    } catch (error) {
        resultsDiv.innerHTML = 'Error fetching data. Please try again later.';
        console.error(error);
    }
}

function displaySuggestions() {
    const suggestionsDiv = document.getElementById('suggestionsList');
    suggestionsDiv.innerHTML = suggestions.map((book, index) => {
        const coverUrl = book.coverId 
            ? `https://covers.openlibrary.org/b/id/${book.coverId}-S.jpg`
            : 'https://via.placeholder.com/50x75?text=No+Cover';
        return `
            <div class="book" onclick="toggleSummary(${index}, 'suggestions')">
                <img src="${coverUrl}" alt="${book.title} cover">
                <div class="book-details">
                    <strong>${book.title}</strong><br>
                    Author: ${book.author}<br>
                    Year: ${book.year}
                </div>
                <div class="summary" id="suggestion-summary-${index}">
                    ${book.summary ? book.summary : 'Loading summary...'}
                </div>
            </div>
        `;
    }).join('');
}

function displayBooks(bookList) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = bookList.map((book, index) => {
        const coverUrl = book.coverId 
            ? `https://covers.openlibrary.org/b/id/${book.coverId}-S.jpg`
            : 'https://via.placeholder.com/50x75?text=No+Cover';
        return `
            <div class="book" onclick="toggleSummary(${index}, 'books')">
                <img src="${coverUrl}" alt="${book.title} cover">
                <div class="book-details">
                    <strong>${book.title}</strong><br>
                    Author: ${book.author}<br>
                    Year: ${book.year}
                </div>
                <div class="summary" id="summary-${index}">
                    ${book.summary ? book.summary : 'Loading summary...'}
                </div>
            </div>
        `;
    }).join('');
}

function populateAuthorFilter() {
    const authors = [...new Set(books.map(book => book.author))];
    const select = document.getElementById('authorFilter');
    select.innerHTML = '<option value="">Filter by Author</option>' + 
        authors.map(author => `<option value="${author}">${author}</option>`).join('');
}

function sortBooks(criteria) {
    if (criteria === 'title') {
        books.sort((a, b) => a.title.localeCompare(b.title));
    } else if (criteria === 'year') {
        books.sort((a, b) => (a.year === 'N/A' ? Infinity : a.year) - (b.year === 'N/A' ? Infinity : b.year));
    }
    displayBooks(books);
}

function filterBooks() {
    const selectedAuthor = document.getElementById('authorFilter').value;
    const filtered = selectedAuthor ? books.filter(book => book.author === selectedAuthor) : books;
    displayBooks(filtered);
}

async function toggleSummary(index, type) {
    const bookList = type === 'suggestions' ? suggestions : books;
    const book = bookList[index];
    const summaryDiv = document.getElementById(`${type === 'suggestions' ? 'suggestion-summary' : 'summary'}-${index}`);

    if (summaryDiv.style.display === 'block') {
        summaryDiv.style.display = 'none';
        return;
    }

    if (!book.summary && book.workKey) {
        try {
            const workResponse = await fetch(`https://openlibrary.org${book.workKey}.json`);
            if (!workResponse.ok) throw new Error('Work fetch failed');
            const workData = await workResponse.json();
            book.summary = workData.description 
                ? (typeof workData.description === 'string' ? workData.description : workData.description.value) 
                : 'No summary available.';
            if (book.summary.length > 200) {
                book.summary = book.summary.substring(0, 200) + '...';
            }
        } catch (error) {
            book.summary = 'Failed to load summary.';
            console.error(error);
        }
    } else if (!book.workKey) {
        book.summary = 'No summary available.';
    }

    summaryDiv.textContent = book.summary;
    summaryDiv.style.display = 'block';
}