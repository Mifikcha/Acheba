
|   |   |
|---|---|
|Ограничение времени|1 секунда|
|Ограничение памяти|256Mb|
|Ввод|стандартный ввод или input.txt|
|Вывод|стандартный вывод или output.txt|

Используя библиотеку **pandas**, напишите скрипт, который

- загружает файл JSON с названием `games_metadata.json`
- на его основе создает объект `Dataframe`
- выполняет фильтрацию игр с тегами Strategy и RTS
- создает сводную таблицу с подсчетом количества игр по жанрам
- сортирует по количеству игр
- сохраняет полученный датафрейм в новый файл с именем `games_strategy_rts.json`

Файл JSON представлен по ссылке в разделе **Примечания**.

Источник данных - [https://www.kaggle.com/datasets/antonkozyriev/game-recommendations-on-steam](https://www.kaggle.com/datasets/antonkozyriev/game-recommendations-on-steam)

## Примечания

Необходимо использовать библиотеку **pandas**.