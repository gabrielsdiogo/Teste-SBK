from dataclasses import dataclass
from datetime import datetime


@dataclass
class WeatherData:
    """Entidades de domínio"""
    temperatura_minima: str
    temperatura_maxima: str
    chuva: str
    vento: str
    umidade_minima: str
    umidade_maxima: str
    data_coleta: datetime = None

    def __post_init__(self):
        if self.data_coleta is None:
            self.data_coleta = datetime.now()

    def to_dict(self) -> dict:
        """Converte os dados para dicionário"""
        return {
            'data_coleta': self.data_coleta.strftime('%Y-%m-%d %H:%M:%S'),
            'temperatura_minima': self.temperatura_minima,
            'temperatura_maxima': self.temperatura_maxima,
            'chuva': self.chuva,
            'vento': self.vento,
            'umidade_minima': self.umidade_minima,
            'umidade_maxima': self.umidade_maxima
        }
