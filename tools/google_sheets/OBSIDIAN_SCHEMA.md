# Obsidian Schema For Sheets Sync

Эта схема описывает, какие заметки нужно завести в Obsidian, чтобы Google Sheets начал заполняться не только программами и темами, но и расписанием, группами, прогрессом, KPI и домашкой.

Главное правило остается прежним:

```text
Obsidian -> Google Sheets
```

Если Telegram-бот меняет прогресс после урока, правильный поток такой:

```text
бот -> подтверждение преподавателя -> запись в Obsidian -> sync_to_google_sheets.py -> Google Sheets
```

## Группа

```yaml
---
type: group
group_id: PHY-OGE-01
group_name: Физика ОГЭ №1
subject: physics
level: oge
program_id: CURR-PHYS-GRADE-9
teacher: Сергей
weekdays: Вт, Сб
start_time: "18:00"
duration_minutes: 90
max_students: 6
start_date: 2026-09-01
end_date: 2027-05-31
status: Набор
---
```

## Ученик

```yaml
---
type: student
student_id: ST-0001
full_name: Иван Иванов
short_name: Иван
subject: physics
grade: 9
format: группа
group_id: PHY-OGE-01
program_id: CURR-PHYS-GRADE-9
parent_name: Анна
parent_telegram_id:
student_telegram_id:
start_date: 2026-09-01
target: ОГЭ по физике
exam: ОГЭ
target_score: 5
status: Активный
access_student: true
access_parent: true
---
```

## Запланированное занятие

```yaml
---
type: lesson
lesson_id: PHY-OGE-01-2026-09-03
group_id: PHY-OGE-01
student_id:
date: 2026-09-03
start_time: "18:00"
end_time: "19:30"
format: group
program_id: CURR-PHYS-GRADE-9
planned_topic_id: PHYS-MECH-001
planned_topic_name: Равномерное и равноускоренное движение
location: online
status: Запланировано
---
```

После занятия эту же заметку можно дополнять:

```yaml
actually_covered:
  - PHYS-MECH-001
lesson_summary: Разобрали путь, перемещение, скорость и первые задачи на графики.
homework_id: HW-PHY-OGE-01-0001
teacher_comment: Группе нужно повторить перевод единиц.
```

## Домашнее задание

```yaml
---
type: homework
homework_id: HW-PHY-OGE-01-0001
lesson_id: PHY-OGE-01-2026-09-03
group_id: PHY-OGE-01
student_id:
assigned_at: 2026-09-03
deadline: 2026-09-07
topic_id: PHYS-MECH-001
task_text: Задачи 1-8 по равномерному движению.
materials_link:
status: Назначено
---
```

Если задание индивидуально адаптировано, заполняй `student_id`.

## Прогресс ученика по теме

```yaml
---
type: progress
progress_id: ST-0001-PHYS-MECH-001
student_id: ST-0001
program_id: CURR-PHYS-GRADE-9
topic_id: PHYS-MECH-001
topic_name: Равномерное и равноускоренное движение
status: Изучается
mastery_level: 2
first_started_at: 2026-09-03
last_checked_at: 2026-09-03
score:
needs_revision: true
teacher_comment: Формулы понимает, графики пока с подсказками.
source_lesson_id: PHY-OGE-01-2026-09-03
---
```

`mastery_level`:

```text
0 - не начинал
1 - знаком
2 - решает с помощью
3 - решает базовые задачи самостоятельно
4 - уверенно решает стандарт
5 - решает усложненные задачи
```

## Посещаемость

```yaml
---
type: attendance
attendance_id: PHY-OGE-01-2026-09-03-ST-0001
lesson_id: PHY-OGE-01-2026-09-03
student_id: ST-0001
group_id: PHY-OGE-01
date: 2026-09-03
status: Присутствовал
late_minutes: 0
reason:
confirmed_by: teacher
---
```

## Контрольная

```yaml
---
type: test_result
test_id: TEST-ST-0001-PHYS-MECH-001-2026-09-20
student_id: ST-0001
group_id: PHY-OGE-01
topic_id: PHYS-MECH-001
test_name: Мини-контрольная по движению
test_date: 2026-09-20
max_score: 10
score: 7
percentage: 70
level: standard
mistakes: График скорости, перевод км/ч в м/с
needs_revision: true
---
```

## KPI

```yaml
---
type: kpi
student_id: ST-0001
period_start: 2026-09-01
period_end: 2026-09-30
attendance_rate: 100
homework_completion_rate: 75
homework_quality_rate: 70
topics_mastered: 2
topics_in_progress: 1
topics_to_review: 1
average_test_score: 70
lessons_completed: 8
progress_velocity: 2
discipline_status: Есть единичные проблемы
teacher_summary: Иван стабильно посещает занятия, но домашку нужно сдавать регулярнее.
---
```

На первом этапе KPI можно считать в Google Sheets, а в Obsidian сохранять подтвержденный итоговый блок раз в месяц.
