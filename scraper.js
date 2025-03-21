import axios from "axios";
import { JSDOM } from "jsdom";

async function article(url) {
    try {
        const { data: html } = await axios.get(url, {
          headers: { "User-Agent": "Mozilla/5.0" }, // Helps avoid bot detection
        });
    
        const dom = new JSDOM(html);//print
        const document = dom.window.document;
        
        const [headline] = document.getElementsByClassName("ArticleHeader-headline");
        const headlinetxt=headline.textContent;
        const articleContent = [];
        const contentElements = document.getElementsByClassName("ArticleBody-articleBody"); // Modify this selector based on the actual class or structure
        const contentElement = contentElements[0];
        console.log(contentElement);
        if (contentElement) {
            const paragraphs = contentElement.querySelectorAll('p');
            console.log(paragraphs.length);
            paragraphs.forEach(p => {
                articleContent.push(p.textContent.trim());
            });
        } else {
            articleContent.push("Article content not found.");
        }

        const returnarr = [headlinetxt, ...articleContent];
        console.log(returnarr);
        return returnarr;

    
      } catch (error) {
        console.error("Error fetching HTML:", error);
      }
}

async function getarticles(url) {
    try {
      const { data: html } = await axios.get(url, {
        headers: { "User-Agent": "Mozilla/5.0" }, // Helps avoid bot detection
      });
  
      const dom = new JSDOM(html);
      const document = dom.window.document;
      let urls = [];
      
      for (let i = 0; i < 5; i++) { // Loop through the 5 news blocks dynamically
        let News = document.getElementById(`QuotePage-latestNews-0-${i}`);
        let [headlines] = News.getElementsByClassName("LatestNews-headline");
        let clubcheck = News.getElementsByClassName("LatestNews-investingClubPill InvestingClubPill-investingClubPill");
        let prochek = News.getElementsByClassName("LatestNews-proPill ProPill-proPill");
        
        if (clubcheck.length === 0 && prochek.length === 0) {
            urls.push(headlines.href);
        }
      }
      return urls;
    } catch (error) {
      console.error("Error fetching HTML:", error);
    }
  }


export  async function fetchArticles(stock) {
    const urls = await getarticles(`https://www.cnbc.com/quotes/${stock}?qsearchterm=`);
    console.log("––––––––––––––––––––––––");
    console.log(urls);
    console.log("––––––––––––––––––––––––");
  
    // Process each URL and gather articles
    const articles = [];
    for (const url of urls) {
      const articleDetails = await article(url);
      if(articleDetails){
        articles.push(articleDetails);
      } 
    }
    
    console.log("Articles:", articles);
    return articles;
  }
