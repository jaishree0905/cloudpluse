from flask import Flask, jsonify
try:
    from flask_cors import CORS
except ImportError:
    # Provide a no-op fallback when flask_cors is not installed to avoid import errors
    def CORS(app, **kwargs):
        return None
import psutil
import os

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return "CloudPulse Running Successfully"

@app.route("/metrics")
def metrics():
    disk_path = os.getenv("SystemDrive", "C:\\")

    return jsonify({
        "cpu": psutil.cpu_percent(interval=1),
        "memory": psutil.virtual_memory().percent,
        "disk": psutil.disk_usage(disk_path).percent
    })

if __name__ == "__main__":
    app.run(debug=True)