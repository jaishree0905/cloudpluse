from flask import Flask, jsonify, request
try:
    from flask_cors import CORS
except ImportError:
    # Fallback if flask_cors is not installed
    def CORS(app, **kwargs):
        return None

import psutil
import os
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)


@app.route("/")
def home():
    return "CloudPulse Running Successfully"


@app.route("/metrics")
def metrics():

    disk_path = os.getenv("SystemDrive", "C:\\")

    new_data = {
       
    "time": datetime.now().strftime("%I:%M:%S %p"),

    "cpu": psutil.cpu_percent(interval=1),
    "memory": psutil.virtual_memory().percent,
    "disk": psutil.disk_usage(disk_path).percent

    }

    
    file_path = os.path.join("logs", "metrics.json")

    
    if not os.path.exists(file_path):
        with open(file_path, "w") as file:
            json.dump([], file)

    
    with open(file_path, "r") as file:
        data = json.load(file)

    
    data.append(new_data)

    
    if len(data) > 20:
        data.pop(0)

    
    with open(file_path, "w") as file:
        json.dump(data, file, indent=4)

    return jsonify(new_data)


# ===============================
# NEW HISTORY API
# ===============================
@app.route("/statistics")
def statistics():
    file_path = os.path.join("logs", "metrics.json")

    with open(file_path, "r") as file:
        data = json.load(file)

    if not data:
        return jsonify({"message": "No data available"}), 404

    cpu_values = [entry["cpu"] for entry in data]
    memory_values = [entry["memory"] for entry in data]
    disk_values = [entry["disk"] for entry in data]

    statistics_data = {
        "cpu": {
            "average": sum(cpu_values) / len(cpu_values),
            "max": max(cpu_values),
            "min": min(cpu_values)
        },
        "memory": {
            "average": sum(memory_values) / len(memory_values),
            "max": max(memory_values),
            "min": min(memory_values)
        },
        "disk": {
            "average": sum(disk_values) / len(disk_values),
            "max": max(disk_values),
            "min": min(disk_values)
        }
    }

    return jsonify(statistics_data)
@app.route("/history")
def history():

    file_path = os.path.join("logs", "metrics.json")

    with open(file_path, "r") as file:
        data = json.load(file)

    return jsonify(data)
@app.route("/clear", methods=["POST"])
def clear_history():

    file_path = os.path.join("logs", "metrics.json")

    with open(file_path, "w") as file:
        json.dump([], file)

    return jsonify({"message": "History Cleared Successfully"})
if __name__ == "__main__":
    app.run(debug=True)