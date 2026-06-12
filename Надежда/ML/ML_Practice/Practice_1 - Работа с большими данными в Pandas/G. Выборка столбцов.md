Существует несколько способов выбрать столбцы в `DataFrame`:

1. **Использование квадратных скобок:**
    
    Заключите имена столбцов в квадратные скобки, отделяя их запятыми.
    
    ```python
    # Один столбец
    df['A']
    
    # Два столбца
    df[['A', 'C']]
    ```
    
    Возвращает `Series`, если выбран один столбец, и `DataFrame`, если выбрано несколько столбцов.
    
2. **Использование метода `.loc`:**
    
    Позволяет использовать как целые числа (ключи), так и имена столбцов. Для двухмерных данных требует индексы по обеим осям. Возвращает `Series` или `DataFrame` в зависимости от выбранного количества столбцов.
    
    Пример:
    
    ```python
    import pandas as pd
    
    # Создание DataFrame
    df = pd.DataFrame({'A': [1, 2, 3], 'B': [4, 5, 6], 'C': [7, 8, 9]}, index=[1, 2, 3])
    
    # Выбор столбца 'A'
    df_A = df.loc[:, 'A']
    
    # Выбор столбцов 'A' и 'B'
    df_AB = df.loc[:, ['A', 'B']]
    ```
    
3. **Использование метода `.iloc`:**
    
    Выборка строк и столбцов по их порядковому месту в таблице. Возвращает `Series` или `DataFrame` в зависимости от выбранного количества столбцов.
    
    Пример:
    
    ```python
    import pandas as pd
    
    # Создание DataFrame
    df = pd.DataFrame({'A': [1, 2, 3], 'B': [4, 5, 6], 'C': [7, 8, 9]})
    
    # Выбор столбца 'A' (первый столбец)
    df_A = df.iloc[:, 0]
    
    # Выбор столбцов 'A' и 'B' (первый и второй столбцы)
    df_AB = df.iloc[:, [0, 1]]
    ```
    
4. **Использование атрибута `.A`:**
    
    Работает с именами столбцов без пробелов. Возвращает объект `Series`.
    
    Пример:
    
    ```python
    import pandas as pd
    
    # Создание DataFrame
    df = pd.DataFrame({'A': [1, 2, 3], 'B': [4, 5, 6], 'C': [7, 8, 9]})
    
    # Выбор столбца 'A'
    df_A = df.A
    ```
    
### Формат ввода:

1. Выберите столбцы из датасета `Books`:

- Выгрузите данные из файла `books_part1.csv`.
- Выведите список с названиями столбцов (индексы столбцов).
- Задайте в качестве индексов строк столбец `'ISBN'`.
- Выберите столбец `'Year-Of-Publication'`.
- Выберите столбцы `'Book-Title'` и `'Publisher'`.
- Выберите столбцы `'Book-Title'` и `'Book-Author'` с помощью метода `.loc`.
- Выберите первый и третий столбец с помощью метода `.iloc`.

Пример:

```python
import pandas as pd

# Загрузим данные в переменную books
books = pd.read_csv("books_part1.csv")

# Выведем список с названиями столбцов
print(f"Список столбцов: {books.columns}")

# Зададим в качестве индексов столбец 'ISBN'
books.set_index('ISBN', inplace=True)

# Выберем столбец 'Year-Of-Publication'
year_of_publication = books['Year-Of-Publication']
print(year_of_publication)

# Выберем столбцы 'Book-Title' и 'Publisher'
book_title_and_publisher = books[['Book-Title', 'Publisher']]
print(book_title_and_publisher)

# Выберем столбцы 'Book-Title' и 'Book-Author' с помощью метода loc
book_title_and_author = books.loc[:, ['Book-Title', 'Book-Author']]
print(book_title_and_author)

# Выберем первый и третий столбец с помощью метода iloc
first_and_third_columns = books.iloc[:, [0, 2]]
print(first_and_third_columns)
```