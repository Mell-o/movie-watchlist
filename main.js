const searchForm = document.querySelector(".search-form")
const ombdApiBaseUrl = "http://www.omdbapi.com/?apikey=d56ba9f8"
const moviesListEl = document.querySelector(".movies-list")


searchForm.addEventListener("submit", async function(e) {
    e.preventDefault()

    const formData = new FormData(e.target)
    const movieSearchQuery = formData.get("query")

    const movieIds = await getMovieIds(movieSearchQuery)

    if (movieIds.length > 0) {
        const moviesData = await getMoviesData(movieIds)
        renderMovies(moviesData)
    } else {
        console.log("No results!")
    }
})


async function getMovieIds(movieSearchQuery) {
    const response = await fetch(`${ombdApiBaseUrl}&s=${movieSearchQuery}`)
    const movies = await response.json()

    const movieIds = await movies.Search.map((movie) => movie.imdbID)

    return movieIds ?? []
}

async function getMoviesData(movieIds) {
    let moviesData = []

    for (const movieId of movieIds) {
        const response = await fetch(`${ombdApiBaseUrl}&i=${movieId}`)
        const movieData = await response.json()
        moviesData.push(movieData)
    }

    return moviesData
}

function renderMovies(moviesData) {
    const movieItemsHtml = moviesData.reduce((acc, {Poster, Title, Ratings, Runtime, Genre, Plot}) => {
        console.log(Poster)
        acc.push(`
            <li class="movie-item">
                <img class="movie-poster" alt="movie poster" src="${Poster === "N/A" ? "./assets/images/no-poster.jpg" : Poster}" onerror="this.onerrorr=null; this.src='./assets/images/broken-image.png';"/>
                <div class="movie-details">
                    <div class="movie-header-row">
                        <h3 class="movie-title">${Title.length > 25 ? `${Title.slice(0, 25)}...` : Title}</h3>
                        <img class="star-icon" src="./assets/icons/star.png" alt="star" />
                        <span class="movie-ratings">${Ratings.length > 0 ? Ratings[0].Value.slice(0, 3) : "0.0"}</span>
                    </div>
                    <div class=movie-meta-row>
                        <span class="movie-runtime">${Runtime === "N/A" ? "0 min" : Runtime}</span>
                        <span class="movie-genre">${Genre === "N/A" ? "No genre tags" : Genre.split(", ", 3).join(", ")}</span>
                        <div class="add-wrapper">
                            <img class="add-icon" src="./assets/icons/add-1.png" />
                            <div>Watchlist</div>
                        </div>
                    </div>
                    ${Plot !== "N/A" ? Plot.length > 132 ? `<p class="movie-plot">${Plot.slice(0, 132).trim()}...<button class="read-more-btn">Read more</button></p>` : `<p class="movie-plot">${Plot}</p>` : `<p class="movie-plot">No description</p>`}
                </div>
            </li>
            <hr />
        `)
        return acc
    }, [])
    moviesListEl.innerHTML = movieItemsHtml.join("")
}