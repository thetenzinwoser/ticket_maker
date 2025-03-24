from pydantic import BaseModel, Field
from typing import List

class TicketRequest(BaseModel):
    description: str = Field(..., min_length=1, max_length=1000)
    images: List[str] = Field(default_factory=list, description="List of base64 encoded images")

    class Config:
        schema_extra = {
            "example": {
                "description": "Bug: Login button not working",
                "images": ["data:image/jpeg;base64,/9j/4AAQSkZJRg..."]
            }
        } 