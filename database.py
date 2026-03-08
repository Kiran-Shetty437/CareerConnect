import sqlite3
from config import DB_NAME

def get_connection():
    conn = sqlite3.connect(DB_NAME, timeout=20)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    c = conn.cursor()

    c.execute('''CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT,
        email TEXT,
        resume_filename TEXT,
        applied_job TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        total_screen_time INTEGER DEFAULT 0
    )''')

    try:
        # Note: SQLite 3 cannot use CURRENT_TIMESTAMP as a default when using ALTER TABLE.
        # Fixed by using a constant string as the default.
        c.execute("ALTER TABLE user ADD COLUMN created_at TIMESTAMP DEFAULT '2024-01-01 00:00:00'")
    except sqlite3.OperationalError:
        pass

    try:
        c.execute("ALTER TABLE user ADD COLUMN total_screen_time INTEGER DEFAULT 0")
    except sqlite3.OperationalError:
        pass

    c.execute('''CREATE TABLE IF NOT EXISTS global_settings (
        key TEXT PRIMARY KEY,
        value TEXT
    )''')

    # Default ratio value
    c.execute("INSERT OR IGNORE INTO global_settings (key, value) VALUES ('commission_ratio', '10.0')")

    c.execute('''CREATE TABLE IF NOT EXISTS resume_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        full_name TEXT,
        phone TEXT,
        location TEXT,
        linkedin TEXT,
        github TEXT,
        skills TEXT,
        education TEXT,
        experience TEXT,
        projects TEXT,
        summary TEXT
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS company (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_name TEXT,
        official_page_link TEXT,
        image_filename TEXT,
        job_role TEXT,
        start_date TEXT,
        end_date TEXT,
        location TEXT,
        job_level TEXT,
        experience_required TEXT,
        apply_link TEXT,
        is_active INTEGER DEFAULT 1
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        company_id INTEGER,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, company_id)
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS resume_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        template_name TEXT,
        template_id TEXT UNIQUE,
        demo_data TEXT,
        base_layout TEXT DEFAULT 'marjorie',
        is_active INTEGER DEFAULT 1
    )''')

    # Default Templates Initialization
    default_templates = [
        {
            "name": "Classic (Marjorie)",
            "id": "marjorie",
            "layout": "marjorie",
            "data": {
                "personal": {"fullName": "Marjorie D. McGahey", "email": "marjorie@jourrapide.com", "phone": "718-564-6972", "location": "Brooklyn, NY", "professionalTitle": "Sales Executive", "summary": "Sales professional with experience in the tyre market."},
                "experience": [{"company": "UHE TRADING", "role": "Sales Executive", "duration": "2011 - Now", "desc": "Manage retail shop operations."}],
                "education": [{"school": "FTU", "degree": "Economics", "year": "2005 - 2015"}],
                "skills": ["Sales", "Communication"]
            }
        },
        {
            "name": "Technical (John)",
            "id": "john",
            "layout": "john",
            "data": {
                "personal": {"fullName": "John Smith", "email": "j.smith@email.com", "phone": "774-987-4009", "professionalTitle": "IT Project Manager", "summary": "Senior IT professional with 10+ years experience."},
                "experience": [{"company": "Seton Hospital", "role": "Senior Project Manager", "duration": "2006 - Now", "desc": "Oversaw major IT projects."}],
                "education": [{"school": "UMD", "degree": "Computer Science", "year": "1996 - 2001"}],
                "skills": ["Project Management", "Agile", "Scrum"]
            }
        },
        {
            "name": "Creative (Juliana)",
            "id": "juliana",
            "layout": "juliana",
            "data": {
                "personal": {"fullName": "Juliana Silva", "email": "hello@site.com", "phone": "+123-456-7890", "professionalTitle": "Art Director", "summary": "Creative director specialized in digital marketing."},
                "experience": [{"company": "Creative Inc", "role": "Marketing Manager", "duration": "2022 - Present", "desc": "Led design teams."}],
                "education": [{"school": "Wardiere University", "degree": "Bachelor of Design", "year": "2006 - 2008"}],
                "skills": ["Graphic Design", "Branding"]
            }
        },
        {
            "name": "Academic (Amanda)",
            "id": "amanda",
            "layout": "amanda",
            "data": {
                "personal": {"fullName": "Amanda Baker", "email": "email@example.com", "phone": "(123) 456-7890", "professionalTitle": "Biology Professor", "summary": "Ph.D. in Molecular Biology with teaching experience."},
                "experience": [{"company": "University of Utah", "role": "Professor", "duration": "2019 - Now", "desc": "Taught biology courses."}],
                "education": [{"school": "Boston University", "degree": "Ph.D. Molecular Biology", "year": "2010 - 2015"}],
                "skills": ["Research", "Laboratory Management"]
            }
        }
    ]

    import json
    for t in default_templates:
        c.execute("INSERT OR IGNORE INTO resume_templates (template_name, template_id, demo_data, base_layout) VALUES (?, ?, ?, ?)",
                  (t["name"], t["id"], json.dumps(t["data"]), t["layout"]))

    conn.commit()
    conn.close()