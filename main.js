const searchForm = document.querySelector(".search-form")
const inputBox = document.querySelector("input")
const ombdApiBaseUrl = "http://www.omdbapi.com/?apikey=d56ba9f8"
const moviesListEl = document.querySelector(".movies-list")
const titleCharLimit = 25
const genreTagsLimit = 3
const plotCharLimit = 132
const currentPageId = document.body.id
let moviePlotEl
let movieImdbID
let myMovies

if (searchForm) {
    searchForm.addEventListener("submit", async function(e) {
        e.preventDefault()

        const formData = new FormData(e.target)
        const movieSearchQuery = formData.get("query")

        const movieIds = await getMovieIds(movieSearchQuery)

        if (movieIds.length > 0) {
            const moviesData = await getMoviesData(movieIds)
            renderMovies(moviesData)
        } else {
            moviesListEl.innerHTML = `<p class="initial-text" id="no-results-text">Unable to find what you're looking for. Please try another search.</p>`
            inputBox.value = "Searching something with no data"
        }
    })
}

if (inputBox) {
    inputBox.addEventListener("search", function(e) {
        if (e.target.value === "") {
            renderStartExploringIcon()
        }
    })
}

function renderStartExploringIcon() {
    moviesListEl.innerHTML = `<img class="start-exploring-icon" src="./assets/icons/start-exploring.png" alt="film tape">`
}


async function getMovieIds(movieSearchQuery) {
    const response = await fetch(`${ombdApiBaseUrl}&s=${movieSearchQuery}`)
    const movies = await response.json()

    const movieIds = await (movies.Search ?? []).map((movie) => movie.imdbID)

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

function renderMovieItemDivider(curMovieItemNum, lastMovieItemNum) {
    if (curMovieItemNum !== lastMovieItemNum) {
        return `<hr />`
    }
}

function renderMovies(moviesData) {
    const lastMovieItemNum = moviesData.length
    let curMovieItemNum = 0

    const movieItemsHtml = moviesData.reduce((acc, {Poster: poster, Title: title, Ratings: ratings, Runtime: runtime, Genre: genre, Plot: plot, imdbID}) => {
        curMovieItemNum++
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
                        <div class="watchlist-action">${renderWatchListAction()}</div>
                    </div>
                    ${formatPlot(plot, plotCharLimit)}
                </div>
            </li>
            ${renderMovieItemDivider(curMovieItemNum, lastMovieItemNum) || " "}
        `)
        return acc
    }, [])
    
    moviesListEl.innerHTML = movieItemsHtml.join("")

    const readMoreBtns = document.querySelectorAll(".read-more-btn")

    readMoreBtns.forEach(readMoreBtn => {
        readMoreBtn.addEventListener("click", async function(e) {
            moviePlotEl = e.target.parentElement
            movieImdbID = e.target.parentElement.parentElement.parentElement.id
            moviePlotEl.innerText = await getFullPlot(movieImdbID)
        })
    })

    setWatchlistActionHover()
    setWatchlistActionIconBehavior()
}

async function getFullPlot(movieImdbID) {
    const response = await fetch(`${ombdApiBaseUrl}&i=${movieImdbID}`)
    const movie = await response.json()
    return movie.Plot
}

function renderEmptyWatchList() {
    moviesListEl.innerHTML = `
        <p class="initial-text" id="empty-watchlist-text">Your watchlist is looking a little empty...</p>
        <div class="add-movies-wrapper">
            <a href="./index.html"><img class="add-icon" src="./assets/icons/add.png"></a>
            <p class="add-movies-text">Let's add some movies</p>
        </div>
    `

    document.querySelector(".add-movies-wrapper").addEventListener("mouseenter", function(e) {
        e.target.children[0].children[0].src = "./assets/icons/add-hover.png"
    })

    document.querySelector(".add-movies-wrapper").addEventListener("mouseleave", function(e) {
        e.target.children[0].children[0].src = "./assets/icons/add.png"
    })
}

async function renderWatchList(){
    const moviesData = await getMoviesData(myMovies)
    renderMovies(moviesData)
}

function renderWatchListAction() {
    if (currentPageId === "watchlist") {
        return `
            <img class="watchlist-action-icon" src="./assets/icons/remove.png" alt="minus icon" />
            <p class="watchlist-action-text">Remove</p>
        `
    } else {
        return `
            <img class="watchlist-action-icon" src="./assets/icons/add.png" alt="plus icon" />
            <p class="watchlist-action-text">Watchlist</p>
        `
    }
}

function setWatchlistActionHover() {
    const watchlistActionEls = document.querySelectorAll(".watchlist-action")

    if (currentPageId === "watchlist") {
        watchlistActionEls.forEach(watchlistActionEl => {
            watchlistActionEl.addEventListener("mouseenter", function(e) {
                e.target.children[0].src = "./assets/icons/remove-hover.png"
            })

            watchlistActionEl.addEventListener("mouseleave", function(e) {
                e.target.children[0].src = "./assets/icons/remove.png"
            })
        })
    } else {
        watchlistActionEls.forEach(watchlistActionEl => {
            watchlistActionEl.addEventListener("mouseenter", function(e) {
                e.target.children[0].src = "./assets/icons/add-hover.png"
            })

            watchlistActionEl.addEventListener("mouseleave", function(e) {
                e.target.children[0].src = "./assets/icons/add.png"
            })
        })
    }
}

function setWatchlistActionIconBehavior() {
    const watchlistActionIcons = document.querySelectorAll(".watchlist-action-icon")
    if (currentPageId === "watchlist") {
        watchlistActionIcons.forEach(watchlistActionIcon => {
            watchlistActionIcon.addEventListener("click", function(e) {
                movieImdbID = e.target.parentElement.parentElement.parentElement.parentElement.id
                myMovies = JSON.parse(localStorage.getItem("myMovies")) || []
                if (myMovies.includes(movieImdbID)) {
                    myMovies = myMovies.filter(movieId => movieId !== movieImdbID)
                    localStorage.setItem("myMovies", JSON.stringify(myMovies))
                    renderWatchlistPage()
                }
            })
        })
    } else {
        watchlistActionIcons.forEach(watchlistActionIcon => {
            watchlistActionIcon.addEventListener("click", function(e) {
                movieImdbID = e.target.parentElement.parentElement.parentElement.parentElement.id
                myMovies = JSON.parse(localStorage.getItem("myMovies")) || []
                if (!myMovies.includes(movieImdbID)) {
                    myMovies.push(movieImdbID)
                    localStorage.setItem("myMovies", JSON.stringify(myMovies))

                }
            })
        })
    }
}

function renderWatchlistPage() {
    if (myMovies.length === 0) {
        renderEmptyWatchList()
    } else {
        moviesListEl.style.margin = "2.188em auto 0"
        renderWatchList()
    }
}

if (currentPageId === "watchlist") {
    myMovies = JSON.parse(localStorage.getItem("myMovies")) || []
    renderWatchlistPage()
} else if (inputBox) {
    renderStartExploringIcon()
}

