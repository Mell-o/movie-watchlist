const searchForm = document.querySelector(".search-form")
const ombdApiBaseUrl = "http://www.omdbapi.com/?apikey=d56ba9f8"
const moviesListEl = document.querySelector(".movies-list")
const titleCharLimit = 25
const genreTagsLimit = 3
const plotCharLimit = 132
let moviePlotEl
let movieImdbID


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

const formatPoster = (poster) => {
    return `${poster === "N/A" ? "./assets/images/no-poster.jpg" : poster}`
}

const formatTitle = (title, titleCharLimit) => {
    return title.length > titleCharLimit ? `${title.slice(0, titleCharLimit)}...` : title
}

const formatRatings = (ratings) => {
    return ratings.length > 0 ? ratings[0].Value.slice(0, 3) : "0.0"
}

const formatRuntime = (runtime) => {
    return runtime === "N/A" ? "0 min" : runtime
}

const formatGenre = (genre, genreTagsLimit) => {
    return genre === "N/A" ? "No genre tags" : genre.split(", ", genreTagsLimit).join(", ")
}

const formatPlot = (plot, plotCharLimit) => {
    return plot === "N/A" 
    ? `<p class="movie-plot">No description</p>`
    : plot.length > plotCharLimit 
    ? `<p class="movie-plot">${plot.slice(0, plotCharLimit).trim()}...<button class="read-more-btn">Read more</button></p>` 
    : `<p class="movie-plot">${plot}</p>`

}

function renderMovies(moviesData) {
    const movieItemsHtml = moviesData.reduce((acc, {Poster: poster, Title: title, Ratings: ratings, Runtime: runtime, Genre: genre, Plot: plot, imdbID}) => {
        acc.push(`
            <li class="movie-item" id="${imdbID}">
                <img class="movie-poster" alt="movie poster" src="${formatPoster(poster)}" onerror="this.onerrorr=null; this.src='./assets/images/broken-image.png';"/>
                <div class="movie-details">
                    <div class="movie-header-row">
                        <h3 class="movie-title">${formatTitle(title, titleCharLimit)}</h3>
                        <img class="star-icon" src="./assets/icons/star.png" alt="star" />
                        <span class="movie-ratings">${formatRatings(ratings)}</span>
                    </div>
                    <div class=movie-meta-row>
                        <span class="movie-runtime">${formatRuntime(runtime)}</span>
                        <span class="movie-genre">${formatGenre(genre, genreTagsLimit)}</span>
                        <div class="add-wrapper">
                            <img class="add-icon" src="./assets/icons/add-1.png" />
                            <div>Watchlist</div>
                        </div>
                    </div>
                    ${formatPlot(plot, plotCharLimit)}
                </div>
            </li>
            <hr />
        `)
        return acc
    }, [])
    moviesListEl.innerHTML = movieItemsHtml.join("")

    const readMoreBtns = document.querySelectorAll(".read-more-btn")

    readMoreBtns.forEach(async readMoreBtn => {
        readMoreBtn.addEventListener("click", async function(e) {
            moviePlotEl = e.target.parentElement
            movieImdbID = e.target.parentElement.parentElement.parentElement.id
            moviePlotEl.innerText = await getFullPlot(movieImdbID)
        })
    })
}

async function getFullPlot(movieImdbID) {
    const response = await fetch(`${ombdApiBaseUrl}&i=${movieImdbID}`)
    const movie = await response.json()

    return movie.Plot
}