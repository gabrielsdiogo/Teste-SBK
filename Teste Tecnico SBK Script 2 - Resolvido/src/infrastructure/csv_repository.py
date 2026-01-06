import csv
import os
import logging

from ..domain.models import WeatherData
from ..domain.repositories import IWeatherRepository


class CSVWeatherRepository(IWeatherRepository):
    """Implementação do repositório para salvar dados climáticos em CSV"""

    def __init__(self, file_path: str = 'weather_data.csv'):
        self.file_path = file_path
        self.logger = logging.getLogger(__name__)
        self.fieldnames = [
            'data_coleta',
            'temperatura (°C)',
            'umidade (%)',
            'vento (km/h)',
            'chuva (mm)'
        ]

    def save(self, weather_data: WeatherData) -> None:
        """
        Salva os dados climáticos em arquivo CSV

        Args:
            weather_data: Dados climáticos a serem salvos
        """
        try:
            file_exists = os.path.isfile(self.file_path)

            with open(self.file_path, mode='a', newline='', encoding='utf-8') as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=self.fieldnames)

                if not file_exists:
                    writer.writeheader()
                    self.logger.info(f"Arquivo CSV criado: {self.file_path}")

                # Mapeia os dados do modelo para os campos com unidades
                data_dict = weather_data.to_dict()
                row_data = {
                    'data_coleta': data_dict['data_coleta'],
                    'temperatura (°C)': data_dict['temperatura'],
                    'umidade (%)': data_dict['umidade'],
                    'vento (km/h)': data_dict['vento'],
                    'chuva (mm)': data_dict['chuva']
                }

                # Escreve os dados
                writer.writerow(row_data)
                self.logger.info(f"Dados salvos com sucesso em: {self.file_path}")

        except Exception as e:
            self.logger.error(f"Erro ao salvar dados no CSV: {e}")
            raise
