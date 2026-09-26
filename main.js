const searchForm = document.querySelector(".search-form")
const ombdApiBaseUrl = "http://www.omdbapi.com/?i=tt3896198&apikey=c971e1aa"


searchForm.addEventListener("submit", function(e) {
    e.preventDefault()

    const formData = new FormData(e.target)
    const queryStr = formData.get("query")
})