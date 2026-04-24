import sqlite3

conn = sqlite3.connect("users.db")  # your DB file
cursor = conn.cursor()

# 1. Get all table names
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()

# 2. Loop through tables
for table in tables:
    table_name = table[0]
    print(f"\n📦 Table: {table_name}")
    print("-" * 30)

    # 3. Get all data from each table
    cursor.execute(f"SELECT * FROM {table_name}")
    rows = cursor.fetchall()

    for row in rows:
        print(row)

conn.close()