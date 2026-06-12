Индексы в Pandas представляют собой метки, уникально идентифицирующие каждую строку или столбец.  
Строковые индексы обычно называют метками или ключами. Индексы столбцов соответствуют их названиям.

**Доступ к индексам:**

- `df.index`: Возвращает объект индекса строк.
- `df.columns`: Возвращает объект индекса столбцов (список столбцов).

**Операции с индексами:**

- `df.set_index(col)`: Превращает столбец в индекс строк.
- `df.reset_index(drop=True/False)`: Превращает индекс строк в столбец. Параметр `drop` удаляет столбец из таблицы.
- `df.sort_index(ascending=True/False)`: Сортирует DataFrame по индексу. Параметр `ascending` сортирует по возрастанию или убыванию значений.

**Управление индексами:** Если индексы не указывать явно, они задаются как последовательные числа от 0 до N в формате `RangeIndex`. Эта конструкция предназначена для экономии памяти и ускорения работы с DataFrame.

Пример:

```python
import numpy as np
import pandas as pd

# Создадим NumPy массив
data = np.array([[1, 7, 6, 5, 6], [4, 4, 4, 3, 1]])

# Конвертируем NumPy массив в pandas DataFrame
df = pd.DataFrame(data=data)

# Просмотр индекса строк
print(f"Индексы строк: {df.index}")

# Просмотр индекса столбцов
print(f"Индексы столбцов: {df.columns}")
```

Индексы можно задать самостоятельно во время создания DataFrame или после.

Пример:

```python
# Пример создания индексов для строк:
import pandas as pd

# Устанавливаем индексы строк как целые числа 10, 20 и 30
df = pd.DataFrame({'Name': ['Alice', 'Bob', 'Aritra'],
                   'Age': [25, 30, 35],
                   'Location': ['Seattle', 'New York', 'Kona']},
                  index=[10, 20, 30])

print(f"Объект с индексами {df.index}")

# Затем индексы строк можно изменить
df.index = [100, 200, 300]
print(f"Новые индексы {df.index}")
```

Пример:

```python
# Пример создания индексов для столбцов
import pandas as pd
import numpy as np

data = np.array([[1, 7, 6], [4, 4, 1]])

# Конвертируем NumPy массив в pandas DataFrame
df = pd.DataFrame(data=data)

# Задаем индексы столбцов - названия колонок
df.columns = ['A', 'B', 'C']

# Просмотр индекса
print(f"Индексы столбцов: {df.columns}")
print(df)
```

- В качестве индексов строк можно использовать существующий столбец в таблице.

#### Пример:

```python
# Создание индексов из данных столбца
import pandas as pd

# Создание DataFrame
df = pd.DataFrame({'A': [1, 2, 3], 'B': [4, 5, 6], 'C': [7, 8, 9]})

# Превращение столбца 'B' в индекс строк
df_set_index = df.set_index('B')

print(df_set_index.index)
```

**Созданные индексы для строк можно отменить.**

Пример:

```python
# Отмена индексов
import pandas as pd

# Создание DataFrame
df = pd.DataFrame({'A': [1, 2, 3], 'B': [4, 5, 6], 'C': [7, 8, 9]}, index=['AAA', 'BBB', 'CCC'])

# Вывод индексов
print(f"Индексы строк: {df.index}")
print(f"Индексы/Названия столбцов: {df.columns}")

# Теперь индексы будут заданы по умолчанию
df_droped_index = df.reset_index()
print(df_droped_index)
print(f"Индексы строк: {df_droped_index.index}")

# В таблице индексы сохранятся как отдельный столбец
print(f"Индексы/Названия столбцов: {df_droped_index.columns}")
```

**Формат ввода:**

Создайте словарь `movies` с ключами `['ID', 'Movie', 'Year', 'Ratings', 'Genre', 'Gross', 'Budget', 'Screens', 'Sequel', 'Sentiment', 'Views', 'Likes', 'Dislikes', 'Comments', 'Aggregate Followers']`. Заполните его данными (любые).  
Конвертируйте его в DataFrame.  
Выведите список с названиями столбцов (индексы столбцов).  
Выведите индексы строк.  
Задайте в качестве индексов строк столбец `ID`.

Пример:

```python
import pandas as pd

dict_movies = {'ID': [16565, 56666, 96656],
               'Movie': ['Big Hero 6', 'And So It Goes', 'A Million Ways to Die in the West'], 
               'Year': [2014, 2014, 2014], 
               'Ratings': [7.9, 5.7, 6.1], 
               'Genre': [12, 8, 8], 
               'Gross': [222000000, 15200000, 42600000], 
               'Budget': [165000000, 30000000, 40000000], 
               'Screens': [3761.0, 1762.0, 3158.0],
               'Sequel': [1, 1, 1], 
               'Sentiment': [29, 0, 0], 
               'Views': [4700023, 519327, 3013011], 
               'Likes': [14163, 963, 9595], 
               'Dislikes': [538, 94, 419], 
               'Comments': [1293, 70, 1020],
               'Aggregate Followers': [199800, 386400, 8153000]
}

movies = pd.DataFrame(dict_movies)
print("Индексы столбцов:")
print(movies.sample(3))

print("Индексы столбцов:")
print(movies.columns)

print("Индексы строк по умолчанию:")
print(movies.index)

movies.set_index('ID', inplace=True)

print("Индексы строк как ID:")
print(movies.index)
```