from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from pathlib import Path
from datetime import datetime

app = Flask(__name__)
CORS(app)  # 允许跨域

# 数据存储路径（仅持久化到两个 JSON 文件）
DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(exist_ok=True)
TASKS_FILE = DATA_DIR / "tasks.json"
DISCOVERIES_FILE = DATA_DIR / "discoveries.json"

def init_data_files():
    """初始化数据文件"""
    if not TASKS_FILE.exists():
        with open(TASKS_FILE, "w", encoding="utf-8") as f:
            json.dump([], f, ensure_ascii=False, indent=2)
    
    if not DISCOVERIES_FILE.exists():
        with open(DISCOVERIES_FILE, "w", encoding="utf-8") as f:
            json.dump([], f, ensure_ascii=False, indent=2)

def read_tasks():
    """读取任务数据"""
    try:
        with open(TASKS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def read_discoveries():
    """读取发现数据"""
    try:
        with open(DISCOVERIES_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def write_tasks(tasks):
    """写入任务数据（只保留 text 与 date，忽略 id/done 等）"""
    normalized = []
    for t in tasks:
        if not isinstance(t, dict):
            continue
        text = t.get("text", "")
        if text is None:
            continue
        date = t.get("date")
        # 若前端未提供 date，使用当天日期
        if not date:
            date = datetime.now().strftime("%Y-%m-%d")
        normalized.append({"text": str(text), "date": str(date)})
    with open(TASKS_FILE, "w", encoding="utf-8") as f:
        json.dump(normalized, f, ensure_ascii=False, indent=2)

def write_discoveries(discoveries):
    """写入发现数据（只保留 text 与 date，忽略 id 等）"""
    normalized = []
    for d in discoveries:
        if not isinstance(d, dict):
            continue
        text = d.get("text", "")
        if text is None:
            continue
        date = d.get("date")
        if not date:
            date = datetime.now().strftime("%Y-%m-%d")
        normalized.append({"text": str(text), "date": str(date)})
    with open(DISCOVERIES_FILE, "w", encoding="utf-8") as f:
        json.dump(normalized, f, ensure_ascii=False, indent=2)

# 备份能力已移除：仅维护 tasks.json 与 discoveries.json

# 初始化数据文件
init_data_files()

@app.route("/", methods=["GET"])
def index():
    """简单的状态页面"""
    tasks = read_tasks()
    discoveries = read_discoveries()
    completed_tasks = len([t for t in tasks if t.get('done', False)])
    
    return jsonify({
        "status": "running",
        "message": "Tasks & Discoveries 数据管理服务器",
        "stats": {
            "total_tasks": len(tasks),
            "completed_tasks": completed_tasks,
            "pending_tasks": len(tasks) - completed_tasks,
            "total_discoveries": len(discoveries),
            "last_updated": datetime.now().isoformat()
        },
        "endpoints": {
            "sync": "/api/sync",
            "tasks": "/api/tasks",
            "discoveries": "/api/discoveries",
            "stats": "/api/stats"
        }
    })

@app.route("/api/sync", methods=["POST"])
def sync_data():
    """同步前端localStorage数据到服务器"""
    try:
        data = request.get_json()
        
        # 从前端localStorage格式解析数据
        tasks_raw = data.get('tasks', '[]')
        discoveries_raw = data.get('discoveries', '[]')
        
        # 如果传入的是字符串，解析为JSON
        if isinstance(tasks_raw, str):
            tasks = json.loads(tasks_raw) if tasks_raw else []
        else:
            tasks = tasks_raw
            
        if isinstance(discoveries_raw, str):
            discoveries = json.loads(discoveries_raw) if discoveries_raw else []
        else:
            discoveries = discoveries_raw
        
        # 保存数据
        if tasks:
            write_tasks(tasks)
        if discoveries:
            write_discoveries(discoveries)
        
        return jsonify({
            "status": "success",
            "message": "数据同步成功",
            "synced": {
                "tasks": len(tasks),
                "discoveries": len(discoveries)
            }
        })
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"同步失败: {str(e)}"
        }), 500

@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    """获取任务数据"""
    return jsonify(read_tasks())

@app.route("/api/discoveries", methods=["GET"])
def get_discoveries():
    """获取发现数据"""
    return jsonify(read_discoveries())

@app.route("/api/tasks", methods=["POST"])
def update_tasks():
    """更新任务数据"""
    try:
        tasks = request.get_json()
        if not isinstance(tasks, list):
            return jsonify({"error": "数据格式错误，应该是数组"}), 400
        
        write_tasks(tasks)
        return jsonify({"status": "success", "count": len(tasks)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/discoveries", methods=["POST"])
def update_discoveries():
    """更新发现数据"""
    try:
        discoveries = request.get_json()
        if not isinstance(discoveries, list):
            return jsonify({"error": "数据格式错误，应该是数组"}), 400
        
        write_discoveries(discoveries)
        return jsonify({"status": "success", "count": len(discoveries)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/load", methods=["GET"])
def load_data_to_frontend():
    """为前端提供数据加载服务，返回localStorage格式的数据"""
    try:
        tasks = read_tasks()
        discoveries = read_discoveries()
        
        return jsonify({
            "status": "success",
            "data": {
                "workboard-simple-tasks-v2": json.dumps(tasks),
                "workboard-discoveries-v1": json.dumps(discoveries)
            },
            "parsed": {
                "tasks": tasks,
                "discoveries": discoveries
            }
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"加载数据失败: {str(e)}"
        }), 500

# 备份接口已移除

@app.route("/api/stats", methods=["GET"])
def get_stats():
    """获取数据统计"""
    tasks = read_tasks()
    discoveries = read_discoveries()
    
    completed_tasks = len([t for t in tasks if t.get('done', False)])
    
    return jsonify({
        "total_tasks": len(tasks),
        "completed_tasks": completed_tasks,
        "pending_tasks": len(tasks) - completed_tasks,
        "total_discoveries": len(discoveries),
        "last_updated": datetime.now().isoformat()
    })

if __name__ == "__main__":
    print("🚀 Tasks & Discoveries 数据管理服务器启动中...")
    print("📊 API状态: http://localhost:5000")
    print("🔗 主要接口:")
    print("   POST /api/sync - 同步前端数据")
    print("   GET  /api/load - 加载数据到前端")
    print("   GET  /api/stats - 获取统计信息")
    print("")
    print("💡 在你的v0前端中可以调用这些API来同步数据")
    app.run(host="localhost", port=5000, debug=True)
