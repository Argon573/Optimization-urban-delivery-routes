import threading
import time
import logging
import os

from .traffic_generator import generate_traffic_csv

logger = logging.getLogger(__name__)


class TrafficUpdater:
    def __init__(self, interval_seconds=600):
        self.interval = interval_seconds
        self.running = False
        self.thread = None

    def _update_loop(self):
        while self.running:
            try:
                count = generate_traffic_csv()
                logger.info(f"Traffic CSV updated: {count} records")
            except Exception as e:
                logger.error(f"Traffic update error: {e}")

            time.sleep(self.interval)

    def start(self):
        if self.running:
            return
        self.running = True
        self.thread = threading.Thread(target=self._update_loop, daemon=True)
        self.thread.start()
        logger.info(f"Traffic updater started (interval {self.interval}s)")

    def stop(self):
        self.running = False
        if self.thread:
            self.thread.join(timeout=5)
        logger.info("Traffic updater stopped")
