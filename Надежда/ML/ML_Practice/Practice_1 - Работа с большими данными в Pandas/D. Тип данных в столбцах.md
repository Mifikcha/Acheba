Pandas поддерживает следующие типы данных:

- `object` — текстовые или смешанные числовые значения.
- `bool` — значения «true» или «false».
- `int64` — целочисленные значения.
- `float64` — значения с плавающей точкой.
- `datetime64` — значения даты и времени.
- `category` — категориальные значения (данные, которые принимают конечное число возможных значений).

### Просмотр типов:

- `df.dtypes` — возвращает объект `dtypes` со списком типов данных в столбцах.

**Пример:**

```python
import pandas as pd

df = pd.DataFrame({'c1': ['high', 'high', 'low', 'low'], 'c2': [0, 23, 17, 4]})
print(f"Типы данных: \n{df.dtypes}")
```

**Изменение типа столбца:**

```python
df.astype()
```

**Пример:**

```python
from os import replace
import pandas as pd

df = pd.DataFrame({'c1': ['high', 'high', 'low', 'low'], 'c2': [0.0, 23.0, 17.1, 4.3]})
print(f"Типы данных по-умолчанию: \n{df.dtypes}")
print(df)
print(df['c2'].astype('int64'))
```

**Выборка столбцов по типу:**

- `df.select_dtypes(include=['float64', 'int64'])`

**Пример:**

```python
import pandas as pd

df = pd.DataFrame({'c1': ['high', 'high', 'low', 'low'], 'c2': [0, 23, 17, 4]})
print(f"Только числа: \n{df.select_dtypes('int64')}")
```

---

**Формат ввода:**

Создайте датасет `movies`.  
Выведите список типов данных для каждого столбца.  
Выберите признаки с типом `'object'` и `'float64'`.

Пример:

```python
import pandas as pd

dict_movies = {
    'ID': [16565, 56666, 96656],
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

print("Типы данных:")
print(movies.dtypes)

print("Признаки с текстовыми и дробными типами:")
print(movies.select_dtypes(['object', 'float64']))
```