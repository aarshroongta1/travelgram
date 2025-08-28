# Travelgram
Everything you need for your next trip, captured in reels.

![landing](landing.png)

## About

Travelgram transforms trip planning by organizing scattered travel content on Instagram Reels. Replace long articles and random posts with quick Reels sorted into categories like food, nightlife, things to do, adventure and culture that bring every destination to life.

Whether you’re looking for hidden gems, must-see attractions or travel tips, Travelgram makes it effortless to discover authentic experiences and save them for when you’re ready to go.

## Tech stack
- Frontend: React (Typescript) in Vite + Tailwind CSS + Headless UI for advanced components like autocomplete and tabs
- Backend: FastAPI
- External API: [Geo DB Cities](https://rapidapi.com/wirefreethought/api/geodb-cities) for data on world cities
- Scraping: Playwright (browser automation) + Beautiful Soup (HTML parsing)
- Database: PostgresSQL + SQLAlchemy ORM
- Authentication: JWT-based Authentication
- Containerization: Docker
- Reverse-proxying: Nginx

## Key Features
### Autocomplete city search
Search box with autocomplete suggestions that includes all cities in the world.
- The list of cities that start with a prefix is fetched from the [GeoDB Cities API](https://rapidapi.com/wirefreethought/api/geodb-cities).
- The query parameter ``sort=-population`` sorts the cities in descending order of population to show the more popular destinations first.
- Suggestions are limited to 5 options and shown only when the user has typed 3 or more characters for rate-limiting.

### Reels by category
What makes Travelgram more accessible than a regular Google or Instagram search is the feature of getting reels by categories, which makes it easy for you to plan your itinerary.
- As soon as the search is made, all the reels saved in the database for that city are returned immediately.
- The user sees the All tab by default which shows all reels with a tab on the top to switch to a particular category.
- New reels are fetched in the following two scenarios:
  - **Tab Switch:** If the current category has fewer than 12 reels (~2 rows on desktop), 6 more reels are fetched to fill the grid.
  - **Infinite Scroll:** A marker at the bottom of the grid is tracked as the user scrolls. When it comes into view, more reels are automatically fetched and appended until the backend indicates that no new results are available.
- If the user switches tabs between a request, the request for the previous category is aborted and priority is given to fetching results for the new category.
  
### Saved collections
- The reel cards displayed have a save button, which saves the reel into the user’s collection.
- User can view all the reels they have saved by city and category, making it ideal to come back for reference while planning their trips.

## Collecting Reels Data
- Playwright is used to launch a browser to make dynamic search queries on Bing for reels in each category.
- Result URLs that contain instagram.com/reel are collected from the page until the required number is achieved. If not, the browser navigates to the next page. A set is used to check for duplicates throughout.
- This new page number is stored in the database. When the same search is made again, Playwright navigates to this new page before extracting links.
- Beautiful Soup is used to fetch metadata like the poster's username, caption, and thumbnail image from these URLs.
- Reel objects are created with this information, which are returned by the endpoint in the format
```
{
  "cafes": [ {...}, {...} ],
  "restaurants": [ {...}, {...} ],
  "nightlife": [ {...}, {...} ]
}
```
