from pydantic import BaseModel
from typing import List

class AnalyzeRequest(BaseModel):
    main_product: str
    competitors: List[str]