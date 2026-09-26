const searchForm = document.querySelector(".search-form")


searchForm.addEventListener("submit", function(e) {
    e.preventDefault()

    const formData = new FormData(e.target)
    const queryStr = formData.get("query")
})