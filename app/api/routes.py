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

    #MAIN PRODUCT
    main_data = scrape_amazon_reviews(data.main_product)
    main_analysis = analyze_reviews(main_data["reviews"])
    print("Main reviews:", len(main_data["reviews"]))

    #COMPETITORS (single pipeline)
    competitor_analysis_list = []

    for url in data.competitors:
        comp_data = scrape_amazon_reviews(url)
        comp_analysis = analyze_reviews(comp_data["reviews"])
        competitor_analysis_list.append(comp_analysis)

    #COMPARISON
    comparison = compare_products(main_analysis, competitor_analysis_list)
    print("Competitors:", len(competitor_analysis_list))
    
    #INSIGHTS
    insights = generate_insights(main_analysis, comparison)

    return {
        "main": main_analysis,
        "competitors": competitor_analysis_list,
        "comparison": comparison,
        "insights": insights
    }