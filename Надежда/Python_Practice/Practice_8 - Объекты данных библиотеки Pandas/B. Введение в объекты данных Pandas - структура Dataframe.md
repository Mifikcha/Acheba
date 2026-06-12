
|   |   |
|---|---|
|Ограничение времени|1 секунда|
|Ограничение памяти|64Mb|
|Ввод|стандартный ввод или input.txt|
|Вывод|стандартный вывод или output.txt|

Напишите функцию, которая принимает на вход словарь, на его основе создает объект `Dataframe` и возвращает первые три записи из него, используя библиотеку **pandas**.

Функция должна принимать один аргумент. Результат операции выведите с помощью `return`.

Аргумент - словарь.

## Формат ввода

```
{
    "fruits": [
        "apple", "banana", "orange", "grape", "pear",
        "kiwi", "strawberry", "blueberry", "mango", "pineapple",
        "watermelon", "peach", "plum", "cherry", "lemon"
    ],
    "colors": [
        "red", "blue", "green", "yellow", "purple",
        "orange", "pink", "brown", "black", "white",
        "gray", "cyan", "magenta", "lime", "navy"
    ],
    "movies": [
        "Inception", "Titanic", "Avatar", "The Matrix", "The Godfather",
        "Pulp Fiction", "The Shawshank Redemption", "Forrest Gump", "Gladiator", "Interstellar",
        "The Dark Knight", "Fight Club", "Jurassic Park", "The Lion King", "Schindler's List"
    ],
    "animals": [
        "dog", "cat", "elephant", "tiger", "lion",
        "giraffe", "bear", "zebra", "kangaroo", "panda",
        "fox", "wolf", "rabbit", "squirrel", "deer"
    ],
    "professions": [
        "doctor", "teacher", "engineer", "artist", "nurse",
        "scientist", "musician", "writer", "chef", "mechanic",
        "programmer", "architect", "journalist", "farmer", "electrician"
    ]
}
```

## Формат вывода

```
   fruits colors     movies   animals professions
0   apple    red  Inception       dog      doctor
1  banana   blue    Titanic       cat     teacher
2  orange  green     Avatar  elephant    engineer
```

## Примечания

Необходимо использовать библиотеку **pandas**.

В решении требуется только объявленная функция - вызов функции и ввод-вывод данных осуществляется на этапе тестирования.