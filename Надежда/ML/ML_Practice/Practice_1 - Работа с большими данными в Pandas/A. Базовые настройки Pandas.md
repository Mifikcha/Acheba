## Необходимые инструменты

Для работы на компьютере вам понадобятся:

- Python >= 3.9 (установленная версия)
- Библиотека Pandas
- Текстовый редактор (например, Jupyter Notebook или Visual Studio Code)

Для установки библиотеки Pandas используйте команду:

```cmd
!pip install pandas
```

## Формат ввода

Импортируйте библиотеку pandas, сохраните установленную версию в переменную и выведите её значение:

```python
import pandas as pd

pd_version = pd.__version__
print(f"Pandas version: {pd.__version__}")
```