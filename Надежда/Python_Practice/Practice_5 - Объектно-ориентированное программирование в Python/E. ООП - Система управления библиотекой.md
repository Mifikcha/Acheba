
|   |   |
|---|---|
|Ограничение времени|1 секунда|
|Ограничение памяти|64.0 Мб|
|Ввод|стандартный ввод или input.txt|
|Вывод|стандартный вывод или output.txt|

Создайте класс **LibrarySystem**, который будет объединять все созданные ранее компоненты: управление книгами, авторами и читателями. Реализуйте следующие методы:

- `add_book` и `add_reader` для добавления книг и читателей
- `checkout_book` и `return_book` для выдачи и возврата книг
- `get_book_info` и `get_reader_info` для получения информации о текущем статусе книг и читателей.

## Формат ввода

```
library_system = LibrarySystem()
author = Author("Лев", "Толстой", "1828-09-09")
book = Book("Война и мир", author, 1869)
reader = Reader("Петр", "Петров")

library_system.add_book(book)
library_system.add_reader(reader)

if library_system.checkout_book(reader, book):
    print(f"{reader.full_name()} получил(а) книгу: {book.title}")

print(library_system.get_reader_info(reader))
library_system.return_book(reader, book)
print(library_system.get_reader_info(reader))
```

## Формат вывода

Петр Петров получил(а) книгу: Война и мир

{'Полное имя': 'Петр Петров', 'Выданные книги': ['Война и мир']}

{'Полное имя': 'Петр Петров', 'Выданные книги': []}