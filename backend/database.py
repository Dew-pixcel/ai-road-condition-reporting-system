import sqlite3

DB_NAME = "road_damage.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    #  UPDATED REPORTS TABLE
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        image TEXT,
        city TEXT,
        phone TEXT,
        description TEXT,
        damage_type TEXT,
        severity TEXT,
        priority TEXT,
        latitude REAL,
        longitude REAL,
        road_type TEXT,
        email TEXT,
        status TEXT DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # USERS TABLE
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'user'
    )
    """)

    conn.commit()
    conn.close()


#  SAVE REPORT (WITH EMAIL + STATUS)
def save_report(data):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("""
    INSERT INTO reports (
        image, city, phone, description,
        damage_type, severity, priority,
        latitude, longitude, road_type,
        email, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data["image"],
        data["city"],
        data["phone"],
        data["description"],
        data["damage_type"],
        data["severity"],
        data["priority"],
        data["latitude"],
        data["longitude"],
        data["road_type"],
        data["email"],          
        "Pending"               
    ))

    conn.commit()
    conn.close()


#  UPDATE STATUS (VERY IMPORTANT)
def update_status(report_id, status):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute(
        "UPDATE reports SET status=? WHERE id=?",
        (status, report_id)
    )

    conn.commit()
    conn.close()


# REGISTER USER
def create_user(email, password):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute(
        "INSERT INTO users (email, password) VALUES (?, ?)",
        (email, password)
    )

    conn.commit()
    conn.close()


# LOGIN USER
def get_user(email, password):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM users WHERE email=? AND password=?",
        (email, password)
    )

    user = cursor.fetchone()
    conn.close()
    return user


#  NEW: CHECK DUPLICATE LOCATION
def location_exists(lat, lon):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute("""
    SELECT * FROM reports 
    WHERE ABS(latitude - ?) < 0.0001 
    AND ABS(longitude - ?) < 0.0001
    """, (lat, lon))

    result = cursor.fetchone()
    conn.close()

    return result is not None