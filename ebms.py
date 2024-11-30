import csv
import random
from gutenbergpy.gutenbergcache import GutenbergCache

# Initialize cache
cache = GutenbergCache.get_cache()

# Queries
import csv
import random
from gutenbergpy.gutenbergcache import GutenbergCache

# Initialize cache
cache = GutenbergCache.get_cache()
cursor=cache.native_query("select bookid,authorid from book_authors limit 10")
row=cursor.fetchall()
print(row)
cursor=cache.native_query("select id from authors limit 10")
row=cursor.fetchall()
print(row)
cursor=cache.native_query("select id,gutenbergbookid from books order by gutenbergbookid limit 10")
row=cursor.fetchall()
print(row)
# Queries
books_query = """SELECT b.id,b.dateissued, l.name FROM books b 
                 JOIN languages l 
                 ON b.languageid = l.id LIMIT 500"""
bookstitle_query="""select id,name,bookid from titles limit 1000"""
authors_query = """SELECT a.id, a.name, MIN(l.name) FROM authors a
                   JOIN book_authors ba ON a.id = ba.authorid
                   JOIN books b ON ba.bookid = b.id
                   JOIN languages l ON b.languageid = l.id
                   GROUP BY a.id, a.name
                   LIMIT 500"""
publishers_query = """SELECT b.publisherid, p.name FROM books b
                      JOIN publishers p ON b.publisherid = p.id
                      LIMIT 100"""
subject_query = "SELECT * FROM subjects LIMIT 200"
links_query = """SELECT d.id, d.bookid, d.name FROM downloadlinks d
                 JOIN books b ON d.bookid = b.id LIMIT 1000"""
genre_query = "SELECT * FROM bookshelves LIMIT 500"

# Expanded dummy data for publishers
streets = ["Main St", "Elm St", "High St", "Maple Ave", "Oak St", "Pine Ln"]
cities = ["New York", "Phoenix", "San Francisco", "Austin", "Dallas", "Boston"]
zip_codes = [10001, 90001, 60601, 77001, 85001, 94102, 73301, 98101, 21010, 75201]
email_domains = ["@publishing.com","@gutenberg.com", "@literature.com", "@novels.com", "@ebooks.com"]
phone_prefixes = ["202", "303", "404", "505", "606", "707", "808", "909", "415", "312"]

publisher_ids = range(1,10)  
publisher_names = [f"Gutenberg Publisher {i}" for i in publisher_ids]  # Dummy publisher names

# Data Export Function
def export_data_to_csv(query, csv_file_path, headers):
    cursor = cache.native_query(query)
    rows = cursor.fetchall()
    print(f"Number of rows fetched for {csv_file_path}: {len(rows)}")
    with open(csv_file_path, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(headers)  # Write the header
        writer.writerows(rows)  # Write the data rows
    print(f"Data has been exported to {csv_file_path}")

# Export books, authors, subjects, links, and genres
export_data_to_csv(books_query, "books.csv", ["Book_id","Published_date", "Language"])
export_data_to_csv(authors_query, "authors.csv", ["Author_id", "Name", "Nationality"])
export_data_to_csv(subject_query, "subjects.csv", ["Subject_id", "Name"])
export_data_to_csv(links_query, "links.csv", ["Link_id", "Book_id", "Link"])
export_data_to_csv(genre_query, "genres.csv", ["Genre_id", "Genre_name"])
export_data_to_csv(bookstitle_query, "booktitles.csv", ["id", "title", "Book_id"])
# Generate publishers data with dummy details
publishers_file = "publishers.csv"
with open(publishers_file, mode="w", newline="", encoding="utf-8") as file:
    writer = csv.writer(file)
    writer.writerow(["Publisher_id", "Name", "Street", "City", "Zip", "Email"])  # Header
    for publisher_id, name in zip(publisher_ids, publisher_names):
        street = f"{random.randint(1, 999)} {random.choice(streets)}"
        city = random.choice(cities)
        zip_code = random.choice(zip_codes)
        email = name.lower().replace(" ", "") + random.choice(email_domains)
        writer.writerow([publisher_id, name, street, city, zip_code, email])

print(f"Publisher data exported to {publishers_file}")

# Generate publisher contacts data
publisher_contacts_file = "publisher_contacts.csv"
with open(publisher_contacts_file, mode="w", newline="", encoding="utf-8") as file:
    writer = csv.writer(file)
    writer.writerow(["Contact_id", "Publisher_id", "Contact_number"])  # Header
    contact_id = 1
    for publisher_id in publisher_ids:
        num_contacts = random.randint(1, 3)  # Assign 1-3 contacts per publisher
        for _ in range(num_contacts):
            contact_number = f"{random.choice(phone_prefixes)}-{random.randint(100, 999)}-{random.randint(1000, 9999)}"
            writer.writerow([contact_id, publisher_id, contact_number])
            contact_id += 1

print(f"Publisher contact data exported to {publisher_contacts_file}")
books_query = """SELECT b.id, t.name, b.dateissued, l.name, s.name AS subject_name
                 FROM books b
                 JOIN titles t ON b.id = t.bookid
                 JOIN book_subjects bs ON b.id = bs.bookid
                 JOIN subjects s ON bs.subjectid = s.id
                 JOIN languages l ON b.languageid = l.id
                 LIMIT 500"""

# Function to generate series names and assign series to books
def categorize_books_into_series(books):
    series_map = {}
    series_books = []
    series_id_counter = 1

    for book in books:
        book_id, title, date_issued, language, subject_name = book

        # Extract series name from title prefix and subject
        series_name = f"{title.split()[0]} Series in {subject_name}"  # Example: "Adventures Series in Fiction"

        # Check if this series name is already mapped
        if series_name not in series_map:
            series_map[series_name] = series_id_counter
            series_id_counter += 1

        # Add to series_books junction table
        series_books.append((len(series_books) + 1, series_map[series_name], book_id))

    # Create series data
    series_data = [(series_id, name, f"Books categorized under {name}") for name, series_id in series_map.items()]

    return series_data, series_books

# Data Export Function
def export_data_to_csv(data, csv_file_path, headers):
    print(f"Number of rows exported for {csv_file_path}: {len(data)}")
    with open(csv_file_path, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(headers)  # Write the header
        writer.writerows(data)  # Write the data rows
    print(f"Data has been exported to {csv_file_path}")

# Fetch books data
cursor = cache.native_query(books_query)
books = cursor.fetchall()

# Categorize books into series and generate series_books data
series_data, series_books_data = categorize_books_into_series(books)

# Export series and series_books data
export_data_to_csv(series_data, "series.csv", ["Series_id", "Series_name", "Description"])
export_data_to_csv(series_books_data, "series_books.csv", ["Series_books_id", "Series_id", "Book_id"])
