import sqlite3
import json

def check_patterns():
    conn = sqlite3.connect('users.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    rows = cursor.execute("SELECT * FROM aptitude_patterns").fetchall()
    for row in rows:
        print(f"Company: {row['company_name']}")
        print(f"Pattern: {row['patterns_json']}")
        print("-" * 20)
    
    conn.close()

if __name__ == "__main__":
    check_patterns()
