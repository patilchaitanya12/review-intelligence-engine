import streamlit as st
import requests

API_URL = "http://127.0.0.1:8000/analyze"

st.set_page_config(page_title="Review Intelligence Engine", layout="wide")

st.info("Paste an Amazon product URL to generate insights in seconds")

#HEADER
st.title("🧠 Review Intelligence Engine")
st.caption("Turn product reviews into actionable insights")

#INPUT SECTION
st.subheader("🔍 Analyze a Product")

main_url = st.text_input("Main Product URL")

competitor_urls = st.text_area(
    "Competitor URLs (one per line)",
    placeholder="https://amazon.in/dp/...\nhttps://amazon.in/dp/..."
)

analyze_btn = st.button("🚀 Analyze")

#PROCESS
if analyze_btn and main_url:
    with st.spinner("Analyzing reviews..."):

        competitors = [url.strip() for url in competitor_urls.split("\n") if url.strip()]

        payload = {
            "main_product": main_url,
            "competitors": competitors
        }

        response = requests.post(API_URL, json=payload)

        if response.status_code != 200:
            st.error("Something went wrong!")
        else:
            data = response.json()

        
            #MAIN ANALYSIS
        
            st.subheader("📊 Product Insights")

            col1, col2 = st.columns(2)

            with col1:
                st.markdown("### ✅ Pros")
                for p in data["main"]["pros"]:
                    st.write(f"- {p}")

                st.markdown("### ⚠️ Cons")
                for c in data["main"]["cons"]:
                    st.write(f"- {c}")

            with col2:
                st.markdown("### 🎯 Use Cases")
                for u in data["main"]["use_cases"]:
                    st.write(f"- {u}")

        
            #COMPARISON
        
            st.subheader("🆚 Competitive Analysis")

            comp = data["comparison"]

            col1, col2 = st.columns(2)

            with col1:
                st.markdown("### 💪 Strengths")
                for s in comp["strengths"]:
                    st.write(f"- {s}")

                st.markdown("### ❌ Weaknesses")
                for w in comp["weaknesses"]:
                    st.write(f"- {w}")

            with col2:
                st.markdown("### 📉 Market Gaps")
                for g in comp["market_gaps"]:
                    st.write(f"- {g}")

                st.markdown("### ⚠️ Shared Issues")
                for si in comp["shared_issues"]:
                    st.write(f"- {si}")

        
            #TRATEGY
        
            st.subheader("🧠 Strategic Insights")

            st.markdown(f"**📌 Positioning:** {comp['positioning']}")
            st.markdown(f"**📝 Summary:** {comp['summary']}")

            st.markdown("### 🔧 Improvements")
            for i in comp["improvements"]:
                st.write(f"- {i}")

            st.markdown("### 📢 Marketing Angles")
            for m in comp["marketing_angles"]:
                st.write(f"- {m}")

        
            #FINAL INSIGHTS
        
            st.subheader("💡 Final Recommendations")
            st.write(data["insights"])

# FOOTER
st.markdown("---")
st.caption("Built with ❤️ for product intelligence")