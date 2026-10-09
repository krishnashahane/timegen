(() => {
  'use strict';

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const SLOTS = [
    ['08:00', '09:00'], ['09:00', '10:00'], ['10:00', '11:00'],
    ['11:00', '12:00'], ['12:00', '13:00'],
    ['14:00', '15:00'], ['15:00', '16:00'], ['16:00', '17:00']
  ];
  const MAX_FILE_BYTES = 2 * 1024 * 1024;
  const MAX_RECORDS = 5000;

  const state = {
    data: null,
    schedule: [],
    filtered: [],
    algorithmData: null,
    visualization: null,
    step: 1,
    filterType: 'all',
    filterValue: '',
  };

  const SAMPLE = {
    students: [
      { id: 'S001', name: 'Aarav', batch: 'CSE-A', courses: ['CS301', 'CS302', 'CS303', 'IT301', 'SKILL101'] },
      { id: 'S002', name: 'Diya', batch: 'CSE-A', courses: ['CS301', 'CS302', 'CS303', 'IT301', 'SKILL101'] },
      { id: 'S003', name: 'Vihaan', batch: 'CSE-A', courses: ['CS301', 'CS302', 'CS303', 'IT301', 'SKILL101'] },
      { id: 'S004', name: 'Anaya', batch: 'CSE-B', courses: ['CS301', 'CS304', 'CS401', 'IT302', 'MINOR201'] },
      { id: 'S005', name: 'Kabir', batch: 'CSE-B', courses: ['CS301', 'CS304', 'CS401', 'IT302', 'MINOR201'] },
      { id: 'S006', name: 'Sara', batch: 'CSE-B', courses: ['CS301', 'CS304', 'CS401', 'IT302', 'MINOR201'] }
    ],
    courses: [
      { id: 'CS301', name: 'Data Structures', department: 'Computer Science', credits: 4, hours_per_week: 4, requires_lab: true, preferred_rooms: ['Lab-201'] },
      { id: 'CS302', name: 'Database Systems', department: 'Computer Science', credits: 4, hours_per_week: 4, requires_lab: true, preferred_rooms: ['Lab-201', 'Lab-202'] },
      { id: 'CS303', name: 'Computer Networks', department: 'Computer Science', credits: 4, hours_per_week: 4, requires_lab: true, preferred_rooms: ['Lab-203'] },
      { id: 'CS304', name: 'Operating Systems', department: 'Computer Science', credits: 4, hours_per_week: 4, requires_lab: true, preferred_rooms: ['Lab-202'] },
      { id: 'CS401', name: 'Artificial Intelligence', department: 'Computer Science', credits: 4, hours_per_week: 4, requires_lab: true, preferred_rooms: ['Lab-201'] },
      { id: 'IT301', name: 'Web Technologies', department: 'Information Technology', credits: 4, hours_per_week: 4, requires_lab: true, preferred_rooms: ['Lab-203'] },
      { id: 'IT302', name: 'Software Engineering', department: 'Information Technology', credits: 4, hours_per_week: 4, requires_lab: false, preferred_rooms: ['LH-106'] },
      { id: 'MINOR201', name: 'Data Science', department: 'Computer Science', credits: 3, hours_per_week: 3, requires_lab: false, preferred_rooms: ['LH-104'] },
      { id: 'SKILL101', name: 'Python Programming', department: 'Computer Science', credits: 2, hours_per_week: 2, requires_lab: true, preferred_rooms: ['Lab-201', 'Lab-202'] }
    ],
    faculty: [
      { id: 'FAC001', name: 'Dr. Rajesh Sharma', department: 'Computer Science', courses: ['CS301', 'CS401'], preferences: { preferred_days: ['Monday', 'Tuesday', 'Wednesday'], preferred_time_slots: ['08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00'], max_classes_per_day: 3 }, unavailability: [] },
      { id: 'FAC002', name: 'Prof. Meena Gupta', department: 'Computer Science', courses: ['CS302', 'SKILL101'], preferences: { preferred_days: ['Monday', 'Wednesday', 'Friday'], preferred_time_slots: ['11:00 - 12:00', '12:00 - 13:00', '14:00 - 15:00'], max_classes_per_day: 3 }, unavailability: [] },
      { id: 'FAC003', name: 'Dr. Amit Kumar', department: 'Computer Science', courses: ['CS303', 'CS304', 'MINOR201'], preferences: { preferred_days: ['Tuesday', 'Thursday', 'Friday'], preferred_time_slots: ['09:00 - 10:00', '10:00 - 11:00', '15:00 - 16:00', '16:00 - 17:00'], max_classes_per_day: 4 }, unavailability: [] },
      { id: 'FAC004', name: 'Prof. Sanjay Singh', department: 'Information Technology', courses: ['IT301'], preferences: { preferred_days: ['Monday', 'Tuesday', 'Wednesday'], preferred_time_slots: ['08:00 - 09:00', '09:00 - 10:00', '14:00 - 15:00'], max_classes_per_day: 3 }, unavailability: [] },
      { id: 'FAC005', name: 'Dr. Priya Verma', department: 'Information Technology', courses: ['IT302'], preferences: { preferred_days: ['Wednesday', 'Thursday', 'Friday'], preferred_time_slots: ['10:00 - 11:00', '11:00 - 12:00', '15:00 - 16:00'], max_classes_per_day: 3 }, unavailability: [] }
    ],
    rooms: [
      { id: 'LH-104', name: 'LH-104', capacity: 40, type: 'lecture' },
      { id: 'LH-106', name: 'LH-106', capacity: 40, type: 'lecture' },
      { id: 'Lab-201', name: 'Lab-201', capacity: 30, type: 'lab' },
      { id: 'Lab-202', name: 'Lab-202', capacity: 30, type: 'lab' },
      { id: 'Lab-203', name: 'Lab-203', capacity: 30, type: 'lab' }
    ]
  };

  const $ = (id) => document.getElementById(id);

  function setStatus(message, type = '') {
    const el = $('statusMessage');
    if (!el) return;
    el.textContent = message;
    el.className = 'status' + (type ? ' ' + type : '');
  }

  function normalizeArray(value, label) {
    if (!Array.isArray(value)) throw new Error(label + ' must be an array');
    if (value.length > MAX_RECORDS) throw new Error(label + ' exceeds ' + MAX_RECORDS + ' records');
    return value;
  }

  function normalizeData(raw, source) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error(source + ' must contain a JSON object');
    const students = normalizeArray(raw.students ?? raw.studentChoices ?? [], 'students');
    const faculty = normalizeArray(raw.faculty ?? [], 'faculty');
    const courses = normalizeArray(raw.courses ?? [], 'courses');
    const rooms = normalizeArray(raw.rooms ?? [], 'rooms');
    if (!courses.length) throw new Error('Courses data is required');
    if (!faculty.length) throw new Error('Faculty data is required');
    if (!rooms.length) throw new Error('Rooms data is required');
    const cleanStudents = students.map((s, i) => ({
      id: String(s.id ?? 'student-' + (i + 1)),
      name: String(s.name ?? 'Student ' + (i + 1)),
      batch: String(s.batch ?? 'General'),
      courses: Array.isArray(s.courses) ? s.courses.map(String) : []
    }));
    const cleanFaculty = faculty.map((f, i) => ({
      id: String(f.id ?? 'faculty-' + (i + 1)),
      name: String(f.name ?? 'Faculty ' + (i + 1)),
      courses: Array.isArray(f.courses) ? f.courses.map(String) : [],
      preferences: f.preferences && typeof f.preferences === 'object' ? {
        ...f.preferences,
        preferred_time_slots: Array.isArray(f.preferences.preferred_time_slots)
          ? f.preferences.preferred_time_slots.map((slot) => {
              const range = canonicalRange(slot);
              return range ? range[0] + ' - ' + range[1] : String(slot);
            })
          : []
      } : {},
      unavailability: Array.isArray(f.unavailability) ? f.unavailability : []
    }));
    const cleanCourses = courses.map((c, i) => ({
      id: String(c.id ?? 'course-' + (i + 1)),
      name: String(c.name ?? c.title ?? 'Course ' + (i + 1)),
      hours: Math.max(1, Math.min(6, Number(c.hours_per_week ?? c.hours ?? 1) || 1)),
      requiresLab: Boolean(c.requires_lab ?? c.requiresLab),
      preferredRooms: Array.isArray(c.preferred_rooms) ? c.preferred_rooms.map(String) : []
    }));
    const cleanRooms = rooms.map((r, i) => ({
      id: String(r.id ?? r.name ?? 'room-' + (i + 1)),
      name: String(r.name ?? r.id ?? 'Room ' + (i + 1)),
      capacity: Math.max(1, Number(r.capacity ?? 9999) || 9999),
      type: String(r.type ?? ((r.name ?? '').toLowerCase().includes('lab') ? 'lab' : 'lecture'))
    }));
    return { students: cleanStudents, faculty: cleanFaculty, courses: cleanCourses, rooms: cleanRooms };
  }

  async function readJsonFile(file, label) {
    if (!file) throw new Error(label + ' file is required');
    if (file.size > MAX_FILE_BYTES) throw new Error(label + ' file is larger than 2 MiB');
    const raw = await file.text();
    try {
      return JSON.parse(raw);
    } catch {
      throw new Error(label + ' is not valid JSON');
    }
  }

  function slotLabel(slot) {
    return slot[0] + ' - ' + slot[1];
  }

  function minutes(value) {
    const [h, m] = value.split(':').map(Number);
    return h * 60 + m;
  }

  function overlaps(aStart, aEnd, bStart, bEnd) {
    return minutes(aStart) < minutes(bEnd) && minutes(bStart) < minutes(aEnd);
  }

  function facultyUnavailable(faculty, day, slot) {
    return faculty.unavailability.some((item) => {
      if (String(item.day) !== day) return false;
      const range = canonicalRange(item.time ?? '');
      if (!range) return false;
      return overlaps(slot[0], slot[1], range[0], range[1]);
    });
  }

  function assignedFaculty(courseId, faculty) {
    return faculty.find((f) => f.courses.includes(courseId)) ?? null;
  }

  function enrolledStudents(courseId, students) {
    return students.filter((s) => s.courses.includes(courseId));
  }

  function candidateRooms(course, rooms, count, occupied, day, slot) {
    return rooms
      .filter((room) => room.capacity >= Math.max(1, count))
      .filter((room) => course.requiresLab ? room.type.toLowerCase().includes('lab') : true)
      .filter((room) => !occupied.has(day + '|' + slotLabel(slot) + '|' + room.id))
      .sort((a, b) => {
        const ap = course.preferredRooms.includes(a.id) ? 1 : 0;
        const bp = course.preferredRooms.includes(b.id) ? 1 : 0;
        if (ap !== bp) return bp - ap;
        return a.capacity - b.capacity;
      });
  }

  function scheduleTimetable(data, preferences) {
    const studentsByCourse = new Map(data.courses.map((course) => [course.id, enrolledStudents(course.id, data.students)]));
    const offerings = data.courses
      .filter((course) => {
        const count = studentsByCourse.get(course.id)?.length ?? 0;
        return data.students.length ? count > 0 : true;
      })
      .map((course) => ({
        course,
        faculty: assignedFaculty(course.id, data.faculty),
        attendees: studentsByCourse.get(course.id) ?? [],
        sessions: course.hours
      }));

    const studentBusy = new Map();
    const facultyBusy = new Map();
    const roomBusy = new Set();
    const courseDayCounts = new Map();
    const scheduled = [];
    const unscheduled = [];
    const iterations = [];
    let placed = 0;

    const hardOrder = [...offerings].sort((a, b) => {
      const aDifficulty = a.attendees.length * 2 + (a.course.requiresLab ? 3 : 0) + (a.faculty ? 0 : 5);
      const bDifficulty = b.attendees.length * 2 + (b.course.requiresLab ? 3 : 0) + (b.faculty ? 0 : 5);
      return bDifficulty - aDifficulty;
    });

    for (const offering of hardOrder) {
      const usedDays = new Set();
      for (let occurrence = 0; occurrence < offering.sessions; occurrence += 1) {
        let best = null;

        for (const day of DAYS) {
          for (const slot of SLOTS) {
            if (preferences.avoidLunch && slot[0] === '12:00' && slot[1] === '13:00') continue;
            const key = day + '|' + slotLabel(slot);
            const faculty = offering.faculty;
            if (faculty && facultyUnavailable(faculty, day, slot)) continue;

            const facultyKey = faculty?.id + '|' + key;
            if (faculty && facultyBusy.has(facultyKey)) continue;

            let studentConflict = false;
            for (const student of offering.attendees) {
              if (studentBusy.has(student.id + '|' + key)) {
                studentConflict = true;
                break;
              }
            }
            if (studentConflict) continue;

            const rooms = candidateRooms(offering.course, data.rooms, offering.attendees.length || 1, roomBusy, day, slot);
            if (!rooms.length) continue;

            let score = 0;
            if (preferences.optimizeFaculty && faculty) {
              const preferredDays = Array.isArray(faculty.preferences.preferred_days) ? faculty.preferences.preferred_days : [];
              const preferredSlots = Array.isArray(faculty.preferences.preferred_time_slots) ? faculty.preferences.preferred_time_slots : [];
              if (preferredDays.includes(day)) score += 24;
              if (preferredSlots.includes(slotLabel(slot))) score += 28;
              const maxDay = Number(faculty.preferences.max_classes_per_day ?? 999);
              const dailyCount = scheduled.filter((x) => x.facultyId === faculty.id && x.day === day).length;
              score -= Math.max(0, dailyCount - maxDay + 1) * 10;
            }
            const room = rooms[0];
            if (room && offering.course.preferredRooms.includes(room.id)) score += 12;
            if (!usedDays.has(day)) score += 8;
            const dailyStudentLoad = offering.attendees.reduce((sum, student) => {
              return sum + scheduled.filter((x) => x.day === day && x.studentIds.includes(student.id)).length;
            }, 0);
            if (preferences.balance) score -= dailyStudentLoad * 2;

            const dayCourseKey = offering.course.id + '|' + day;
            score -= (courseDayCounts.get(dayCourseKey) ?? 0) * 10;

            if (!best || score > best.score) {
              best = { day, slot, room, score };
            }
          }
        }

        if (!best) {
          unscheduled.push({
            courseId: offering.course.id,
            reason: 'No available slot satisfies the current hard constraints.'
          });
          iterations.push({
            iteration: iterations.length,
            fitness: placed / Math.max(1, offerings.reduce((sum, o) => sum + o.sessions, 0)),
            conflicts: 1,
            temperature: Math.max(0.05, 1 - iterations.length / 100)
          });
          continue;
        }

        const slotKey = best.day + '|' + slotLabel(best.slot);
        scheduled.push({
          courseId: offering.course.id,
          courseName: offering.course.name,
          day: best.day,
          start: best.slot[0],
          end: best.slot[1],
          roomId: best.room.id,
          roomName: best.room.name,
          facultyId: offering.faculty?.id ?? '',
          facultyName: offering.faculty?.name ?? 'Unassigned',
          studentIds: offering.attendees.map((s) => s.id),
          batchNames: [...new Set(offering.attendees.map((s) => s.batch))],
          score: best.score
        });
        placed += 1;
        usedDays.add(best.day);
        courseDayCounts.set(offering.course.id + '|' + best.day, (courseDayCounts.get(offering.course.id + '|' + best.day) ?? 0) + 1);
        if (offering.faculty) facultyBusy.set(offering.faculty.id + '|' + slotKey, true);
        for (const student of offering.attendees) studentBusy.set(student.id + '|' + slotKey, true);
        roomBusy.add(best.day + '|' + slotLabel(best.slot) + '|' + best.room.id);

        iterations.push({
          iteration: iterations.length,
          fitness: placed / Math.max(1, offerings.reduce((sum, o) => sum + o.sessions, 0)),
          conflicts: 0,
          temperature: Math.max(0.05, 1 - iterations.length / 100)
        });
      }
    }

    const required = offerings.reduce((sum, o) => sum + o.sessions, 0);
    const facultyPreferred = scheduled.filter((x) => {
      const f = data.faculty.find((item) => item.id === x.facultyId);
      if (!f) return false;
      const days = Array.isArray(f.preferences.preferred_days) ? f.preferences.preferred_days : [];
      const slots = Array.isArray(f.preferences.preferred_time_slots) ? f.preferences.preferred_time_slots : [];
      return days.includes(x.day) || slots.includes(x.start + ' - ' + x.end);
    }).length;
    const facultyScore = scheduled.length ? facultyPreferred / scheduled.length : 0;
    const roomScore = scheduled.length ? scheduled.filter((x) => x.roomId).length / scheduled.length : 0;

    let studentConflicts = 0;
    for (const student of data.students) {
      const seen = new Set();
      for (const x of scheduled) {
        if (!x.studentIds.includes(student.id)) continue;
        const k = x.day + '|' + x.start + '|' + x.end;
        if (seen.has(k)) studentConflicts += 1;
        seen.add(k);
      }
    }
    const facultyConflicts = scheduled.length - new Set(scheduled.map((x) => x.facultyId + '|' + x.day + '|' + x.start)).size;
    const roomConflicts = scheduled.length - new Set(scheduled.map((x) => x.roomId + '|' + x.day + '|' + x.start)).size;

    iterations.push({
      iteration: iterations.length,
      fitness: required ? placed / required : 1,
      conflicts: studentConflicts + facultyConflicts + roomConflicts,
      temperature: 0.01
    });

    return {
      scheduled,
      unscheduled,
      algorithmData: {
        constraints: [
          { type: 'faculty', weight: 1 },
          { type: 'student', weight: 1 },
          { type: 'room', weight: 1 },
          { type: 'time', weight: 1 }
        ],
        iterations,
        solution: {
          fitness: required ? placed / required : 1,
          conflicts: studentConflicts + facultyConflicts + roomConflicts,
          executionTime: 'client-side',
          constraintSatisfaction: {
            faculty: scheduled.length ? Math.max(0, 1 - facultyConflicts / scheduled.length) : 1,
            student: data.students.length ? Math.max(0, 1 - studentConflicts / Math.max(1, scheduled.length)) : 1,
            room: scheduled.length ? Math.max(0, 1 - roomConflicts / scheduled.length) : 1,
            time: required ? placed / required : 1
          }
        }
      },
      meta: { required, placed, facultyScore, roomScore, studentConflicts, facultyConflicts, roomConflicts, courseCount: courseById.size }
    };
  }

  function updateUploadStatus(id, ok, message) {
    const el = $(id);
    if (!el) return;
    el.textContent = message;
    el.className = 'upload-status ' + (ok ? 'status-ok' : 'status-error');
  }

  async function loadFiles() {
    try {
      const [students, faculty, courses, rooms] = await Promise.all([
        readJsonFile($('studentFile').files[0], 'Students'),
        readJsonFile($('facultyFile').files[0], 'Faculty'),
        readJsonFile($('courseFile').files[0], 'Courses'),
        readJsonFile($('roomFile').files[0], 'Rooms')
      ]);
      state.data = normalizeData({ students: students.students ?? students, faculty: faculty.faculty ?? faculty, courses: courses.courses ?? courses, rooms: rooms.rooms ?? rooms }, 'Input data');
      updateUploadStatus('studentUploadStatus', true, state.data.students.length + ' students loaded');
      updateUploadStatus('facultyUploadStatus', true, state.data.faculty.length + ' faculty loaded');
      updateUploadStatus('courseUploadStatus', true, state.data.courses.length + ' courses loaded');
      updateUploadStatus('roomUploadStatus', true, state.data.rooms.length + ' rooms loaded');
      setStatus('Data validated. Ready to generate.', 'success');
      return true;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error), 'error');
      return false;
    }
  }

  function showStep(step) {
    state.step = step;
    ['step2', 'step3', 'step4'].forEach((id) => $(id)?.classList.add('hidden'));
    if (step > 1) $('step' + step)?.classList.remove('hidden');
  }

  function renderFilterValues() {
    const select = $('filterValue');
    const type = $('viewFilter').value;
    state.filterType = type;
    select.replaceChildren();
    const values = type === 'all'
      ? []
      : [...new Set(state.schedule.flatMap((x) => type === 'faculty' ? [x.facultyName] : type === 'room' ? [x.roomName] : x.batchNames))].sort();
    const all = document.createElement('option');
    all.value = '';
    all.textContent = type === 'all' ? 'All' : 'Select value';
    select.appendChild(all);
    values.forEach((value) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
    select.disabled = type === 'all' || values.length === 0;
    state.filterValue = '';
    applyFilter();
  }

  function applyFilter() {
    const type = state.filterType;
    const value = state.filterValue;
    if (type === 'all' || !value) {
      state.filtered = [...state.schedule];
    } else {
      state.filtered = state.schedule.filter((x) => type === 'faculty' ? x.facultyName === value : type === 'room' ? x.roomName === value : x.batchNames.includes(value));
    }
    renderTable();
  }

  function renderTable() {
    const tbody = $('timetable').querySelector('tbody');
    tbody.replaceChildren();
    for (const slot of SLOTS) {
      const row = document.createElement('tr');
      const timeCell = document.createElement('td');
      timeCell.className = 'time-cell';
      timeCell.textContent = slotLabel(slot);
      row.appendChild(timeCell);
      for (const day of DAYS) {
        const td = document.createElement('td');
        const items = state.filtered.filter((x) => x.day === day && x.start === slot[0] && x.end === slot[1]);
        if (!items.length) {
          const empty = document.createElement('span');
          empty.className = 'empty';
          empty.textContent = '—';
          td.appendChild(empty);
        } else {
          items.forEach((item) => {
            const card = document.createElement('div');
            card.className = 'class-card';
            const title = document.createElement('div');
            title.className = 'class-name';
            title.textContent = item.courseName;
            const meta1 = document.createElement('div');
            meta1.className = 'class-meta';
            meta1.textContent = item.courseId + ' · ' + item.facultyName;
            const meta2 = document.createElement('div');
            meta2.className = 'class-meta';
            meta2.textContent = item.roomName + (item.batchNames.length ? ' · ' + item.batchNames.join(', ') : '');
            card.append(title, meta1, meta2);
            td.appendChild(card);
          });
        }
        row.appendChild(td);
      }
      tbody.appendChild(row);
    }
  }

  function percent(value) {
    return Math.round(Math.max(0, Math.min(1, value)) * 100) + '%';
  }

  function updateMetrics(result) {
    const m = result.meta;
    const hard = m.required ? m.placed / m.required : 1;
    $('conflictFreeMetric').textContent = percent(hard);
    $('facultyMetric').textContent = percent(m.facultyScore);
    $('roomMetric').textContent = percent(m.roomScore);
    $('scheduledMetric').textContent = m.placed + ' / ' + m.required;
    const cs = result.algorithmData.solution.constraintSatisfaction;
    for (const [key, value] of Object.entries(cs)) $(key + 'Progress').style.width = percent(value);
    $('facultyConstraint').textContent = result.meta.facultyConflicts + ' faculty overlap conflict(s)';
    $('studentConstraint').textContent = result.meta.studentConflicts + ' student overlap conflict(s)';
    $('roomConstraint').textContent = result.meta.roomConflicts + ' room overlap conflict(s)';
    $('timeConstraint').textContent = result.unscheduled.length + ' session(s) could not be placed';
  }

  function setupVisualization(data) {
    if (!window.AlgorithmVisualization) return;
    if (!state.visualization) state.visualization = new window.AlgorithmVisualization('algorithmVisualization');
    state.visualization.stop();
    state.visualization.setData(data);
    state.visualization.start();
  }

  function generate() {
    if (!state.data) {
      setStatus('Load input data or use the sample dataset first.', 'error');
      return;
    }
    setStatus('Generating timetable locally…');
    $('resultsSection').classList.remove('hidden');
    const preferences = {
      avoidLunch: $('avoidLunchBreakClasses').checked,
      optimizeFaculty: $('optimizeForFacultyPreference').checked,
      balance: $('balanceClassLoad').checked
    };
    const result = scheduleTimetable(state.data, preferences);
    state.schedule = result.scheduled;
    state.algorithmData = result.algorithmData;
    state.filtered = [...state.schedule];
    updateMetrics(result);
    renderFilterValues();
    setupVisualization(result.algorithmData);
    setStatus(
      result.unscheduled.length
        ? 'Generated with ' + result.unscheduled.length + ' unscheduled session(s). Review the constraints below.'
        : 'Timetable generated successfully with all requested sessions placed.',
      result.unscheduled.length ? '' : 'success'
    );
    $('resultsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function download(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportJson() {
    download('timegen-timetable.json', JSON.stringify({
      generatedAt: new Date().toISOString(),
      settings: {
        semester: $('semester').value,
        program: $('program').value
      },
      schedule: state.schedule
    }, null, 2), 'application/json');
  }

  function csvCell(value) {
    const text = String(value ?? '');
    return '"' + text.replace(/"/g, '""') + '"';
  }

  function exportCsv() {
    const rows = [['Course ID', 'Course', 'Day', 'Start', 'End', 'Faculty', 'Room', 'Batches']];
    state.schedule.forEach((x) => rows.push([x.courseId, x.courseName, x.day, x.start, x.end, x.facultyName, x.roomName, x.batchNames.join('; ')]));
    download('timegen-timetable.csv', rows.map((row) => row.map(csvCell).join(',')).join('\n') + '\n', 'text/csv;charset=utf-8');
  }

  function exportExcel() {
    const headers = ['Course ID', 'Course', 'Day', 'Start', 'End', 'Faculty', 'Room', 'Batches'];
    const body = state.schedule.map((x) => [x.courseId, x.courseName, x.day, x.start, x.end, x.facultyName, x.roomName, x.batchNames.join(', ')]);
    const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="Timetable"><Table>
<Row>${headers.map((h) => '<Cell><Data ss:Type="String">' + escapeXml(h) + '</Data></Cell>').join('')}</Row>
${body.map((row) => '<Row>' + row.map((v) => '<Cell><Data ss:Type="String">' + escapeXml(v) + '</Data></Cell>').join('') + '</Row>').join('\n')}
</Table></Worksheet></Workbook>`;
    download('timegen-timetable.xml', xml, 'application/vnd.ms-excel');
  }

  function escapeXml(value) {
    return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function bindFileInput(inputId, statusId, label) {
    $(inputId).addEventListener('change', async () => {
      const file = $(inputId).files[0];
      if (!file) return;
      try {
        await readJsonFile(file, label);
        updateUploadStatus(statusId, true, file.name + ' is valid JSON');
      } catch (error) {
        updateUploadStatus(statusId, false, error instanceof Error ? error.message : String(error));
      }
    });
  }

  function useSample() {
    state.data = normalizeData(SAMPLE, 'Sample data');
    ['studentUploadStatus', 'facultyUploadStatus', 'courseUploadStatus', 'roomUploadStatus'].forEach((id) => $(id).textContent = 'Using bundled sample data');
    $('landingSection').classList.add('hidden');
    $('workflowSection').classList.add('hidden');
    showResultsFromSample();
  }

  function showResultsFromSample() {
    $('resultsSection').classList.remove('hidden');
    generate();
  }

  $('startBtn').addEventListener('click', () => {
    $('landingSection').classList.add('hidden');
    $('workflowSection').classList.remove('hidden');
    showStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  $('sampleBtn').addEventListener('click', useSample);

  $('nextToStep2').addEventListener('click', () => {
    if (!$('studentFile').files[0]) { setStatus('Select a student JSON file first.', 'error'); return; }
    showStep(2);
  });
  $('nextToStep3').addEventListener('click', () => {
    if (!$('facultyFile').files[0]) { setStatus('Select a faculty JSON file first.', 'error'); return; }
    showStep(3);
  });
  $('nextToStep4').addEventListener('click', async () => {
    const ok = await loadFiles();
    if (ok) showStep(4);
  });
  $('backToStep1').addEventListener('click', () => showStep(1));
  $('backToStep2').addEventListener('click', () => showStep(2));
  $('backToStep3').addEventListener('click', () => showStep(3));
  $('generateBtn').addEventListener('click', generate);
  $('regenerateBtn').addEventListener('click', generate);
  $('viewFilter').addEventListener('change', renderFilterValues);
  $('filterValue').addEventListener('change', (event) => { state.filterValue = event.target.value; applyFilter(); });
  $('exportJSON').addEventListener('click', exportJson);
  $('exportCSV').addEventListener('click', exportCsv);
  $('exportExcel').addEventListener('click', exportExcel);
  $('exportPDF').addEventListener('click', () => window.print());
  $('printTimetable').addEventListener('click', () => window.print());

  for (const [input, status, label] of [
    ['studentFile', 'studentUploadStatus', 'Students'],
    ['facultyFile', 'facultyUploadStatus', 'Faculty'],
    ['courseFile', 'courseUploadStatus', 'Courses'],
    ['roomFile', 'roomUploadStatus', 'Rooms']
  ]) bindFileInput(input, status, label);
})();
