# Data Structures (example)
teachers = [{"id": 1, "name": "Alice", "max_classes_per_week": 3, "subjects_teaching": ["Math", "Biology"], "available_days": ["Monday", "Tuesday", "Wednesday"], "available_slots_per_day": 4}]
courses = [{"id": 1, "name": "Math", "teacher_id": 1, "subject_duration": 1, "frequency_per_week": 4}, {"id": 2, "name": "Biology", "teacher_id": 1, "subject_duration": 0.67, "frequency_per_week": 3}]
classes = [{"id": 1, "name": "Class A", "sections": ["A", "B"], "subjects_for_section": {"A": ["Math", "Biology"], "B": ["Math"]}}]

# Try to assign courses to slots
def assign_courses_to_slots(teachers, courses, classes, available_slots):
    schedule = {}  # Store final schedule
    
    for teacher in teachers:
        for course in courses:
            if course["teacher_id"] == teacher["id"]:
                # Attempt to assign time slots to this course
                for day in teacher["available_days"]:
                    for slot in range(teacher["available_slots_per_day"]):
                        # Check if the teacher is available and assign the course
                        if not conflict_in_schedule(schedule, teacher["id"], day, slot):
                            # Assign course to the available slot
                            schedule[(teacher["id"], course["id"], day, slot)] = course["name"]
                            break
    return schedule

def conflict_in_schedule(schedule, teacher_id, day, slot):
    # Check for conflicts in the schedule (if the teacher is already assigned during this time)
    for key in schedule:
        if key[0] == teacher_id and key[2] == day and key[3] == slot:
            return True
    return False

