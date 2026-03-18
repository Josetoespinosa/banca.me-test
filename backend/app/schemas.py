from typing import Literal

from pydantic import BaseModel, Field


class ContactRequest(BaseModel):
    fullName: str = Field(min_length=2, max_length=120)
    email: str = Field(min_length=5, max_length=160)
    phone: str = Field(min_length=6, max_length=40)
    product: str = Field(min_length=2, max_length=80)
    notes: str | None = Field(default=None, max_length=600)


class ApplicationStartRequest(BaseModel):
    nombre: str = Field(min_length=1, max_length=80)
    apellido: str = Field(min_length=1, max_length=80)
    rut: str = Field(min_length=11, max_length=12)
    email: str = Field(min_length=5, max_length=160)
    tipoCliente: Literal["persona", "empresa"]
    empresaNombre: str | None = Field(default=None, max_length=160)
    empresaRut: str | None = Field(default=None, max_length=12)


class ApplicationFinancialRequest(BaseModel):
    ingresosMensuales: float = Field(ge=0)
    gastosMensuales: float = Field(ge=0)
    deudasMensuales: float = Field(ge=0)
    montoSolicitado: float = Field(ge=0)


class AdminManualReviewRequest(BaseModel):
    decision: Literal["apto", "no_apto"]
