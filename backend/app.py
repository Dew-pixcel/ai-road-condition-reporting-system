from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from ultralytics import YOLO
import os
import requests
import uuid
from PIL import Image
from pillow_heif import register_heif_opener
import sqlite3
import exifread

from database import init_db, save_report, create_user, get_user, update_status

app = Flask(__name__)
CORS(app)

init_db()
register_heif_opener()

UPLOAD_FOLDER = "uploads"
PROCESSED_FOLDER = "processed"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["PROCESSED_FOLDER"] = PROCESSED_FOLDER

model = YOLO("best.pt")

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "heic", "heif"}
ALLOWED_LABELS = {"Crack", "pothole"}


# ---------------- DUPLICATE CHECK FUNCTION ----------------
def is_duplicate_location(lat, lon):
    conn = sqlite3.connect("road_damage.db")
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id FROM reports WHERE latitude=? AND longitude=?",
        (lat, lon)
    )

    result = cursor.fetchone()
    conn.close()

    return result is not None


# ---------------- REGISTER ----------------
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    try:
        create_user(data["email"], data["password"])
        return jsonify({"message": "User registered"})
    except:
        return jsonify({"error": "User exists"}), 400


# ---------------- LOGIN ----------------
@app.route("/login", methods=["POST"])
def login():
    data = request.json

    if data["email"] == "admin@road.ai" and data["password"] == "1234":
        return jsonify({"role": "officer"})

    user = get_user(data["email"], data["password"])

    if user:
        return jsonify({"role": "user"})
    else:
        return jsonify({"error": "Invalid"}), 401


# ---------------- IMAGE SERVE ----------------
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory("uploads", filename)


# ---------------- GPS EXTRACT ----------------
def get_gps_from_image(image_path):
    try:
        with open(image_path, 'rb') as f:
            tags = exifread.process_file(f)

        def convert_to_degrees(value):
            d = float(value.values[0].num) / float(value.values[0].den)
            m = float(value.values[1].num) / float(value.values[1].den)
            s = float(value.values[2].num) / float(value.values[2].den)
            return d + (m / 60.0) + (s / 3600.0)

        lat = tags.get("GPS GPSLatitude")
        lat_ref = tags.get("GPS GPSLatitudeRef")
        lon = tags.get("GPS GPSLongitude")
        lon_ref = tags.get("GPS GPSLongitudeRef")

        if lat and lon:
            lat = convert_to_degrees(lat)
            lon = convert_to_degrees(lon)

            if lat_ref.values != "N":
                lat = -lat
            if lon_ref.values != "E":
                lon = -lon

            return lat, lon

    except Exception as e:
        print("GPS error:", e)

    return None, None


# ---------------- ROAD TYPE FROM COORDS ----------------
def get_road_type_from_coords(lat, lon):
    try:
        overpass_url = "https://overpass-api.de/api/interpreter"

        query = f"""
        [out:json];
        way(around:50,{lat},{lon})["highway"];
        out tags;
        """

        res = requests.post(overpass_url, data=query, timeout=10)
        data = res.json()

        if "elements" in data:
            for el in data["elements"]:
                highway = el.get("tags", {}).get("highway", "")

                if highway in ["motorway", "trunk", "primary"]:
                    return "Main Road"

            return "Normal Road"

    except Exception as e:
        print("Road detect error:", e)

    return "Normal Road"


# ---------------- PREDICT ----------------
@app.route("/predict", methods=["POST"])
def predict():
    try:
        file = request.files.get("image")
        city = request.form.get("city")
        phone = request.form.get("phone")
        description = request.form.get("description")
        email = request.form.get("email")

        if not file or not city or not phone:
            return jsonify({"error": "Missing data"}), 400

        # SAVE IMAGE
        filename = str(uuid.uuid4()) + os.path.splitext(file.filename)[1]
        path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(path)

        image = Image.open(path)
        processed = os.path.join(PROCESSED_FOLDER, filename + ".jpg")
        image.convert("RGB").save(processed)

        # ---------------- AI DETECTION ----------------
        results = model(processed, conf=0.6)
        print("RESULTS:", results)

        detections = []

        for r in results:
            print("BOXES:", r.boxes)

            if r.boxes is None:
                continue

            for b in r.boxes:
                cls_id = int(b.cls[0])
                label = model.names[cls_id]

                if label in ALLOWED_LABELS:
                    x1, y1, x2, y2 = b.xyxy[0]
                    area = float((x2 - x1) * (y2 - y1))

                    detections.append({
                        "label": label,
                        "area": area,
                        "confidence": float(b.conf[0])
                    })

        # ---------------- NO ROAD DAMAGE / INVALID IMAGE ----------------
        if len(detections) == 0:
            return jsonify({
                "error": "NO_ROAD_DAMAGE",
                "message": "Please upload a valid road damage image."
            }), 200

        # ---------------- BEST DETECTION ----------------
        best = max(detections, key=lambda x: x["area"])
        area = best["area"]

        # ---------------- GPS + ROAD TYPE ----------------
        lat, lon = get_gps_from_image(path)

        if lat is None or lon is None:
            return jsonify({
                "error": "NO_GPS",
                "detections": detections
            }), 200

        if is_duplicate_location(lat, lon):
            return jsonify({
                "error": "DUPLICATE_LOCATION",
                "detections": detections
            }), 200

        road_type = get_road_type_from_coords(lat, lon)

        # ---------------- PRIORITY BASED ON AREA ----------------
        if area > 50000:
            priority = "High"
        elif area > 20000:
            priority = "Medium"
        else:
            priority = "Low"

        # ---------------- ROAD TYPE PRIORITY BOOST ----------------
        if road_type == "Main Road":
            if priority == "Low":
                priority = "Medium"
            elif priority == "Medium":
                priority = "High"

        # ---------------- SAVE REPORT ----------------
        save_report({
            "image": filename,
            "city": city,
            "phone": phone,
            "description": description,
            "damage_type": best["label"],
            "severity": "Auto",
            "priority": priority,
            "latitude": lat,
            "longitude": lon,
            "road_type": road_type,
            "email": email
        })

        return jsonify({
            "success": True,
            "latitude": lat,
            "longitude": lon,
            "road_type": road_type,
            "priority": priority,
            "detections": detections
        }), 200

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": "Server error"}), 500


# ---------------- GET REPORTS ----------------
@app.route("/reports", methods=["GET"])
def get_reports():
    conn = sqlite3.connect("road_damage.db")
    conn.row_factory = sqlite3.Row
    data = [dict(r) for r in conn.execute("SELECT * FROM reports ORDER BY id DESC")]
    conn.close()
    return jsonify(data)


# ---------------- UPDATE STATUS ----------------
@app.route("/update-status/<int:id>", methods=["PUT"])
def update_status_api(id):
    data = request.json
    status = data.get("status")

    update_status(id, status)

    return jsonify({"message": "Status updated"})


# ---------------- DELETE REPORT ----------------
@app.route("/delete-report/<int:id>", methods=["DELETE"])
def delete_report_api(id):
    try:
        conn = sqlite3.connect("road_damage.db")
        cursor = conn.cursor()

        # Get image filename before deleting report
        cursor.execute("SELECT image FROM reports WHERE id=?", (id,))
        report = cursor.fetchone()

        if not report:
            conn.close()
            return jsonify({"error": "Report not found"}), 404

        image_name = report[0]

        # Delete report from database
        cursor.execute("DELETE FROM reports WHERE id=?", (id,))
        conn.commit()
        conn.close()

        # Delete uploaded image file
        image_path = os.path.join(UPLOAD_FOLDER, image_name)
        if os.path.exists(image_path):
            os.remove(image_path)

        # Delete processed image file if exists
        processed_path = os.path.join(PROCESSED_FOLDER, image_name + ".jpg")
        if os.path.exists(processed_path):
            os.remove(processed_path)

        return jsonify({
            "success": True,
            "message": "Report deleted successfully"
        }), 200

    except Exception as e:
        print("DELETE ERROR:", e)
        return jsonify({"error": "Server error"}), 500


# ---------------- RUN ----------------
if __name__ == "__main__":
    app.run(debug=True)