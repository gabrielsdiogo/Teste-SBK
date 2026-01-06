from abc import ABC, abstractmethod
from typing import Optional
from .models import WeatherData


class IWeatherAPIClient(ABC):
    """Interface para cliente de API de dados climáticos"""

    @abstractmethod
    def get_weather_data(self, city: str) -> Optional[WeatherData]:
        """Obtém dados climáticos de uma cidade via API"""
        pass


class IWeatherRepository(ABC):
    """Interface para repositório de dados climáticos"""

    @abstractmethod
    def save(self, weather_data: WeatherData) -> None:
        """Salva os dados climáticos"""
        pass
