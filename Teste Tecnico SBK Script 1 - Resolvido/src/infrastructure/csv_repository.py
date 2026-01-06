import csv
import os
import logging

from ..domain.models import WeatherData
from ..domain.repositories import IWeatherRepository


class CSVWeatherRepository(IWeatherRepository):
    """Implementação do repositório para salvar em CSV"""

    def __init__(self, file_path: str = 'weather_data.csv'):
        self.file_path = file_path
        self.logger = logging.getLogger(__name__)
        self.fieldnames = [
            'data_coleta',
            'temperatura_minima',
            'temperatura_maxima',
            'chuva',
            'vento',
            'umidade_minima',
            'umidade_maxima'
        ]

    def save(self, weather_data: WeatherData) -> None:
        """Salva os dados climáticos em arquivo CSV"""
        try:
            file_exists = os.path.isfile(self.file_path)

            with open(self.file_path, mode='a', newline='', encoding='utf-8') as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=self.fieldnames)

                if not file_exists:
                    writer.writeheader()
                    self.logger.info(f"Arquivo CSV criado: {self.file_path}")

                # Escreve os dados
                writer.writerow(weather_data.to_dict())
                self.logger.info(f"Dados salvos com sucesso em: {self.file_path}")

        except Exception as e:
            self.logger.error(f"Erro ao salvar dados no CSV: {e}")
            raise
