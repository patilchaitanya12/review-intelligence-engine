from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import json
import asyncio

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

    # MAIN PRODUCT
    main_data = scrape_amazon_reviews(data.main_product)
    main_analysis = analyze_reviews(main_data["reviews"])

    # COMPETITORS
    competitor_analysis_list = []
    for url in data.competitors:
        comp_data = scrape_amazon_reviews(url)
        comp_analysis = analyze_reviews(comp_data["reviews"])
        competitor_analysis_list.append(comp_analysis)

    # COMPARISON
    comparison = compare_products(main_analysis, competitor_analysis_list)

    # INSIGHTS
    insights = generate_insights(main_analysis, comparison)

    return {
        "main": main_analysis,
        "competitors": competitor_analysis_list,
        "comparison": comparison,
        "insights": insights
    }


async def analyze_stream(data: AnalyzeRequest):

    try:
        # START
        yield f"data: {json.dumps({'log': '🔍 Starting analysis...'})}\n\n"
        await asyncio.sleep(0.2)

        # MAIN PRODUCT
        yield f"data: {json.dumps({'log': '📦 Scraping main product...'})}\n\n"
        main_data = scrape_amazon_reviews(data.main_product)

        yield f"data: {json.dumps({'log': f'📊 Found {len(main_data["reviews"])} reviews'})}\n\n"
        await asyncio.sleep(0.2)

        yield f"data: {json.dumps({'log': '🧠 Analyzing main product...'})}\n\n"
        main_analysis = analyze_reviews(main_data["reviews"])

        # COMPETITORS
        competitor_analysis_list = []

        for i, url in enumerate(data.competitors):
            yield f"data: {json.dumps({'log': f'🔗 Scraping competitor {i+1}...'})}\n\n"

            comp_data = scrape_amazon_reviews(url)

            yield f"data: {json.dumps({'log': f'📊 Competitor {i+1}: {len(comp_data["reviews"])} reviews'})}\n\n"

            comp_analysis = analyze_reviews(comp_data["reviews"])
            competitor_analysis_list.append(comp_analysis)

            await asyncio.sleep(0.2)

        # COMPARISON
        yield f"data: {json.dumps({'log': '⚔️ Running comparison engine...'})}\n\n"
        comparison = compare_products(main_analysis, competitor_analysis_list)

        # INSIGHTS
        yield f"data: {json.dumps({'log': '💡 Generating strategic insights...'})}\n\n"
        insights = generate_insights(main_analysis, comparison)

        # FINAL RESULT
        result = {
            "main": main_analysis,
            "competitors": competitor_analysis_list,
            "comparison": comparison,
            "insights": insights
        }

        yield f"data: {json.dumps({'log': '✅ Analysis complete'})}\n\n"
        yield f"data: {json.dumps({'result': result})}\n\n"

    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"


# STREAM ROUTE
@router.post("/analyze-stream")
async def analyze_stream_route(data: AnalyzeRequest):
    return StreamingResponse(
        analyze_stream(data),
        media_type="text/event-stream"
    )