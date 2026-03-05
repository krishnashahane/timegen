# AI Timetable Generator - Smart India Hackathon 2025

## Overview

The AI Timetable Generator is an intelligent scheduling system designed to create optimal academic timetables while satisfying multiple constraints. This project addresses the complex challenge of academic scheduling by leveraging artificial intelligence to generate conflict-free timetables that respect faculty preferences, student needs, and resource constraints.

## Key Features

- **NEP 2020 Compliant**: Designed to support the flexibility and multidisciplinary approach of the National Education Policy 2020.
- **Constraint-Based Optimization**: Uses advanced algorithms to satisfy multiple constraints simultaneously.
- **Intuitive User Interface**: Step-by-step workflow with visual feedback and real-time algorithm visualization.
- **Multi-Level Filtering**: View timetables by faculty, room, or student batch.
- **Exportable Results**: Export generated timetables to PDF, Excel, or print directly.
- **Real-time Algorithm Visualization**: Watch the AI optimization process in action.
- **Detailed Analytics**: Comprehensive statistics on constraint satisfaction and resource utilization.

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Visualization**: Canvas API for algorithm visualization
- **Data Format**: JSON for data exchange
- **Algorithm**: Custom constraint satisfaction solver with simulated annealing

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ai-timetable-generator.git
   ```

2. Open `index.html` in your browser.

3. Upload the required JSON files:
   - `students.json`: Student data and course selections
   - `faculty.json`: Faculty information and preferences
   - `courses.json`: Course details and requirements
   - `rooms.json`: Room information and availability

4. Set your preferences and generate the timetable.

## Input Data Format

The system requires four JSON files with specific formats:

### students.json
Contains student information, batch assignments, and course selections.

### faculty.json
Contains faculty information, course assignments, and scheduling preferences.

### courses.json
Contains course details, credit information, and room requirements.

### rooms.json
Contains room information, capacity, and available facilities.

## Constraints Handled

- No faculty teaches more than one class at a time
- No student has overlapping courses
- No room is double-booked
- Faculty preferences for teaching times are respected
- Appropriate rooms are assigned based on course requirements
- Lunch breaks are preserved
- Daily class load is balanced

## Future Enhancements

- Integration with university ERP systems
- Mobile application for on-the-go access
- Machine learning to improve scheduling based on historical data
- Support for special events and academic calendar integration

## Team

- [Team Member 1] - Role
- [Team Member 2] - Role
- [Team Member 3] - Role
- [Team Member 4] - Role
- [Team Member 5] - Role

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Developed for Smart India Hackathon 2025