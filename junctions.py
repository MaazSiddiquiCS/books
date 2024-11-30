import csv
import random
from gutenbergpy.gutenbergcache import GutenbergCache

# Initialize cache
cache = GutenbergCache.get_cache()

# Queries
bookgenres_query = """select id,bookshelveid from books limit 500"""
bookpublisher_query = """select id,publisherid from books limit 500"""
authorbooks_query = """select bookid,authorid from book_authors
                       limit 600"""

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
export_data_to_csv(bookgenres_query, "book_genre.csv", ["Book_id", "genre_id"])
export_data_to_csv(bookpublisher_query, "Book_publisher.csv", ["book_id", "publisher_id"])
export_data_to_csv(authorbooks_query, "AuthorBooks.csv", ["book_id", "author_id"])