export const createStudentsClassesTableQuery = `
  CREATE TABLE IF NOT EXISTS student_classes (
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    classes_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    PRIMARY KEY (student_id, classes_id)
  )
`;
