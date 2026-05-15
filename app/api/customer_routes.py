import logging
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import json
import asyncio

from app.services.scraper import scrape_amazon_reviews
from app.services.analyzer import analyze_reviews
from app.services.customer_insights import generate_customer_insights
from app.services.product_search import search_amazon_products

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/customer", tags=["customer"])

class CompareRequest(BaseModel):
    urls: List[str]                  

class SearchCompareRequest(BaseModel):
    query: str                      
    max_results: Optional[int] = 3 

async def _run_comparison_stream(urls: list[str]):
    """
    Core streaming generator used by both /compare and /search-compare.
    Scrapes, analyzes, then generates customer insights.
    """
    try:
        yield f"data: {json.dumps({'log': f'Comparing {len(urls)} products...'})}\n\n"
        await asyncio.sleep(0.1)

        products = []

        for i, url in enumerate(urls, 1):
            yield f"data: {json.dumps({'log': f'Fetching product {i} of {len(urls)}...'})}\n\n"
            await asyncio.sleep(0.1)

            scraped = scrape_amazon_reviews(url)
            asin = scraped.get("normalized_url", url).split("/dp/")[-1].split("/")[0]

            yield f"data: {json.dumps({'log': f'Analyzing product {i} reviews...'})}\n\n"
            analysis = analyze_reviews(scraped["reviews"])

            products.append({
                "asin": asin,
                "url": url,
                "pros": analysis.get("pros", []),
                "cons": analysis.get("cons", []),
                "use_cases": analysis.get("use_cases", []),
            })

            yield f"data: {json.dumps({'log': f'Product {i} done'})}\n\n"
            await asyncio.sleep(0.1)

        yield f"data: {json.dumps({'log': 'Generating recommendation...'})}\n\n"
        insights = generate_customer_insights(products)

        result = {
            "products": products,
            "insights": insights,
        }

        yield f"data: {json.dumps({'log': 'Done!'})}\n\n"
        yield f"data: {json.dumps({'result': result})}\n\n"

    except Exception as e:
        logger.error(f"Customer comparison error: {e}")
        yield f"data: {json.dumps({'error': str(e)})}\n\n"


@router.post("/compare")
async def compare(data: CompareRequest):
    """
    Takes 2-4 Amazon product URLs.
    Returns streaming customer-friendly comparison + recommendation.
    """
    logger.info(f"Customer compare request: {len(data.urls)} URLs")
    return StreamingResponse(
        _run_comparison_stream(data.urls),
        media_type="text/event-stream"
    )


@router.post("/search-compare")
async def search_compare(data: SearchCompareRequest):
    """
    Takes a natural language query.
    Finds top Amazon products, then compares them.
    """
    logger.info(f"Customer search-compare: '{data.query}'")

    async def generator():
        try:
            yield f"data: {json.dumps({'log': f'🔍 Searching for: {data.query}...'})}\n\n"
            await asyncio.sleep(0.1)

            urls = search_amazon_products(data.query, max_results=data.max_results)
            logger.info(f"Found {len(urls)} products for query")

            yield f"data: {json.dumps({'log': f'📋 Found {len(urls)} products — starting comparison...'})}\n\n"
            await asyncio.sleep(0.1)

            async for chunk in _run_comparison_stream(urls):
                yield chunk

        except Exception as e:
            logger.error(f"Search-compare error: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(generator(), media_type="text/event-stream")