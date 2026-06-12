Методы — такие же выражения, как переменные или вызовы функции, значит, их можно по-разному комбинировать.

Например, использовать в операциях:

```python
name = 'Shaya'
'hi, ' + name.upper() + '!'  # hi, SHAYA!
```

Или использовать в параметрах функций:

```python
name = 'robb'
print(name.lower())  # => robb
num1 = 5
num2 = 30
# bit_length() — вычисляет количество бит, необходимых для представления числа в двоичном виде
print(num1.bit_length() + num2.bit_length())  # => 8
```

[https://replit.com/@hexlet/python-basics-objects-method-expression](https://replit.com/@hexlet/python-basics-objects-method-expression)

## Задание

Найдите символы _N_ и _,_ (запятая) внутри текста в переменной `text`. Выведите на экран их индексы. Ожидаемый тестами вывод:

```
Index Of N: 0
Index Of ,: 25
```
Ваша задача найти эти индексы в строке с помощью метода `.find()` и вставить в `print()`, не используя промежуточные переменные. Это упражнение можно решить как при помощи интерполяции, так и при помощи конкатенации. Если вы используете конкатенацию, то полученный результат необходимо привести к строковому типу. Для разбиения вывода на две строки, вам может понадобится `\n`.

Решение:

```python
text = 'Never forget what you are, for surely the world will not'
# BEGIN (write your solution here)
print('Index Of N: ' + str(text.find('N')))
print('Index Of ,: ' + str(text.find(',')))
# END
```