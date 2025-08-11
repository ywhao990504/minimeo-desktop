#!/usr/bin/env python3
"""
自动备份脚本 - 定期备份Tasks和Discoveries数据
使用方法:
1. 定时备份: python auto_backup.py --schedule
2. 立即备份: python auto_backup.py --backup
3. 查看统计: python auto_backup.py --stats
"""

import schedule
import time
import json
import argparse
from pathlib import Path
from datetime import datetime, timedelta
import requests
import sys

# 配置
SERVER_URL = "http://localhost:5000"
DATA_DIR = Path(__file__).parent / "data"
BACKUP_DIR = DATA_DIR / "backups"
LOG_FILE = DATA_DIR / "backup.log"

def log_message(message):
    """记录日志"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"[{timestamp}] {message}\n"
    print(log_entry.strip())
    
    # 确保日志目录存在
    LOG_FILE.parent.mkdir(exist_ok=True)
    
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(log_entry)

def create_backup():
    """创建备份"""
    try:
        response = requests.post(f"{SERVER_URL}/backup", timeout=10)
        if response.status_code == 200:
            data = response.json()
            log_message(f"✅ 备份成功: {data.get('filename', 'unknown')}")
            return True
        else:
            log_message(f"❌ 备份失败: HTTP {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        log_message("❌ 无法连接到服务器，请确保服务器正在运行")
        return False
    except Exception as e:
        log_message(f"❌ 备份出错: {str(e)}")
        return False

def get_stats():
    """获取数据统计"""
    try:
        response = requests.get(f"{SERVER_URL}/api/stats", timeout=10)
        if response.status_code == 200:
            return response.json()
        return None
    except:
        return None

def cleanup_old_backups(days=30):
    """清理老的备份文件"""
    if not BACKUP_DIR.exists():
        return
    
    cutoff_date = datetime.now() - timedelta(days=days)
    cleaned_count = 0
    
    for backup_file in BACKUP_DIR.glob("backup_*.json"):
        try:
            # 从文件名提取日期
            timestamp_str = backup_file.stem.replace("backup_", "")
            file_date = datetime.strptime(timestamp_str.split("_")[0], "%Y%m%d")
            
            if file_date < cutoff_date:
                backup_file.unlink()
                cleaned_count += 1
        except:
            continue
    
    if cleaned_count > 0:
        log_message(f"🧹 清理了 {cleaned_count} 个超过 {days} 天的备份文件")

def show_stats():
    """显示数据统计"""
    stats = get_stats()
    if stats:
        print("\n📊 数据统计:")
        print(f"   总任务数: {stats['total_tasks']}")
        print(f"   已完成任务: {stats['completed_tasks']}")
        print(f"   待办任务: {stats['pending_tasks']}")
        print(f"   发现总数: {stats['total_discoveries']}")
        print(f"   最后更新: {stats['last_updated']}")
        
        # 显示备份文件数量
        if BACKUP_DIR.exists():
            backup_count = len(list(BACKUP_DIR.glob("backup_*.json")))
            print(f"   备份文件数: {backup_count}")
    else:
        print("❌ 无法获取统计信息，请检查服务器状态")

def backup_job():
    """定时备份任务"""
    log_message("🕐 开始执行定时备份...")
    
    # 创建备份
    if create_backup():
        # 清理老备份文件
        cleanup_old_backups(30)
        log_message("✅ 定时备份完成")
    else:
        log_message("❌ 定时备份失败")

def start_scheduler():
    """启动定时任务"""
    log_message("🚀 启动自动备份服务...")
    
    # 每小时备份一次
    schedule.every().hour.do(backup_job)
    
    # 每天凌晨2点清理老文件
    schedule.every().day.at("02:00").do(lambda: cleanup_old_backups(30))
    
    log_message("⏰ 定时任务已设置:")
    log_message("   - 每小时自动备份")
    log_message("   - 每天凌晨2点清理30天前的备份")
    log_message("按 Ctrl+C 停止服务")
    
    try:
        while True:
            schedule.run_pending()
            time.sleep(60)  # 每分钟检查一次
    except KeyboardInterrupt:
        log_message("📴 自动备份服务已停止")

def main():
    parser = argparse.ArgumentParser(description="Tasks & Discoveries 自动备份工具")
    parser.add_argument("--schedule", action="store_true", help="启动定时备份服务")
    parser.add_argument("--backup", action="store_true", help="立即执行备份")
    parser.add_argument("--stats", action="store_true", help="显示数据统计")
    parser.add_argument("--cleanup", type=int, metavar="DAYS", help="清理N天前的备份文件")
    
    args = parser.parse_args()
    
    if args.schedule:
        start_scheduler()
    elif args.backup:
        print("🔄 正在创建备份...")
        if create_backup():
            print("✅ 备份完成")
        else:
            print("❌ 备份失败")
            sys.exit(1)
    elif args.stats:
        show_stats()
    elif args.cleanup:
        print(f"🧹 清理 {args.cleanup} 天前的备份文件...")
        cleanup_old_backups(args.cleanup)
        print("✅ 清理完成")
    else:
        parser.print_help()
        print("\n💡 使用示例:")
        print("   python auto_backup.py --backup     # 立即备份")
        print("   python auto_backup.py --schedule   # 启动定时备份")
        print("   python auto_backup.py --stats      # 查看统计")

if __name__ == "__main__":
    main() 