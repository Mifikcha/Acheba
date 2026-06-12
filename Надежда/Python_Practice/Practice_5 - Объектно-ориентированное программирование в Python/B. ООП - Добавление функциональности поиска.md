
|   |   |
|---|---|
|Ограничение времени|1 секунда|
|Ограничение памяти|64.0 Мб|
|Ввод|стандартный ввод или input.txt|
|Вывод|стандартный вывод или output.txt|

К реализованным в предыдущей задаче классам добавьте класс **Library**, который будет хранить список книг и авторов. Реализуйте метод поиска книги по названию или автору.

## Формат ввода

```

author1 = Author("George", "Orwell", "1903-06-25")
author2 = Author("Aldous", "Huxley", "1894-07-26")

book1 = Book("1984", author1, 1949)
book2 = Book("Brave New World", author2, 1932)

library = Library()
library.add_book(book1)
library.add_book(book2)

# Поиск по названию
found_book = library.find_book_by_title("1984")
print(found_book.book_info() if found_book else "Книга не найдена")

# Поиск по автору
found_books = library.find_books_by_author("Aldous Huxley")
for book in found_books:
    print(book.book_info())

```

## Формат вывода

'1984', George Orwell, опубликована в 1949

'Brave New World', Aldous Huxley, опубликована в 1932