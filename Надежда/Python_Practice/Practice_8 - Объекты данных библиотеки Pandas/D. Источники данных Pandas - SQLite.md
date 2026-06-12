
|   |   |
|---|---|
|Ограничение времени|10 секунд|
|Ограничение памяти|256Mb|
|Ввод|стандартный ввод или input.txt|
|Вывод|стандартный вывод или output.txt|

Используя библиотеку **pandas**, напишите скрипт, который

- загружает файл SQLite с названием `european_database.sqlite`
- на его основе создает объект `Dataframe`
- оставляет в датафрейме одну колонку с удалением дубликатов - `'country'`
- сохраняет полученный датафрейм в новый файл с именем `new_database.sqlite`

Шаблон кода и файл SQLite представлены в архиве по ссылке в разделе **Примечания**.

Источник данных - [https://www.kaggle.com/datasets/groleo/european-football-database](https://www.kaggle.com/datasets/groleo/european-football-database)

## Примечания

Необходимо использовать библиотеку **pandas**.