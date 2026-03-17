from pydantic import BaseModel, Field


class ContactRequest(BaseModel):
    fullName: str = Field(min_length=2, max_length=120)
    email: str = Field(min_length=5, max_length=160)
    phone: str = Field(min_length=6, max_length=40)
    product: str = Field(min_length=2, max_length=80)
    notes: str | None = Field(default=None, max_length=600)
