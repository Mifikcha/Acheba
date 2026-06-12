
|   |   |
|---|---|
|Ограничение времени|1 секунда|
|Ограничение памяти|64.0 Мб|
|Ввод|стандартный ввод или input.txt|
|Вывод|стандартный вывод или output.txt|

Создайте класс **Reader**, который будет содержать информацию о читателе, включая имя, фамилию и список выданных книг. Реализуйте методы `full_name` для получения полного имени, `checkout_book` для добавления и `return_book` для удаления книг из списка выданных.

## Формат ввода

```
author = Author("Иван", "Тургенев", "1818-11-09")
book = Book("Отцы и дети", author, 1862)
reader = Reader("Анна", "Сергеевна")

print(reader.full_name())  # Вывод имени читателя
if reader.checkout_book(book):
    print(f"{reader.full_name()} выдал(а) книгу: {book.title}")

print(f"Книги у {reader.full_name()}: {[b.title for b in reader.checked_out_books]}")
reader.return_book(book)
print(f"Книги у {reader.full_name()} после возврата: {[b.title for b in reader.checked_out_books]}")
```

## Формат вывода

Анна Сергеевна

Анна Сергеевна выдал(а) книгу: Отцы и дети

Книги у Анна Сергеевна: ['Отцы и дети']

Книги у Анна Сергеевна после возврата: []