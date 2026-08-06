---
type: video_summary
source: "https://www.youtube.com/watch?v=F3lL98Pj90o"
title: "/wayfinder: Nothing is too big to plan anymore"
created: 2026-08-03
tags:
  - video-summary
  - watch
---

# /wayfinder: Nothing is too big to plan anymore

## Метаданные

- Источник: https://www.youtube.com/watch?v=F3lL98Pj90o
- Автор: Matt Pocock
- Длительность: 15:09
- Разрешение: 1280×720

## Краткое резюме

Видео — это объяснение проекта Wayfinder: навыка для планирования больших задач с агентом через несколько сессий, tickets, research/prototype steps и запись решений в issue tracker. Спикер показывает примеры из GitHub, редактора и слайдов, а в конце подводит к модели “Spec → Tickets → Smart → implement → code-review”.

## Главные выводы

- Wayfinder предназначен для планирования работы, которая не помещается в одну сессию агента.
- Основная идея — сначала построить карту работ, затем проходить tickets по одному.
- Система разделяет работу на типы: research, prototype и другие сессионные шаги.
- Wayfinder хранит решения и прогресс в issue tracker; GitHub показан как один из вариантов, но не единственный.
- Прототипы подаются как способ избежать чрезмерно низкоуровневого “waterfall”-планирования.
- Показаны реальные примеры: закрытый issue/spec для command palette и другие карты задач.

## Главы с таймкодами

### [00:00](https://www.youtube.com/watch?v=F3lL98Pj90o&t=0s)–[00:54](https://www.youtube.com/watch?v=F3lL98Pj90o&t=53s) · Введение: зачем нужен Wayfinder

**Содержание речи**

- Спикер утверждает, что нашёл способ планировать любой объём работы с агентом.
- Сравнивает старые planning tools с новым подходом: старые казались слишком ограниченными одной сессией.
- Подчёркивает идею fog of war: к цели нельзя идти напрямую, нужно поэтапно прояснять неопределённости.
- Говорит, что Wayfinder оформлен как skill в его skills repo.
- Ссылается на существующий primitive “Grill Me / Grill with Docs” как на важную, но одно-сессионную основу.

**Что показано визуально**

- Сначала — говорящая голова в домашней студии, микрофон перед ним, книги и лампа на фоне.
- Затем кадр переключается на GitHub page с docs/README о Wayfinder.
- Видно overlay с видео спикера поверх экрана.

**Важные надписи и данные**

- skills / skills / engineering / wayfinder / SKILL.md
- name wayfinder
- description Plan a huge chunk of work — more than one agent session can hold — as a shared map of issue tracker, and resolve them one at a time until the way to the destination is clear.
- disable-model-invocation true
- Plan, don't do

**Вывод:** Wayfinder позиционируется как способ не ограничивать работу рамками одной agent-session.

### [00:54](https://www.youtube.com/watch?v=F3lL98Pj90o&t=53s)–[03:20](https://www.youtube.com/watch?v=F3lL98Pj90o&t=200s) · Как выглядит планирование: старт, destination, tickets и fog

**Содержание речи**

- Объясняется базовая схема: есть стартовая точка, есть destination, а промежуточный путь туманен.
- Рекомендуется начать с grilling session, чтобы агент задал вопросы и уточнил базовую цель.
- Если этого недостаточно, могут понадобиться дополнительные sessions: prototyping, ещё grilling или research.
- Появляется метафора карты: tickets — это отдельные шаги/сессии, которые Wayfinder создаёт и управляет ими.
- Wayfinder отслеживает frontier of tickets и то, что ещё находится в fog.
- Утверждается, что Wayfinder может не только управлять research, но и распределять tasks вроде конфигурации или похода/errand.
- Подчёркивается, что данные ведутся в issue tracker.

**Что показано визуально**

- Показан GitHub issue/markdown view с описанием Wayfinder и затем VS Code/terminal view с repo exploration.
- На слайде-диаграмме видны Start и Destination, между ними цветные блоки и стрелки.
- В одном из кадров добавлены дополнительные нижние ветви/блоки, показывающие развитие карты.

**Важные надписи и данные**

- Start
- The place where you start from - a foggy idea, with no idea how to get there
- Destination
- The destination has been reached! All tasks on the map are complete.
- The frontier — three takeable tickets:
- Source lucid icon names and raw SVG path data
- Component storage schema and capture contract
- Palette information architecture and grid keyboard navigation
- PROBLEMS
- OUTPUT
- DEBUG CONSOLE
- TERMINAL
- PORTS 7

**Вывод:** Объяснена модель Wayfinder как карты решений и сессий, где каждый ticket соответствует отдельной работе.

### [03:20](https://www.youtube.com/watch?v=F3lL98Pj90o&t=200s)–[06:53](https://www.youtube.com/watch?v=F3lL98Pj90o&t=413s) · Реальные примеры в issue tracker: карты, закрытые issues и spec

**Содержание речи**

- Спикер показывает, как Wayfinder хранит decisions в issue tracker.
- Приводится пример из public course video manager repo: большая карта и 12 subtasks / sub-issues.
- Один sub-issue был закрыт обсуждением, и его резолюция затем попала обратно в parent map.
- Wayfinder назван issue-tracker agnostic: можно использовать Linear, Jira и т.п.
- Спикер переходит к примеру command palette: цель — buildable spec для command K palette в CVM diagram window.
- Wayfinder сначала grilled the user, спросил про done looks like, предложил spec, задал начальные вопросы и создал первые tickets.
- Упоминается, что было создано 7 tickets, из которых 3 были takeable right now.

**Что показано визуально**

- Показан закрытый GitHub issue about clips-during-publish race с длинным текстом вопроса и предложенными fixes.
- Затем открыт другой закрытый issue: CVM Diagram Command Palette — icons, components, and in-window search #204.
- На issue visible progress 9/9 и секции Destination / Notes.
- Потом показан терминал/редактор с текстом о frontier и списком takeable tickets.

**Важные надписи и данные**

- Closed
- Wayfinder map: PR #1346 — immutable course manifests (Pending lifecycle, CMS delete handshake, clips-race) #1347
- Close the clips-during-publish race (write-closure of non-Draft versions) #1349
- Question
- Wayfinder map: CVM Diagram Command Palette — icons, components, and in-window search #204
- Closed
- 9/9
- Destination
- Notes
- A locked, buildable spec published to mattpocock/course-video-manager ...
- Planning only. This map produces a spec, not an implementation.
- The frontier — three takeable tickets:
- Source lucid icon names and raw SVG path data
- Component storage schema and capture contract
- Palette information architecture and grid keyboard navigation

**Вывод:** Показано, что Wayfinder применяется к реальным задачам и issue-трекеру, включая карты со spec и закрытые решения.

### [06:53](https://www.youtube.com/watch?v=F3lL98Pj90o&t=413s)–[09:08](https://www.youtube.com/watch?v=F3lL98Pj90o&t=548s) · Типы tickets и роль прототипов

**Содержание речи**

- Спикер называет четыре типа tickets, которые Wayfinder вносит в issue tracker.
- Research tickets выполняются агентом сразу в subagent и возвращают информацию.
- Prototype tickets создают прототип; это подаётся как крайне важная часть planning.
- Утверждается, что prototypes помогают избежать waterfall-подобного низкофидельного upfront planning.
- Прототипы позволяют получить high-fidelity feedback о том, что реально строится.

**Что показано визуально**

- Статичный editor/terminal view с текстом о frontier и takeable tickets.
- Затем переключение к GitHub issue с большим списком sub-issues для задачи про planning the day / stand-up workflow.
- В видимом списке есть множество numbered sub-issues, но объяснение типов tickets идёт в основном голосом.

**Важные надписи и данные**

- Map: The agent plans my day — a daily stand-up that time-blocks Matt’s calendar #213
- Sub-issues 14 of 17
- Specify wiki sweep — the deterministic morning fetch #214
- The agent's memory wiki: root, structure, and constitution #215
- How does the memory wiki compact and shelve finished work? #216
- Expose publish-readiness and progress through the cvm CLI #217
- Give cvm deliverable write verbs #218
- Research: Google Calendar API for an agent-owned calendar #219
- Add wiki gcal — calendar read/write on the extended Gmail credential #220
- Anatomy of a calendar block: what a time-block event carries #221
- Stand up #Agent Triage in Todoist and define its read/write contract #222
- The session record: shape, location, and the "since last session" boundary #223
- The stand-up's step sequence, checkpoint, and spawn #224
- Build the /standup skill #225
- Open wayfinder maps as a work surface for the stand-up #226
- Build wiki sweep #228
- How the stand-up's estimates actually improve #231
- Revisit compaction for the memory wiki, once the stand-up has actually run #233
- The strategic arc: what Matt's time is meant to add up to #235

**Вывод:** Типы работ в Wayfinder представлены как отдельные ticket categories, особенно research и prototype, с акцентом на высокую ценность прототипирования.

### [10:42](https://www.youtube.com/watch?v=F3lL98Pj90o&t=642s)–[13:09](https://www.youtube.com/watch?v=F3lL98Pj90o&t=788s) · Workflow: сначала spec, потом tickets, потом выполнение

**Содержание речи**

- Спикер показывает упрощённый пятишаговый workflow: grill-with-docs or wayfinder → to-spec → to-tickets → implement → code-review.
- Поясняет, что Spec — это артефакт, описывающий destination для многосессионной работы.
- Tickets — это артефакт для одной сессии, который может жить сам по себе или ссылаться на spec.
- Идея разделения spec/tickets подаётся как способ организовать большую работу через несколько этапов.

**Что показано визуально**

- Слайд с вертикальным numbered list и выделенным словом wayfinder.
- Далее другой слайд/экран показывает sections Spec и Tickets.
- В правой части по-прежнему есть webcam overlay спикера.

**Важные надписи и данные**

- 1 grill-with-docs
- or
- wayfinder
- 2 to-spec
- 3 to-tickets
- 4 implement
- 5 code-review
- Spec
- A handoff artifact describing the destination of a multi-session piece of work.
- Tickets
- A handoff artifact scoping one session of work. Stands alone or hangs off a spec.
- Smart
- #4

**Вывод:** Показан финальный conceptual workflow: Wayfinder помогает перейти от spec к tickets и далее к реализации.

### [15:04](https://www.youtube.com/watch?v=F3lL98Pj90o&t=904s)–[15:09](https://www.youtube.com/watch?v=F3lL98Pj90o&t=908s) · Финал: возвращение к роли Wayfinder и прощание

**Содержание речи**

- Спикер снова подчёркивает основную мысль: Wayfinder позволяет планировать большие куски работы без ограничения одной сессией.
- Концовка визуально сопровождается жестом thumbs-up.

**Что показано визуально**

- Full webcam view: спикер перед камерой, микрофон на boom arm, книжные полки и лампа.
- В последнем кадре он поднимает руку и показывает thumbs-up.

**Важные надписи и данные**

- Не отмечены.

**Вывод:** Видео завершается на позитивной ноте и визуальном подтверждении завершения выступления.

## Ключевые визуальные моменты

- GitHub README/skill page с описанием Wayfinder и фразой Plan, don't do.
- Слайд Start → Destination с цветными блоками и стрелками.
- Закрытый GitHub issue про clips-during-publish race с предложенными fix options.
- Issue/spec для CVM Diagram Command Palette с отметкой Closed и 9/9.
- Терминал/редактор со списком three takeable tickets.
- Слайд с workflow: grill-with-docs / wayfinder → to-spec → to-tickets → implement → code-review.
- Финальный thumbs-up в full webcam view.

## Расхождения между речью и изображением

- Не все timeline visuals совпадают с ближайшей речью буквально: часть экранов — это статичные примеры, которые иллюстрируют сказанное, а не непрерывное событие.
- В ряде мест речь обобщает функциональность Wayfinder шире, чем позволяет строго подтвердить один выбранный frame.
- Некоторые видимые issue titles/IDs относятся к другим картам задач, поэтому их нельзя трактовать как единственный непрерывный сюжет без допущений.

## Неуверенные или пропущенные участки

- Видео не позволяет уверенно восстановить весь полный список четырёх типов tickets без опоры на речь; часть классификации остаётся только вербальной.
- Не все промежуточные tickets, упомянутые в речи, показаны на экране; названия и порядок некоторых из них не видны полностью.
- Нельзя утверждать, что зритель видел непрерывный процесс редактирования issue pages; доступны лишь выбранные кадры.
- Некоторые упомянутые инструменты/skills и внутренние имена репозиториев показаны фрагментарно и могут быть неполными на экране.
- Значение некоторых сокращений и внутренних терминов (например, отдельные repo/issue references) в кадрах не раскрыто полностью.

## Методика анализа

- Источники: аудиотранскрипция, доступные субтитры, границы сцен и выбранные кадры.
- Проанализировано кадров: 17.
- Семплирование: середины сцен плюс периодические кадры для покрытия длинных сцен.
- Адаптивный второй проход: нет.
- OpenAI API-запросов: 5.
- Визуальные выводы основаны на выбранных кадрах, а не на непрерывном просмотре видео.
- Быстрые события между кадрами, мелкий текст и неразборчивая речь могли быть пропущены.
