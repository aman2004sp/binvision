"""Pydantic models shared by routes and services."""
from __future__ import annotations

from enum import Enum
from typing import Literal, Optional

from pydantic import BaseModel, Field


class Category(str, Enum):
    PAPER = "paper_cardboard"
    PLASTIC = "plastic"
    METAL = "metal"
    GLASS = "glass"
    ORGANIC = "organic"
    EWASTE = "ewaste"
    HAZARDOUS = "batteries_hazardous"
    RESIDUAL = "residual"
    TEXTILE = "textile"
    UNKNOWN = "unknown"


class ClassificationResult(BaseModel):
    item_name: str
    category: Category
    material: str
    confidence: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    preparation_steps: list[str]
    disposal_instruction: str
    reason: str
    warning: Optional[str] = None
    uncertain: bool
    source: Literal["ai", "rules", "demo_fallback"]
    local_rules_notice: str
    fallback_reason: Optional[str] = None


class CategoryGuidance(BaseModel):
    id: Category
    label: str
    summary: str
    examples: list[str]
    preparation_steps: list[str]
    disposal_route: str
    common_mistakes: list[str]
    safety: Optional[str] = None
    local_variation_note: str


class KnowledgeBase(BaseModel):
    version: str
    disclaimer: str
    categories: list[CategoryGuidance]


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
    ai_available: bool
    version: str


class ErrorResponse(BaseModel):
    detail: str
