import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Маршрутизатор API",
    description="API для оптимизации маршрутов доставки",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

from traffic.traffic_updater import TrafficUpdater
from traffic.traffic_generator import generate_traffic_csv

traffic_updater = TrafficUpdater(interval_seconds=600)


@app.on_event("startup")
async def startup_event():
    try:
        count = generate_traffic_csv()
        logger.info(f"Initial traffic CSV generated: {count} records")
    except Exception as e:
        logger.error(f"Failed to generate initial traffic CSV: {e}")
    traffic_updater.start()


@app.on_event("shutdown")
async def shutdown_event():
    traffic_updater.stop()
