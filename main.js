const searchForm = document.querySelector(".search-form")
const ombdApiBaseUrl = "http://www.omdbapi.com/?i=tt3896198&apikey=d56ba9f8"


searchForm.addEventListener("submit", function(e) {
    e.preventDefault()

    const formData = new FormData(e.target)
    const movieSearchQuery = formData.get("query")
    
    getMovie(movieSearchQuery)
})


function getMovie(movieSearchQuery) {
    const queryStr = `${ombdApiBaseUrl}&t=${movieSearchQuery}`

    fetch(queryStr)
        .then(response => response.json())
        .then(data => console.log(data))
}