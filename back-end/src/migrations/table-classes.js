export const createClassesTableQuery = `
    CREATE TABLE IF NOT EXISTS classes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        shift VARCHAR(20),
        time VARCHAR(50),
        number_of_vacancies INTEGER,
        professor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;
