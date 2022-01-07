# Reaktor preassignment

This is the preassignment for Reaktor. The application can be accessed on [Heroku](https://warehouse-stock-app.herokuapp.com/).

The instructions for this assignment are available [here](https://www.reaktor.com/junior-dev-assignment/).

## Notes

- Pagination was not necessary but it speeded up the page rendering by a bit. Filtering became a necessity with pagination.
- To allow for ultra fast speeds the backend caches the slow API content every 5 minutes ensuring it is always available fast and up to date
- If I had more time the next few things I would implement would be a better deployment pipeline, split the main Listing component into separate ones and adopt some library for caching instead of using my own method and fix minor bugs (like the 404 error on manifest.json and the search bar not resetting properly)
