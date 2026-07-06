from flask import Flask, jsonify
try:
    from flask_cors import CORS
except ImportError:
    # Fallback if flask_cors is not installed
    def CORS(app, **kwargs):
        return None

import psutil
import os
import json

app = Flask(__name__)
CORS(app)


@app.route("/")
def home():
    return "CloudPulse Running Successfully"


@app.route("/metrics")
def metrics():

    disk_path = os.getenv("SystemDrive", "C:\\")

    new_data = {
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
@app.route("/history")
def history():

    file_path = os.path.join("logs", "metrics.json")

    with open(file_path, "r") as file:
        data = json.load(file)

    return jsonify(data)


if __name__ == "__main__":
    app.run(debug=True)