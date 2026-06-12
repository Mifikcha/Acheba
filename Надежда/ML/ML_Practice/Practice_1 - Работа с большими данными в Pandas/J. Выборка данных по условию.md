В качестве индекса в методе `loc` можно использовать одно или несколько условий. Рассмотрим примеры:

1. **Выборка по одному условию**:

```python
df.loc[условие1]
```

2. **Выборка по строкам и столбцу**:

```python
df.loc[условие1, условие2]
```

3. **Выборка с двумя условиями для строк с оператором ИЛИ** (или):

```python
df[((условие1) | (условие2))]
```

4. **Выборка с двумя условиями для строк с оператором И** (и):

```python
df[((условие1) & (условие2))]
```

### Пример выборки данных:

```python
import pandas as pd

# Пример 1: Создание DataFrame и выборка по условию
df = pd.DataFrame({'Name': ['A', 'B', 'D'], 'Age': [4, 5, 6]})

# Выбор имени, если возраст больше 4
subset1 = df.loc[df["Age"] > 4, "Name"]
print(f"Возраст больше 4: \n {subset1}")

# Пример 2: Создание другого DataFrame с работодателями и выборка по условию
df = pd.DataFrame({
    'Employers': ['W', 'T', 'Q', 'A', 'L', 'U', 'C', 'N', 'Z'],
    'EmpCount': [40, 57, 67, 98, 41, 50, 30, 60, 30]
})

# Выбор работодателей W и N
subset2 = df.loc[((df["Employers"] == 'W') | (df["Employers"] == 'N'))]
print(f"\nРаботодатель W и N: \n {subset2}")

# Выбор работодателей W и N с указанием столбца EmpCount
subset2 = df.loc[((df["Employers"] == 'W') | (df["Employers"] == 'N')), 'EmpCount']
print(f"\nКоличество работников в W и N: \n {subset2}")

# Работодатели с количеством работников в диапазоне от 50 до 70
subset3 = df.loc[((df['EmpCount'] >= 50) & (df['EmpCount'] <= 70)), "Employers"]
print(f"\nРаботодатели с количеством работников в диапазоне от 50 до 70: \n {subset3}")
```

### Формат ввода:

**Загрузите данные из файла `books_part1.csv`:**

1. Выберите книги, опубликованные в 1999 году.
2. Выберите книги из издательств 'Tempo' и 'Life Works Books'.
3. Выберите книги с длиной заголовка более 30 символов, опубликованные в 1967 году.

Пример кода:

```python
import pandas as pd

# Загрузим данные в переменную df_books
df_books = pd.read_csv("books_part1.csv")

# Установим столбец 'ISBN' как индекс
df_books.set_index('ISBN', inplace=True)

# 1. Выбор книг за 1999 год
mask = (df_books['Year-Of-Publication'] == 1999)
year_1999 = df_books[mask]

# Выведем размерность подвыборки
print(f"Размерность подвыборки: {year_1999.shape}")

# Выведем первые 3 строки и 2 столбца
print(f"Год публикаций 1999:\n {year_1999.iloc[:3, :2]}")

# 2. Выбор книг издательств 'Victor Books' и 'HarperPerennial'
publishers = ('Victor Books', 'HarperPerennial')
mask = ((df_books['Publisher'] == 'Victor Books') | (df_books['Publisher'] == 'HarperPerennial'))
publishers_subset = df_books[mask]

# Выведем размерность подвыборки
print(f"Размерность подвыборки: {publishers_subset.shape}")

# Выведем название этих книг
print(f"Издания {publishers}:\n {publishers_subset.iloc[:, 0]}")

# 3. Добавим новый столбец - количество символов в заголовке
df_books['title_len'] = df_books['Book-Title'].str.len()

# Выбор книг с длинным заголовком и опубликованных в 1967 году
b_mask = (df_books['Year-Of-Publication'] == 1967) & (df_books['title_len'] > 30)
publishers_subset = df_books[b_mask]

# Выведем размерность подвыборки
print(f"Размерность подвыборки: {publishers_subset.shape}")

# Выведем название этих книг
print(f"Год публикаций 1967 с длинными заголовками:\n {publishers_subset.iloc[:, 0]}")
```

Этот код позволяет выполнить фильтрацию данных по разным условиям, таким как выбор по году публикации, издательству, или длине заголовка.