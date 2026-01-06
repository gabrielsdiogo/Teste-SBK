import requests
from typing import Optional
import logging

from ..domain.models import WeatherData
from ..domain.repositories import IWeatherAPIClient


class WeatherAPIClient(IWeatherAPIClient):
    """Implementação do cliente para a API WeatherAPI"""

    def __init__(self, api_key: str, base_url: str = "https://api.weatherapi.com/v1"):
        self.api_key = api_key
        self.base_url = base_url
        self.logger = logging.getLogger(__name__)

    def get_weather_data(self, city: str) -> Optional[WeatherData]:
        """
        Obtém dados climáticos de uma cidade via API

        Args:
            city: Nome da cidade

        Returns:
            WeatherData ou None em caso de erro
        """
        try:
            self.logger.info(f"Consultando API para cidade: {city}")

            url = f"{self.base_url}/current.json"
            params = {
                'key': self.api_key,
                'q': city,
                'lang': 'pt'
            }

            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()

            # Extrai os dados do JSON conforme especificado
            weather_data = WeatherData(
                temperatura=data['current']['temp_c'],
                umidade=data['current']['humidity'],
                vento=data['current']['wind_kph'],
                chuva=data['current']['precip_mm']
            )

            self.logger.info("Dados obtidos com sucesso da API")
            return weather_data

        except requests.exceptions.RequestException as e:
            self.logger.error(f"Erro ao fazer requisição para API: {e}")
            return None
        except KeyError as e:
            self.logger.error(f"Erro ao extrair dados do JSON: {e}")
            return None
        except Exception as e:
            self.logger.error(f"Erro inesperado: {e}")
            return None
