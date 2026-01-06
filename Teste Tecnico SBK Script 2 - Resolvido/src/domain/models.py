from dataclasses import dataclass
from datetime import datetime


@dataclass
class WeatherData:
    """Entidade de domínio para dados climáticos"""
    temperatura: float
    umidade: int
    vento: float
    chuva: float
    data_coleta: datetime = None

    def __post_init__(self):
        if self.data_coleta is None:
            self.data_coleta = datetime.now()

    def to_dict(self) -> dict:
        """Converte os dados para dicionário"""
        return {
            'data_coleta': self.data_coleta.strftime('%Y-%m-%d %H:%M:%S'),
            'temperatura': self.temperatura,
            'umidade': self.umidade,
            'vento': self.vento,
            'chuva': self.chuva
        }
