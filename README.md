# Gym and Fitness Center Lead Finder

**Extract and automatically qualify gym leads from local directories like YellowPages by flagging businesses that lack a website or have poor customer ratings.**

If you run a marketing agency, a web design firm, or a reputation management SaaS, your best sales targets are businesses that actually *need* your help. This actor doesn't just scrape a list of gyms; it actively qualifies them. 

## What can this Actor do?

- ✅ **Lead Qualification Flags** - Automatically appends `needsWebsite: true` if the gym has no website listed, and `needsReputationManagement: true` if their star rating is below 3.5.
- ✅ **Core Contact Data** - Extracts the Gym's Name, Phone Number, and Physical Address.
- ✅ **Reputation Metrics** - Grabs their current Star Rating and Total Review Count.
- ✅ **High Speed** - Uses `got-scraping` to bypass anti-bot systems while maintaining the blazing fast speeds of a static HTML crawler.

## Why use this Actor?

- 🎯 **Web Design Agencies** - Filter the output for `needsWebsite: true` and instantly get a list of gyms to cold call who desperately need a website.
- 🤝 **Reputation Management SaaS** - Filter for `needsReputationManagement: true` and pitch your review-generation software to gyms with poor ratings.
- 📊 **B2B Equipment Sales** - Sell wholesale gym equipment, software (like Mindbody), or cleaning services to a massive database of verified local gyms.

## How to use it

1. Go to YellowPages (YP.com) and search for "Gyms" or "Fitness Centers" in your target city.
2. Copy the URL from your browser (e.g., `https://www.yellowpages.com/search?search_terms=gyms&geo_location_terms=Los+Angeles%2C+CA`) and paste it into the **YellowPages Search URLs** field.
3. Set the **Max Leads to Extract** limit (default is 500).
4. Click Start!

## How much does it cost?

This actor uses a **Pay-Per-Event (PPE)** pricing model. You only pay for the exact number of leads successfully extracted!
- **$2.00 per 1,000 gym leads extracted.**

## Output Example

When a gym lead is extracted, the actor pushes this data to your dataset:

```json
{
  "businessName": "Iron Paradise Fitness",
  "phone": "(323) 555-1234",
  "address": "123 Muscle Ave, Los Angeles, CA 90001",
  "website": null,
  "rating": "3.1",
  "reviewCount": "12",
  "needsWebsite": true,
  "needsReputationManagement": true,
  "directoryUrl": "https://www.yellowpages.com/los-angeles-ca/mip/iron-paradise-123",
  "scrapedAt": "2023-10-25T15:00:00.000Z"
}
```
