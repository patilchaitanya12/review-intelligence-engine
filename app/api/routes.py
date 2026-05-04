from fastapi import APIRouter
from app.models.schemas import AnalyzeRequest
from app.services.scraper import scrape_amazon_reviews
from app.services.analyzer import analyze_reviews
from app.services.comparator import compare_products
from app.services.insights import generate_insights

router = APIRouter()

@router.get("/")
def root():
    return {"message": "Review Intelligence System welcomes you!!"}

@router.post("/analyze")
async def analyze(data: AnalyzeRequest):
    main_data = scrape_amazon_reviews(data.main_product)
    comp_data = [scrape_amazon_reviews(url) for url in data.competitors]

    main_analysis = analyze_reviews(main_data["reviews"])
    comp_analysis = [analyze_reviews(c["reviews"]) for c in comp_data]

    comparison = compare_products(main_analysis, comp_analysis)
    insights = generate_insights(main_analysis, comparison)

    return {
        "main": main_analysis,
        "competitors": comp_analysis,
        "comparison": comparison,
        "insights": insights
    }