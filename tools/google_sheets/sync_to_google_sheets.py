from __future__ import annotations

import argparse
import csv
import datetime as dt
import hashlib
import os
import re
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable


SHEET_ORDER = [
    "00_Настройки",
    "01_Ученики",
    "02_Группы",
    "03_Программы",
    "04_Темы",
    "05_Расписание",
    "06_Занятия",
    "07_Прогресс",
    "08_Домашние_задания",
    "09_Посещаемость",
    "10_Контрольные",
    "11_KPI",
    "12_Доступ_ученики",
    "13_Доступ_родители",
    "14_Журнал_синхронизации",
]


HEADERS: dict[str, list[str]] = {
    "00_Настройки": ["key", "value", "description"],
    "01_Ученики": [
        "student_id",
        "full_name",
        "short_name",
        "subject",
        "grade",
        "format",
        "group_id",
        "program_id",
        "parent_name",
        "parent_telegram_id",
        "student_telegram_id",
        "obsidian_file",
        "start_date",
        "target",
        "exam",
        "target_score",
        "status",
        "access_student",
        "access_parent",
        "updated_at",
        "sync_status",
    ],
    "02_Группы": [
        "group_id",
        "group_name",
        "subject",
        "level",
        "program_id",
        "teacher",
        "weekdays",
        "start_time",
        "duration_minutes",
        "max_students",
        "current_students",
        "start_date",
        "end_date",
        "status",
        "obsidian_file",
        "updated_at",
    ],
    "03_Программы": [
        "program_id",
        "program_name",
        "subject",
        "level",
        "format",
        "academic_year",
        "estimated_lessons",
        "status",
        "obsidian_file",
        "public_link",
        "updated_at",
    ],
    "04_Темы": [
        "topic_id",
        "program_id",
        "subject",
        "section",
        "topic_name",
        "order_index",
        "estimated_lessons",
        "prerequisites",
        "mandatory",
        "materials_ready",
        "student_visible",
        "parent_visible",
        "obsidian_file",
        "public_link",
        "updated_at",
    ],
    "05_Расписание": [
        "lesson_id",
        "group_id",
        "student_id",
        "date",
        "start_time",
        "end_time",
        "format",
        "program_id",
        "planned_topic_id",
        "planned_topic_name",
        "location",
        "status",
        "obsidian_file",
        "updated_at",
    ],
    "06_Занятия": [
        "lesson_id",
        "date",
        "group_id",
        "student_id",
        "topic_id",
        "topic_name",
        "planned_topic_id",
        "actually_covered",
        "lesson_summary",
        "homework_id",
        "teacher_comment",
        "status",
        "obsidian_file",
        "updated_at",
    ],
    "07_Прогресс": [
        "progress_id",
        "student_id",
        "program_id",
        "topic_id",
        "topic_name",
        "status",
        "mastery_level",
        "first_started_at",
        "last_checked_at",
        "score",
        "needs_revision",
        "teacher_comment",
        "source_lesson_id",
        "obsidian_file",
        "updated_at",
    ],
    "08_Домашние_задания": [
        "homework_id",
        "lesson_id",
        "group_id",
        "student_id",
        "assigned_at",
        "deadline",
        "topic_id",
        "task_text",
        "materials_link",
        "status",
        "submitted_at",
        "checked_at",
        "score",
        "teacher_comment",
        "obsidian_file",
        "updated_at",
    ],
    "09_Посещаемость": [
        "attendance_id",
        "lesson_id",
        "student_id",
        "group_id",
        "date",
        "status",
        "late_minutes",
        "reason",
        "confirmed_by",
        "updated_at",
    ],
    "10_Контрольные": [
        "test_id",
        "student_id",
        "group_id",
        "topic_id",
        "test_name",
        "test_date",
        "max_score",
        "score",
        "percentage",
        "level",
        "mistakes",
        "needs_revision",
        "obsidian_file",
        "updated_at",
    ],
    "11_KPI": [
        "student_id",
        "period_start",
        "period_end",
        "attendance_rate",
        "homework_completion_rate",
        "homework_quality_rate",
        "topics_mastered",
        "topics_in_progress",
        "topics_to_review",
        "average_test_score",
        "lessons_completed",
        "progress_velocity",
        "discipline_status",
        "teacher_summary",
        "obsidian_file",
        "updated_at",
    ],
    "12_Доступ_ученики": [
        "student_id",
        "student_name",
        "group_name",
        "next_lesson_date",
        "next_lesson_time",
        "current_topic",
        "next_topic",
        "latest_homework",
        "homework_deadline",
        "homework_status",
        "attendance_rate",
        "topics_mastered",
        "topics_to_review",
        "materials_link",
    ],
    "13_Доступ_родители": [
        "student_id",
        "student_name",
        "group_name",
        "next_lesson",
        "current_topic",
        "topics_mastered",
        "topics_to_review",
        "attendance_rate",
        "homework_completion_rate",
        "average_test_score",
        "latest_teacher_summary",
        "latest_report_date",
        "payment_status_optional",
    ],
    "14_Журнал_синхронизации": [
        "sync_id",
        "timestamp",
        "entity_type",
        "entity_id",
        "source",
        "target",
        "operation",
        "old_value",
        "new_value",
        "status",
        "error_message",
    ],
}


STATUS_DICTIONARIES = {
    "student_status": ["Активный", "Приостановлен", "Завершил", "Отказ", "Архив"],
    "group_status": ["Формируется", "Набор", "Активна", "Приостановлена", "Завершена", "Архив"],
    "lesson_status": ["Запланировано", "Проведено", "Перенесено", "Отменено", "Требует отработки"],
    "topic_progress_status": ["Не начато", "Изучается", "Нужно повторить", "Освоено", "Освоено уверенно"],
    "homework_status": ["Не задано", "Назначено", "Выполнено", "Выполнено частично", "Не выполнено", "Проверено", "Просрочено"],
    "attendance_status": ["Присутствовал", "Опоздал", "Отсутствовал по уважительной причине", "Отсутствовал без предупреждения", "Занятие отменено"],
    "discipline_status": ["Стабильно", "Есть единичные проблемы", "Нестабильно", "Требуется вмешательство"],
}


SECTION_ORDER = {
    "reference": 0,
    "mechanics": 100,
    "molecular_physics": 200,
    "electrodynamics": 300,
    "quantum_physics": 400,
}


WIKILINK_RE = re.compile(r"\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]")
NUMBERED_LINE_RE = re.compile(r"^\s*\d+[.)]\s+(.*)$")


@dataclass
class Note:
    path: Path
    rel_path: str
    frontmatter: dict[str, Any]
    body: str
    updated_at: str


def normalize_path(path: Path) -> str:
    return path.as_posix()


def clean_scalar(value: str) -> Any:
    value = value.strip()
    if value == "":
        return ""
    if value in {"[]", "{}"}:
        return [] if value == "[]" else {}
    if value.lower() in {"true", "false"}:
        return value.lower() == "true"
    if value.lower() in {"null", "none", "~"}:
        return None
    if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
        return value[1:-1]
    if value.startswith("[") and value.endswith("]"):
        inner = value[1:-1].strip()
        if not inner:
            return []
        return [clean_scalar(part.strip()) for part in inner.split(",")]
    try:
        if "." in value:
            return float(value)
        return int(value)
    except ValueError:
        return value


def parse_frontmatter(text: str) -> tuple[dict[str, Any], str]:
    if not text.startswith("---"):
        return {}, text

    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return {}, text

    end_index = None
    for index in range(1, len(lines)):
        if lines[index].strip() == "---":
            end_index = index
            break
    if end_index is None:
        return {}, text

    fm_lines = lines[1:end_index]
    body = "\n".join(lines[end_index + 1 :])
    data: dict[str, Any] = {}
    current_key: str | None = None

    for raw_line in fm_lines:
        line = raw_line.rstrip()
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if line.startswith("  - ") and current_key:
            data.setdefault(current_key, [])
            if not isinstance(data[current_key], list):
                data[current_key] = [data[current_key]]
            data[current_key].append(clean_scalar(line[4:]))
            continue
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        key = key.strip()
        value = value.strip()
        current_key = key
        data[key] = [] if value == "" else clean_scalar(value)

    return data, body


def read_notes(vault: Path) -> list[Note]:
    notes: list[Note] = []
    for path in vault.rglob("*.md"):
        if any(part in {".git", ".obsidian", ".trash", "AGENTS"} for part in path.parts):
            continue
        try:
            text = path.read_text(encoding="utf-8-sig")
        except UnicodeDecodeError:
            text = path.read_text(encoding="utf-8", errors="replace")
        frontmatter, body = parse_frontmatter(text)
        rel_path = normalize_path(path.relative_to(vault))
        updated_at = dt.datetime.fromtimestamp(path.stat().st_mtime).isoformat(timespec="seconds")
        notes.append(Note(path=path, rel_path=rel_path, frontmatter=frontmatter, body=body, updated_at=updated_at))
    return notes


def as_text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, bool):
        return "TRUE" if value else "FALSE"
    if isinstance(value, (list, tuple)):
        return ", ".join(as_text(item) for item in value)
    return str(value)


def title_from_note(note: Note) -> str:
    return as_text(note.frontmatter.get("title")) or note.path.stem


def obsidian_link(note: Note) -> str:
    return note.rel_path


def section_sort_value(section: Any, order: Any) -> int:
    section_key = as_text(section)
    base = SECTION_ORDER.get(section_key, 900)
    try:
        return base + int(order)
    except (TypeError, ValueError):
        return base


def topic_rows(notes: list[Note], curriculum_topic_map: dict[str, list[str]]) -> list[dict[str, Any]]:
    rows = []
    for note in notes:
        fm = note.frontmatter
        if fm.get("type") != "curriculum_topic":
            continue
        topic_id = as_text(fm.get("topic_id"))
        rows.append(
            {
                "topic_id": topic_id,
                "program_id": ", ".join(curriculum_topic_map.get(topic_id, [])),
                "subject": as_text(fm.get("subject")),
                "section": as_text(fm.get("section")),
                "topic_name": title_from_note(note),
                "order_index": section_sort_value(fm.get("section"), fm.get("order")),
                "estimated_lessons": as_text(fm.get("duration_lessons")),
                "prerequisites": as_text(fm.get("prerequisites")),
                "mandatory": "TRUE",
                "materials_ready": as_text(fm.get("materials_ready")),
                "student_visible": as_text(fm.get("student_visible")),
                "parent_visible": as_text(fm.get("parent_visible")),
                "obsidian_file": obsidian_link(note),
                "public_link": as_text(fm.get("public_link")),
                "updated_at": note.updated_at,
            }
        )
    return sorted(rows, key=lambda row: (row["subject"], row["order_index"], row["topic_id"]))


def curriculum_rows(notes: list[Note], program_topic_counts: dict[str, int], program_lesson_counts: dict[str, int]) -> list[dict[str, Any]]:
    rows = []
    for note in notes:
        fm = note.frontmatter
        if fm.get("type") != "curriculum":
            continue
        program_id = as_text(fm.get("curriculum_id") or fm.get("program_id"))
        rows.append(
            {
                "program_id": program_id,
                "program_name": as_text(fm.get("program_name")) or note.path.stem,
                "subject": as_text(fm.get("subject")),
                "level": as_text(fm.get("level") or fm.get("grade")),
                "format": as_text(fm.get("format")),
                "academic_year": as_text(fm.get("academic_year")),
                "estimated_lessons": as_text(fm.get("estimated_lessons")) or str(program_lesson_counts.get(program_id, "")),
                "status": as_text(fm.get("status")),
                "obsidian_file": obsidian_link(note),
                "public_link": as_text(fm.get("public_link")),
                "updated_at": note.updated_at,
            }
        )
    return sorted(rows, key=lambda row: row["program_id"])


def find_topic_by_wikilink(link: str, topics_by_stem: dict[str, Note]) -> Note | None:
    link_stem = Path(link).stem
    return topics_by_stem.get(link_stem)


def extract_curriculum_topic_map(notes: list[Note]) -> tuple[dict[str, list[str]], dict[str, int], dict[str, int]]:
    topics_by_stem = {note.path.stem: note for note in notes if note.frontmatter.get("type") == "curriculum_topic"}
    topic_to_programs: dict[str, list[str]] = {}
    program_topic_counts: dict[str, int] = {}
    program_lesson_counts: dict[str, int] = {}

    for note in notes:
        fm = note.frontmatter
        if fm.get("type") != "curriculum":
            continue
        program_id = as_text(fm.get("curriculum_id") or fm.get("program_id"))
        seen_topics: set[str] = set()

        for link in WIKILINK_RE.findall(note.body):
            topic_note = find_topic_by_wikilink(link, topics_by_stem)
            if not topic_note:
                continue
            topic_id = as_text(topic_note.frontmatter.get("topic_id"))
            if not topic_id:
                continue
            seen_topics.add(topic_id)
            topic_to_programs.setdefault(topic_id, [])
            if program_id not in topic_to_programs[topic_id]:
                topic_to_programs[topic_id].append(program_id)

        program_topic_counts[program_id] = len(seen_topics)
        program_lesson_counts[program_id] = sum(
            int(topic.frontmatter.get("duration_lessons") or 0)
            for topic in topics_by_stem.values()
            if as_text(topic.frontmatter.get("topic_id")) in seen_topics
        )

    return topic_to_programs, program_topic_counts, program_lesson_counts


def generic_entity_rows(notes: list[Note], entity_type: str, id_field: str, headers: list[str]) -> list[dict[str, Any]]:
    rows = []
    for note in notes:
        fm = note.frontmatter
        if fm.get("type") != entity_type:
            continue
        row = {header: "" for header in headers}
        for header in headers:
            if header == "obsidian_file":
                row[header] = obsidian_link(note)
            elif header == "updated_at":
                row[header] = note.updated_at
            else:
                row[header] = as_text(fm.get(header))
        if not row.get(id_field):
            row[id_field] = note.path.stem
        rows.append(row)
    return sorted(rows, key=lambda row: row.get(id_field, ""))


def legacy_student_rows(vault: Path, existing_rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    stats_dir = vault / "Репетиторство" / "Шизончик" / "Статистика учеников"
    if not stats_dir.exists():
        return []

    existing_names = {as_text(row.get("full_name")).strip().lower() for row in existing_rows if row.get("full_name")}
    rows: list[dict[str, Any]] = []

    for folder in sorted((path for path in stats_dir.iterdir() if path.is_dir()), key=lambda path: path.name.lower()):
        folder_name = folder.name
        full_name = folder_name.split(",", 1)[0].strip()
        if not full_name or full_name.lower() in existing_names:
            continue

        details = folder_name.split(",", 1)[1].strip() if "," in folder_name else ""
        subject = "physics" if "физ" in details.lower() else ""
        exam = ""
        if "егэ" in details.lower():
            exam = "ЕГЭ"
        elif "огэ" in details.lower():
            exam = "ОГЭ"

        rel_path = normalize_path(folder.relative_to(vault))
        digest = hashlib.sha1(rel_path.encode("utf-8")).hexdigest()[:8].upper()
        latest_mtime = max((file.stat().st_mtime for file in folder.rglob("*") if file.is_file()), default=folder.stat().st_mtime)
        rows.append(
            {
                "student_id": f"ST-LEGACY-{digest}",
                "full_name": full_name,
                "short_name": full_name.split()[0],
                "subject": subject,
                "grade": "",
                "format": "",
                "group_id": "",
                "program_id": "",
                "parent_name": "",
                "parent_telegram_id": "",
                "student_telegram_id": "",
                "obsidian_file": rel_path,
                "start_date": "",
                "target": details,
                "exam": exam,
                "target_score": "",
                "status": "Активный",
                "access_student": "FALSE",
                "access_parent": "FALSE",
                "updated_at": dt.datetime.fromtimestamp(latest_mtime).isoformat(timespec="seconds"),
                "sync_status": "legacy_inferred_from_folder",
            }
        )
    return rows


def settings_rows(vault: Path, export_dir: Path) -> list[dict[str, Any]]:
    rows = [
        {"key": "obsidian_vault_path", "value": normalize_path(vault), "description": "Корень Obsidian vault; первичный источник данных."},
        {"key": "obsidian_students_path", "value": "Репетиторство/Шизончик/Статистика учеников", "description": "Карточки и история учеников по физике."},
        {"key": "obsidian_curriculum_path", "value": "Репетиторство/Шизончик/Базы", "description": "Markdown-программы и Obsidian Bases."},
        {"key": "obsidian_topics_path", "value": "Репетиторство/Шизончик/Теория", "description": "Темы учебной программы по физике."},
        {"key": "obsidian_groups_path", "value": "Репетиторство/Шизончик/Группы", "description": "Будущие заметки групп."},
        {"key": "obsidian_lessons_path", "value": "Репетиторство/Шизончик/Занятия", "description": "Будущие заметки расписания и проведенных занятий."},
        {"key": "default_subject", "value": "physics", "description": "Предмет по умолчанию для текущего Spreadsheet."},
        {"key": "sync_direction", "value": "obsidian_to_sheets", "description": "При конфликте побеждает Obsidian."},
        {"key": "last_full_sync_at", "value": dt.datetime.now().isoformat(timespec="seconds"), "description": "Время последней полной сборки данных."},
        {"key": "timezone", "value": "Asia/Yekaterinburg", "description": "Часовой пояс расписания."},
        {"key": "academic_year", "value": "2026-2027", "description": "Учебный год по умолчанию."},
        {"key": "local_export_dir", "value": normalize_path(export_dir), "description": "Папка CSV-экспорта для проверки."},
    ]
    for dictionary_name, values in STATUS_DICTIONARIES.items():
        rows.append({"key": dictionary_name, "value": ", ".join(values), "description": "Допустимые значения статуса."})
    return rows


def build_tables(vault: Path, export_dir: Path) -> dict[str, list[dict[str, Any]]]:
    notes = read_notes(vault)
    topic_program_map, program_topic_counts, program_lesson_counts = extract_curriculum_topic_map(notes)

    tables: dict[str, list[dict[str, Any]]] = {name: [] for name in SHEET_ORDER}
    tables["00_Настройки"] = settings_rows(vault, export_dir)
    explicit_students = generic_entity_rows(notes, "student", "student_id", HEADERS["01_Ученики"])
    tables["01_Ученики"] = sorted(
        explicit_students + legacy_student_rows(vault, explicit_students),
        key=lambda row: as_text(row.get("full_name")).lower(),
    )
    tables["02_Группы"] = generic_entity_rows(notes, "group", "group_id", HEADERS["02_Группы"])
    tables["03_Программы"] = curriculum_rows(notes, program_topic_counts, program_lesson_counts)
    tables["04_Темы"] = topic_rows(notes, topic_program_map)
    tables["05_Расписание"] = generic_entity_rows(notes, "lesson", "lesson_id", HEADERS["05_Расписание"])
    tables["06_Занятия"] = generic_entity_rows(notes, "lesson", "lesson_id", HEADERS["06_Занятия"])
    tables["07_Прогресс"] = generic_entity_rows(notes, "progress", "progress_id", HEADERS["07_Прогресс"])
    tables["08_Домашние_задания"] = generic_entity_rows(notes, "homework", "homework_id", HEADERS["08_Домашние_задания"])
    tables["09_Посещаемость"] = generic_entity_rows(notes, "attendance", "attendance_id", HEADERS["09_Посещаемость"])
    tables["10_Контрольные"] = generic_entity_rows(notes, "test_result", "test_id", HEADERS["10_Контрольные"])
    tables["11_KPI"] = generic_entity_rows(notes, "kpi", "student_id", HEADERS["11_KPI"])

    tables["14_Журнал_синхронизации"] = [
        {
            "sync_id": f"SYNC-{dt.datetime.now().strftime('%Y%m%d-%H%M%S')}",
            "timestamp": dt.datetime.now().isoformat(timespec="seconds"),
            "entity_type": "vault",
            "entity_id": normalize_path(vault),
            "source": "Obsidian",
            "target": "Google Sheets CSV export",
            "operation": "full_sync",
            "old_value": "",
            "new_value": f"{len(tables['03_Программы'])} programs, {len(tables['04_Темы'])} topics",
            "status": "ok",
            "error_message": "",
        }
    ]
    return tables


def table_to_matrix(sheet_name: str, rows: list[dict[str, Any]]) -> list[list[str]]:
    headers = HEADERS[sheet_name]
    matrix = [headers]
    for row in rows:
        matrix.append([as_text(row.get(header, "")) for header in headers])
    return matrix


def write_csv_export(tables: dict[str, list[dict[str, Any]]], export_dir: Path) -> None:
    export_dir.mkdir(parents=True, exist_ok=True)
    for sheet_name in SHEET_ORDER:
        csv_path = export_dir / f"{sheet_name}.csv"
        with csv_path.open("w", encoding="utf-8-sig", newline="") as file:
            writer = csv.writer(file)
            writer.writerows(table_to_matrix(sheet_name, tables[sheet_name]))


def sync_to_google(tables: dict[str, list[dict[str, Any]]], spreadsheet_id: str, credentials: Path) -> None:
    try:
        import gspread
        from google.oauth2.service_account import Credentials
    except ImportError as exc:
        raise SystemExit(
            "Для записи в Google Sheets установи зависимости: "
            "python -m pip install -r tools/google_sheets/requirements.txt"
        ) from exc

    scopes = ["https://www.googleapis.com/auth/spreadsheets"]
    creds = Credentials.from_service_account_file(str(credentials), scopes=scopes)
    client = gspread.authorize(creds)
    spreadsheet = client.open_by_key(spreadsheet_id)

    for index, sheet_name in enumerate(SHEET_ORDER):
        existing = {worksheet.title: worksheet for worksheet in spreadsheet.worksheets()}
        matrix = table_to_matrix(sheet_name, tables[sheet_name])
        rows = max(len(matrix) + 10, 50)
        cols = max(len(matrix[0]) + 2, 10)

        worksheet = existing.get(sheet_name)
        if worksheet is None:
            worksheet = retry_google_write(lambda: spreadsheet.add_worksheet(title=sheet_name, rows=rows, cols=cols, index=index))
        else:
            retry_google_write(lambda: worksheet.resize(rows=rows, cols=cols))
            retry_google_write(worksheet.clear)
        retry_google_write(lambda: worksheet.update(range_name="A1", values=matrix, value_input_option="USER_ENTERED"))
        format_worksheet(spreadsheet, worksheet, len(matrix[0]))


def retry_google_write(action: Any, attempts: int = 5) -> Any:
    for attempt in range(1, attempts + 1):
        try:
            return action()
        except Exception as exc:
            message = str(exc)
            if "429" not in message and "Quota exceeded" not in message:
                raise
            if attempt == attempts:
                raise
            sleep_seconds = min(75, 10 * attempt)
            print(f"Google Sheets quota pause: waiting {sleep_seconds}s before retry {attempt + 1}/{attempts}.")
            time.sleep(sleep_seconds)


def format_worksheet(spreadsheet: Any, worksheet: Any, column_count: int) -> None:
    sheet_id = worksheet.id
    requests = [
        {
            "updateSheetProperties": {
                "properties": {"sheetId": sheet_id, "gridProperties": {"frozenRowCount": 1}},
                "fields": "gridProperties.frozenRowCount",
            }
        },
        {
            "repeatCell": {
                "range": {"sheetId": sheet_id, "startRowIndex": 0, "endRowIndex": 1},
                "cell": {
                    "userEnteredFormat": {
                        "textFormat": {"bold": True},
                        "backgroundColor": {"red": 0.88, "green": 0.92, "blue": 0.96},
                    }
                },
                "fields": "userEnteredFormat(textFormat,backgroundColor)",
            }
        },
        {
            "setBasicFilter": {
                "filter": {
                    "range": {
                        "sheetId": sheet_id,
                        "startRowIndex": 0,
                        "startColumnIndex": 0,
                        "endColumnIndex": column_count,
                    }
                }
            }
        },
        {
            "autoResizeDimensions": {
                "dimensions": {
                    "sheetId": sheet_id,
                    "dimension": "COLUMNS",
                    "startIndex": 0,
                    "endIndex": column_count,
                }
            }
        },
    ]
    retry_google_write(lambda: spreadsheet.batch_update({"requests": requests}))


def load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8-sig").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def parse_args(argv: Iterable[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Sync Obsidian curriculum data to Google Sheets.")
    parser.add_argument("--vault", default=os.environ.get("OBSIDIAN_VAULT_PATH") or ".", help="Path to Obsidian vault.")
    parser.add_argument(
        "--export-dir",
        default=os.environ.get("SHEETS_EXPORT_DIR") or "Репетиторство/Шизончик/Google Sheets Export",
        help="Folder for local CSV previews.",
    )
    parser.add_argument("--spreadsheet-id", default=os.environ.get("GOOGLE_SPREADSHEET_ID"), help="Google Spreadsheet ID.")
    parser.add_argument("--credentials", default=os.environ.get("GOOGLE_SERVICE_ACCOUNT_FILE"), help="Service account JSON file.")
    parser.add_argument("--csv-only", action="store_true", help="Only write CSV files; do not call Google Sheets API.")
    parser.add_argument("--dry-run", action="store_true", help="Build tables and print counts without writing.")
    return parser.parse_args(list(argv))


def main(argv: Iterable[str] = sys.argv[1:]) -> int:
    load_env_file(Path(".env"))
    args = parse_args(argv)
    vault = Path(args.vault).resolve()
    export_dir = (vault / args.export_dir).resolve() if not Path(args.export_dir).is_absolute() else Path(args.export_dir).resolve()

    if not vault.exists():
        raise SystemExit(f"Vault path does not exist: {vault}")

    tables = build_tables(vault, export_dir)
    counts = ", ".join(f"{name}: {len(tables[name])}" for name in SHEET_ORDER)
    print(f"Built tables from Obsidian: {counts}")

    if args.dry_run:
        return 0

    write_csv_export(tables, export_dir)
    print(f"CSV export written to: {export_dir}")

    if args.csv_only:
        return 0

    if not args.spreadsheet_id or not args.credentials:
        print("Google Sheets sync skipped: pass --spreadsheet-id and --credentials, or use --csv-only.")
        return 0

    sync_to_google(tables, args.spreadsheet_id, Path(args.credentials))
    print("Google Sheets sync completed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
