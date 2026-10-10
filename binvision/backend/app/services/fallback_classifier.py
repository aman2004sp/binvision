"""Rule-based / demo results built purely from the curated knowledge base.

Nothing here recognises an image. Results are labelled "rules" (guidance for a category produced
by the AI path) or "demo_fallback" (manual selection or AI unavailable).
"""
from __future__ import annotations

from typing import Literal, Optional

from ..models import Category, ClassificationResult
from .disposal_knowledge import LOCAL_NOTICE, get_guidance

# Representative items used when the user picks a category manually in demo mode.
_DEMO_ITEMS: dict[Category, tuple[str, str]] = {
    Category.PAPER: ("Paper or cardboard item", "Paper / cardboard fibre"),
    Category.PLASTIC: ("Plastic item", "Plastic (type not determined)"),
    Category.METAL: ("Metal item", "Metal (aluminium or steel not determined)"),
    Category.GLASS: ("Glass item", "Glass"),
    Category.ORGANIC: ("Food or garden waste", "Organic material"),
    Category.EWASTE: ("Electronic item", "Mixed electronic components"),
    Category.HAZARDOUS: ("Battery or hazardous household item", "Batteries / chemicals (not determined)"),
    Category.RESIDUAL: ("Non-recyclable item", "Mixed or non-recyclable material"),
    Category.TEXTILE: ("Textile item", "Fabric"),
    Category.UNKNOWN: ("Unidentified item", "Unknown"),
}


def build_from_category(
    category: Category,
    *,
    source: Literal["rules", "demo_fallback"],
    item_name: Optional[str] = None,
    material: Optional[str] = None,
    reason: Optional[str] = None,
    fallback_reason: Optional[str] = None,
    uncertain: Optional[bool] = None,
) -> ClassificationResult:
    guidance = get_guidance(category)
    default_name, default_material = _DEMO_ITEMS[category]
    is_unknown = category == Category.UNKNOWN
    return ClassificationResult(
        item_name=item_name or default_name,
        category=category,
        material=material or default_material,
        confidence=None,
        preparation_steps=list(guidance.preparation_steps),
        disposal_instruction=guidance.disposal_route,
        reason=reason
        or (
            f"You selected {guidance.label}. This guidance comes from BinVision's curated "
            "knowledge base; no image was analysed."
        ),
        warning=guidance.safety,
        uncertain=is_unknown if uncertain is None else uncertain,
        source=source,
        local_rules_notice=LOCAL_NOTICE,
        fallback_reason=fallback_reason,
    )


def demo_result_for_category(category: Category) -> ClassificationResult:
    """Manual/demo result: explicit selection, no AI involved."""
    return build_from_category(category, source="demo_fallback")


def unavailable_result(reason: str) -> ClassificationResult:
    """Returned when image classification could not run. Asks for manual selection."""
    result = build_from_category(
        Category.UNKNOWN,
        source="demo_fallback",
        item_name="Item not identified",
        material="Unknown",
        reason=(
            "BinVision could not analyse this image, so no item was recognised. "
            "Choose a category manually to see general guidance."
        ),
        fallback_reason=reason,
        uncertain=True,
    )
    return result
