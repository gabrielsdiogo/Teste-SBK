from abc import ABC, abstractmethod
from typing import Optional
from .models import WeatherData


class IWeatherScraper(ABC):
    """Interface para scraper de dados climáticos"""

    @abstractmethod
    def extract_weather_data(self, url: str) -> Optional[WeatherData]:
        """Extrai dados climáticos de uma URL"""
        pass


class IWeatherRepository(ABC):
    """Interface para repositório de dados climáticos"""

    @abstractmethod
    def save(self, weather_data: WeatherData) -> None:
        """Salva os dados climáticos"""
        pass
