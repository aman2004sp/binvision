"""Curated, provider-independent disposal knowledge base (baseline guidance only).

This is general guidance, NOT municipal regulation. Every entry carries a local-variation note.
"""
from __future__ import annotations

from ..models import Category, CategoryGuidance, KnowledgeBase

KB_VERSION = "1.0.0"

LOCAL_NOTICE = (
    "Disposal rules vary by city and municipality. Treat this as general guidance and "
    "check with your local waste authority or collection service for the rules that apply to you."
)

_LOCAL = {
    Category.PAPER: "Some areas do not accept shredded paper, wax-coated or food-soiled paper in recycling.",
    Category.PLASTIC: "Accepted plastic types and numbers differ widely between collection services.",
    Category.METAL: "Most services take cans and clean foil, but rules on aerosols and scrap metal differ.",
    Category.GLASS: "Some services want glass separated by colour or taken to bottle banks; ceramics and window glass are usually excluded.",
    Category.ORGANIC: "Home composting, municipal food-waste bins and garden-waste collection are all offered differently by place.",
    Category.EWASTE: "E-waste take-back schemes, retailer drop-offs and legal requirements differ by region.",
    Category.HAZARDOUS: "Hazardous household waste is usually handled through special collection points or events; check yours.",
    Category.RESIDUAL: "What counts as residual waste depends on what your local recycling and composting services accept.",
    Category.TEXTILE: "Textile banks, charity shops and take-back schemes vary; many areas do not accept textiles in recycling bins.",
    Category.UNKNOWN: "When an item is unclear, your local waste authority is the best source of an answer.",
}

_ENTRIES: list[CategoryGuidance] = [
    CategoryGuidance(
        id=Category.PAPER,
        label="Paper & Cardboard",
        summary="Clean, dry paper and cardboard that can be pulped and reused.",
        examples=["Newspapers", "Cardboard boxes", "Office paper", "Paper bags", "Egg cartons"],
        preparation_steps=[
            "Remove plastic wrap, tape and staples where easy to do.",
            "Flatten boxes to save space.",
            "Keep it dry and free of food or grease.",
        ],
        disposal_route="Dry recyclables / paper recycling collection.",
        common_mistakes=[
            "Putting greasy pizza boxes or food-soiled paper in recycling.",
            "Recycling wet or heavily contaminated paper.",
            "Leaving plastic windows or bubble wrap attached.",
        ],
        safety=None,
        local_variation_note=_LOCAL[Category.PAPER],
    ),
    CategoryGuidance(
        id=Category.PLASTIC,
        label="Plastic",
        summary="Plastic packaging and containers; acceptance depends on the plastic type.",
        examples=["Water bottles", "Detergent bottles", "Food tubs", "Plastic bags (often separate)", "Takeaway containers"],
        preparation_steps=[
            "Empty the container and give it a quick rinse.",
            "Replace the cap if your local service asks for it.",
            "Check the resin code (the number in the triangle) against local rules.",
        ],
        disposal_route="Dry recyclables collection if the plastic type is accepted; otherwise residual waste.",
        common_mistakes=[
            "Recycling dirty containers with food residue.",
            "Putting soft plastic film and bags in the regular recycling bin.",
            "Assuming every plastic with a recycling symbol is accepted locally.",
        ],
        safety=None,
        local_variation_note=_LOCAL[Category.PLASTIC],
    ),
    CategoryGuidance(
        id=Category.METAL,
        label="Metal",
        summary="Cans, tins and clean metal packaging that can be melted and reused.",
        examples=["Drink cans", "Food tins", "Clean aluminium foil", "Metal jar lids"],
        preparation_steps=[
            "Empty the item and rinse off food residue.",
            "Squash cans only if your local service allows it.",
            "Keep labels on unless asked to remove them.",
        ],
        disposal_route="Dry recyclables collection, or a scrap-metal point for larger items.",
        common_mistakes=[
            "Putting full or part-full aerosol cans in with normal recycling.",
            "Recycling heavily food-soiled foil.",
        ],
        safety="Sharp edges on opened tins can cut; handle with care. Do not puncture or crush aerosol cans.",
        local_variation_note=_LOCAL[Category.METAL],
    ),
    CategoryGuidance(
        id=Category.GLASS,
        label="Glass",
        summary="Glass bottles and jars that can be recycled repeatedly.",
        examples=["Glass bottles", "Food jars", "Sauce bottles"],
        preparation_steps=[
            "Empty the bottle or jar and rinse it.",
            "Remove lids and recycle them separately if accepted.",
            "Sort by colour if your local service asks for it.",
        ],
        disposal_route="Glass recycling collection or a local bottle bank.",
        common_mistakes=[
            "Mixing in ceramics, mirrors, drinking glasses or window glass.",
            "Leaving food or liquid inside.",
        ],
        safety="Broken glass is a cutting hazard. Wrap it securely (for example in thick paper or cardboard), label it, and follow local guidance rather than putting it loose into a bin.",
        local_variation_note=_LOCAL[Category.GLASS],
    ),
    CategoryGuidance(
        id=Category.ORGANIC,
        label="Organic / Compostable",
        summary="Food scraps and garden waste that can break down into compost.",
        examples=["Fruit and vegetable peels", "Coffee grounds", "Tea bags", "Eggshells", "Garden trimmings"],
        preparation_steps=[
            "Remove packaging, stickers and any plastic.",
            "Use a compost bin or food-waste collection if available.",
            "Drain excess liquid to avoid smells.",
        ],
        disposal_route="Home compost, municipal food-waste or garden-waste bin.",
        common_mistakes=[
            "Putting food scraps in plastic bags that are not compostable.",
            "Adding meat, dairy or oily food to a basic home compost heap.",
            "Assuming 'biodegradable' packaging can go in any compost.",
        ],
        safety=None,
        local_variation_note=_LOCAL[Category.ORGANIC],
    ),
    CategoryGuidance(
        id=Category.EWASTE,
        label="E-waste",
        summary="Electrical and electronic items that contain valuable and hazardous materials.",
        examples=["Old phones", "Chargers and cables", "Headphones", "Laptops", "Small appliances"],
        preparation_steps=[
            "Back up and erase personal data from devices.",
            "Keep the item intact; do not open or dismantle it.",
            "Take it to an e-waste collection point or retailer take-back scheme.",
        ],
        disposal_route="Dedicated e-waste drop-off, retailer take-back or municipal e-waste collection.",
        common_mistakes=[
            "Throwing electronics into household bins.",
            "Leaving batteries inside devices that are damaged or swollen.",
            "Taking devices apart at home.",
        ],
        safety="Do not dismantle electronics. Damaged, swollen or hot devices with lithium batteries can start fires; keep them away from heat and contact local authorities for advice.",
        local_variation_note=_LOCAL[Category.EWASTE],
    ),
    CategoryGuidance(
        id=Category.HAZARDOUS,
        label="Batteries & Hazardous",
        summary="Batteries and household chemicals that need special handling.",
        examples=["AA/AAA batteries", "Phone and laptop batteries", "Paint", "Cleaning chemicals", "Light bulbs (CFL)"],
        preparation_steps=[
            "Keep items in their original container where possible.",
            "Tape the terminals of loose batteries or bag each one separately.",
            "Store away from heat, children and pets until drop-off.",
        ],
        disposal_route="Battery collection point or hazardous household waste facility.",
        common_mistakes=[
            "Putting batteries in the bin or normal recycling.",
            "Mixing different chemicals together.",
            "Pouring chemicals down the drain.",
        ],
        safety="Never puncture, crush or burn batteries, and never mix chemicals. If a battery is damaged, leaking or swollen, handle it carefully and ask your local waste authority for advice.",
        local_variation_note=_LOCAL[Category.HAZARDOUS],
    ),
    CategoryGuidance(
        id=Category.TEXTILE,
        label="Textiles",
        summary="Clothes and fabric items that can often be reused or recycled.",
        examples=["Worn clothing", "Bedsheets", "Towels", "Shoes (paired)"],
        preparation_steps=[
            "Wash and dry items if you plan to donate or reuse them.",
            "Bag clean textiles together; keep shoes in pairs.",
            "Take wearable items to a donation point; use a textile bank for worn-out ones.",
        ],
        disposal_route="Donation, textile bank or take-back scheme; residual waste if nothing else is available.",
        common_mistakes=[
            "Putting textiles in regular recycling bins.",
            "Donating wet or heavily soiled items.",
        ],
        safety=None,
        local_variation_note=_LOCAL[Category.TEXTILE],
    ),
    CategoryGuidance(
        id=Category.RESIDUAL,
        label="Residual / Non-recyclable",
        summary="Items that cannot be recycled or composted locally.",
        examples=["Used tissues", "Chip packets", "Broken ceramics", "Disposable nappies", "Dirty wrappers"],
        preparation_steps=[
            "Check first whether any part can be recycled or composted.",
            "Bag the waste to keep the bin clean.",
            "Place it in your general waste bin.",
        ],
        disposal_route="General (residual) waste collection.",
        common_mistakes=[
            "Putting non-recyclable items in recycling bins, which can contaminate a whole batch.",
            "Wishful recycling: guessing that an item is accepted when unsure.",
        ],
        safety="Wrap sharp items (for example razor blades) securely before bagging.",
        local_variation_note=_LOCAL[Category.RESIDUAL],
    ),
    CategoryGuidance(
        id=Category.UNKNOWN,
        label="Unknown / Uncertain",
        summary="Items BinVision cannot classify reliably.",
        examples=["Blurry or obscured items", "Mixed-material objects", "Unlabelled containers"],
        preparation_steps=[
            "Retake the photo in good light, with the item centred and unobstructed.",
            "Check any labels or recycling symbols on the item.",
            "Choose the category manually if you know the material.",
        ],
        disposal_route="Ask your local waste authority; use general waste only if you are certain it is not hazardous.",
        common_mistakes=[
            "Guessing and putting uncertain items in recycling.",
            "Putting unknown liquids or chemicals in a normal bin.",
        ],
        safety="If the item might be a chemical, battery, medical or sharp item, do not guess: ask your local waste authority.",
        local_variation_note=_LOCAL[Category.UNKNOWN],
    ),
]

_BY_ID = {e.id: e for e in _ENTRIES}


def get_knowledge_base() -> KnowledgeBase:
    return KnowledgeBase(version=KB_VERSION, disclaimer=LOCAL_NOTICE, categories=list(_ENTRIES))


def get_guidance(category: Category) -> CategoryGuidance:
    return _BY_ID[category]


# Words providers may return, mapped to our normalized categories.
_ALIASES: dict[str, Category] = {
    "paper": Category.PAPER, "cardboard": Category.PAPER, "paper_cardboard": Category.PAPER,
    "paper and cardboard": Category.PAPER, "paper & cardboard": Category.PAPER,
    "plastic": Category.PLASTIC,
    "metal": Category.METAL, "aluminum": Category.METAL, "aluminium": Category.METAL, "steel": Category.METAL,
    "glass": Category.GLASS,
    "organic": Category.ORGANIC, "compost": Category.ORGANIC, "compostable": Category.ORGANIC,
    "food waste": Category.ORGANIC, "organic waste": Category.ORGANIC,
    "ewaste": Category.EWASTE, "e-waste": Category.EWASTE, "e_waste": Category.EWASTE,
    "electronics": Category.EWASTE, "electronic": Category.EWASTE,
    "batteries_hazardous": Category.HAZARDOUS, "battery": Category.HAZARDOUS, "batteries": Category.HAZARDOUS,
    "hazardous": Category.HAZARDOUS, "hazardous waste": Category.HAZARDOUS, "chemical": Category.HAZARDOUS,
    "residual": Category.RESIDUAL, "trash": Category.RESIDUAL, "general waste": Category.RESIDUAL,
    "non-recyclable": Category.RESIDUAL, "landfill": Category.RESIDUAL,
    "textile": Category.TEXTILE, "textiles": Category.TEXTILE, "clothing": Category.TEXTILE, "fabric": Category.TEXTILE,
    "unknown": Category.UNKNOWN, "uncertain": Category.UNKNOWN,
}


def normalize_category(raw: str | None) -> Category:
    """Map free-text provider output onto our enum. Unrecognised values become UNKNOWN."""
    if not raw:
        return Category.UNKNOWN
    key = str(raw).strip().lower().replace("-", " ").replace("_", " ")
    for candidate in (key, key.replace(" ", "_"), key.replace(" ", "-")):
        if candidate in _ALIASES:
            return _ALIASES[candidate]
    try:
        return Category(str(raw).strip().lower())
    except ValueError:
        return Category.UNKNOWN
