# TimeGen

A browser-based academic timetable generator that runs entirely on the client.

TimeGen accepts student, faculty, course, and room JSON data, then builds a schedule with hard conflict checks and soft preference scoring. It is designed as a lightweight, dependency-free project that can be opened directly from the repository.

## Features

- Constraint-aware timetable generation in the browser
- Student/course overlap avoidance
- Faculty double-booking prevention
- Faculty unavailability handling
- Room capacity and lab requirements
- Faculty day/time preference scoring
- Optional daily-load balancing
- Filters by faculty, room, or batch
- Live solver-progress visualization
- JSON, CSV, and Excel-compatible XML exports
- Print / browser PDF workflow
- Bundled sample data
- No backend and no third-party runtime dependencies

## Run it

No build step is required.

Open `index.html` in a modern browser, then choose **Use sample data** for an immediate demonstration.

For a local web server, either use any static-file server or run:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://127.0.0.1:8000/
```

## Using your own data

The application accepts four JSON datasets. You can use the included `students.json`, `faculty.json`, `courses.json`, and `rooms.json` as a starting point.

### students.json

```json
{
  "students": [
    {
      "id": "S001",
      "name": "Student Name",
      "batch": "CSE-A",
      "courses": ["CS301", "CS302"]
    }
  ]
}
```

Each student's `courses` array contains course IDs.

### faculty.json

```json
{
  "faculty": [
    {
      "id": "FAC001",
      "name": "Faculty Name",
      "courses": ["CS301"],
      "preferences": {
        "preferred_days": ["Monday", "Tuesday"],
        "preferred_time_slots": ["09:00 - 10:00"],
        "max_classes_per_day": 3
      },
      "unavailability": [
        {
          "day": "Thursday",
          "time": "02:00 - 05:00",
          "reason": "Meeting"
        }
      ]
    }
  ]
}
```

Time values are normalized by the application. In the included academic fixture, `02:00 - 05:00` is interpreted as afternoon time.

### courses.json

```json
{
  "courses": [
    {
      "id": "CS301",
      "name": "Data Structures",
      "hours_per_week": 4,
      "requires_lab": true,
      "preferred_rooms": ["Lab-201"]
    }
  ]
}
```

`hours_per_week` controls how many one-hour sessions are requested.

### rooms.json

```json
{
  "rooms": [
    {
      "id": "Lab-201",
      "name": "Lab-201",
      "capacity": 30,
      "type": "lab"
    }
  ]
}
```

Courses marked with `requires_lab: true` are only placed into rooms whose type contains `lab`.

## Scheduling model

TimeGen uses a deterministic greedy heuristic with preference scoring rather than a machine-learning model.

Hard constraints are checked first:

1. A faculty member cannot teach two sessions at the same time.
2. A student cannot attend two courses at the same time.
3. A room cannot host two sessions at the same time.
4. A faculty member's unavailable periods are respected.
5. Room capacity and lab requirements must be satisfied.

Then the scheduler scores feasible slots using soft preferences such as preferred faculty days/times, preferred rooms, spreading a course across days, and optional daily-load balancing.

Because it is a heuristic, difficult or over-constrained datasets may contain unscheduled sessions. The interface reports those sessions instead of claiming a perfect schedule.

## Filters and exports

After generation, the timetable can be filtered by:

- Faculty
- Room
- Student batch

Available exports:

- **JSON** — complete schedule plus generation metadata
- **CSV** — tabular session data
- **Excel-compatible XML** — opens in spreadsheet applications
- **Print / PDF** — uses the browser print dialog

## Security and privacy

The application is local-first:

- Input files are read in the browser and are not uploaded by TimeGen.
- No remote API is required.
- User-supplied names and other values are inserted with DOM text APIs rather than HTML interpolation.
- Input files are limited to 2 MiB each.
- Large datasets are bounded to prevent unreasonably large in-memory inputs.

For sensitive institutional data, use the application on a trusted device and avoid publishing the input JSON files publicly.

## Repository structure

```text
timegen/
├── index.html
├── style.css
├── script.js
├── algorithm-visualization.js
├── students.json
├── faculty.json
├── courses.json
├── rooms.json
└── LICENSE
```

## Notes

This project intentionally has no build system or package manager requirements. It is a static browser application.

The repository previously contained a larger set of claims that were not backed by committed source files. The current README documents only functionality that is actually present in the repository.

## License

MIT License. See [LICENSE](LICENSE).
