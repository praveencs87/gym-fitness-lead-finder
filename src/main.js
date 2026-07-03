import { armKillSwitch, disarmKillSwitch } from './utils/timeoutManager.js';
import { Actor } from 'apify';
import { CheerioCrawler, log } from 'crawlee';

await Actor.init();

try {
    const input = await Actor.getInput();
    if (!input || !input.searchUrls || input.searchUrls.length === 0) {
        throw new Error('searchUrls input is required!');
    }

    const { searchUrls, maxLeads = 500 } = input;

    let totalLeadsExtracted = 0;

    const crawler = new CheerioCrawler({
        maxConcurrency: 5,
        maxRequestRetries: 3,
        
        async requestHandler({ request, $, log }) {
            const url = request.url;
            log.info(`Scraping Directory Page: ${url}`);
            
            // Check for bot block
            if ($('title').text().toLowerCase().includes('robot') || $('title').text().toLowerCase().includes('captcha')) {
                throw new Error('Blocked by security check. Retrying with new fingerprint...');
            }

            const cards = $('.result, .srp-listing, .business-card').toArray();
            let leadsOnPage = 0;

            for (const card of cards) {
                if (totalLeadsExtracted >= maxLeads) break;

                const el = $(card);
                
                // Basic Info
                let businessName = el.find('.business-name, h2 a, .info h2').text().trim() || null;
                let phone = el.find('.phone, .phones').text().trim() || null;
                
                // Address handling (YP usually uses street-address and locality)
                let street = el.find('.street-address').text().trim() || '';
                let locality = el.find('.locality').text().trim() || '';
                let address = street && locality ? `${street}, ${locality}` : (street || locality || null);
                
                if (!address) {
                    address = el.find('.adr, .address').text().trim().replace(/\s+/g, ' ') || null;
                }

                // Website Link
                let websiteHref = el.find('a.track-visit-website, a[href^="http"].website').attr('href') || null;
                if (websiteHref && websiteHref.includes('yellowpages.com')) websiteHref = null; // Ignore internal routing links

                // Rating & Reviews
                let ratingClass = el.find('.result-rating').attr('class') || '';
                let rating = null;
                const ratingMatch = ratingClass.match(/rating?s?-?([\d\.]+)/i); // Extracts "45" for 4.5 stars in YP
                if (ratingMatch) {
                    rating = (parseInt(ratingMatch[1]) / 10).toString();
                } else {
                    // Fallback to text
                    rating = el.find('.rating, .star-rating').text().trim() || null;
                }

                let reviewCount = el.find('.count, .reviews').text().trim() || null;
                if (reviewCount) reviewCount = reviewCount.replace(/[()]/g, '').replace('reviews', '').trim();

                // Profile URL
                let profileHref = el.find('.business-name').attr('href') || el.find('h2 a').attr('href') || null;
                let directoryUrl = profileHref ? (profileHref.startsWith('http') ? profileHref : `https://www.yellowpages.com${profileHref}`) : null;

                if (!businessName) continue;

                // --- LEAD QUALIFICATION LOGIC ---
                const numRating = parseFloat(rating) || 0;
                const numReviews = parseInt(reviewCount) || 0;

                const needsWebsite = websiteHref === null;
                const needsReputationManagement = numRating < 3.5 || numReviews === 0;

                const output = {
                    businessName,
                    phone,
                    address,
                    website: websiteHref,
                    rating,
                    reviewCount,
                    needsWebsite,
                    needsReputationManagement,
                    directoryUrl,
                    scrapedAt: new Date().toISOString()
                };

                await Actor.pushData(output);
                
                totalLeadsExtracted++;
                leadsOnPage++;
                
                // PPE Monetization
                await Actor.charge({ eventName: 'lead-extracted', count: 1 });
            }

            log.info(`✅ Extracted ${leadsOnPage} gym leads from this page. Total so far: ${totalLeadsExtracted}`);
            
            // Pagination logic
            if (totalLeadsExtracted < maxLeads) {
                const nextBtn = $('a.next, a.next-ajax, a[rel="next"]').attr('href');
                if (nextBtn) {
                    let nextUrl = nextBtn.startsWith('http') ? nextBtn : new URL(nextBtn, 'https://www.yellowpages.com').href;
                    log.info(`Enqueueing next page: ${nextUrl}`);
                    await crawler.addRequests([nextUrl]);
                }
            }
        },
        
        async failedRequestHandler({ request, log }) {
            log.error(`Failed to scrape ${request.url} after multiple retries.`);
        },
    });

    log.info(`Starting Gym Lead Finder for ${searchUrls.length} start URLs...`);
    
    await crawler.addRequests(searchUrls);
    armKillSwitch(crawler);
    await crawler.run();
    disarmKillSwitch();

    log.info(`🎉 Finished! Extracted ${totalLeadsExtracted} gym leads.`);
} catch (error) {
    log.error('Actor failed:', error);
    throw error;
}

await Actor.exit();
