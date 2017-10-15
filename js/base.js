// Listen for DOM loaded, check for template support and set up pagination.
// Pagination is not very robust, as it simply reads from the ? regardless of parameter.
document.addEventListener("DOMContentLoaded", function () {
    var contentIsSupported = 'content' in document.createElement('template');
    if (contentIsSupported) {
        var startPokemon;
        if (window.location.href.indexOf("?") === -1) {
            startPokemon = 0;
        } else {
            startPokemon = parseInt(window.location.href.substr(window.location.href.indexOf("?") + 1));
        }
        var pokemonPerPage = 8;
        var prevPage = window.location.pathname + "?" + (startPokemon - pokemonPerPage);
        var nextPage = window.location.pathname + "?" + (startPokemon + pokemonPerPage);
        mainPage.pagination(prevPage, nextPage);

        var fetchURL = "https://pokeapi.co/api/v2/pokemon/?limit=" + pokemonPerPage + "&offset=" + startPokemon;
        fetch(fetchURL)
            .then(data => data.json())
            .then(function (data) {
                mainPage.setup(data);
            });
    }
    compareData = new CompareData();
    if (typeof compareData !== "undefined"){
        mainPage.addComparisonButtons();
    }
});
// This class handles the population and styling of the page.
class Page {
    pagination(prev, next) {
        var prevButton = document.querySelector(".prev");
        var nextButton = document.querySelector(".next");

        prevButton.href = prev;
        nextButton.href = next;
    }
    setup(data) {
        var results = data.results;
        results.forEach(function (oneResult) {
            pokeData.getPokemon(oneResult);
        });
    }
    prepareTemplates(data) {
        var template = document.querySelector("#galleryItemTemplate");
        var galleryItemClone = document.importNode(template.content, true);
        var name = galleryItemClone.querySelector("h2.name");
        var types = galleryItemClone.querySelector(".abilities");
        var img = document.createElement('img');
        var card = galleryItemClone.querySelector(".pokeCard");
        var heart = document.createElement("button");
        var examineButton = galleryItemClone.querySelector(".examine");
        var compareButton = galleryItemClone.querySelector(".compare");

        for (var j = 0; j < data.types.length; j++){
            var span = document.createElement('span');
            span.setAttribute('class', 'pill');
            var text = document.createTextNode(data.types[j].type.name);

            switch(data.types[j].type.name){
                case "fire":
                    span.style.backgroundColor = "rgba(182, 56, 50, 0.5)";
                    break;
                case "poison":
                    span.style.backgroundColor = "rgba(145, 62, 142, 0.5)";
                    break;
                case "water":
                    span.style.backgroundColor = "rgba(59, 92, 141, 0.5)";
                    break;
                case "grass":
                    span.style.backgroundColor = "rgba(60, 141, 60, 0.5)";
                    break;
                case "flying":
                    span.style.backgroundColor = "rgba(183, 161, 36, 0.5)";
                    break;
                case "bug":
                    span.style.backgroundColor = "rgba(166, 96, 8, 0.5)";
                    break;
                case "normal":
                    span.style.backgroundColor = "rgba(56, 166, 166, 0.5)";
                    break;
                case "ground":
                    span.style.backgroundColor = "rgba(132, 73, 47, 0.50)";
                    break;
                case "electric":
                    span.style.backgroundColor = "rgba(0, 96, 132, 0.50)";
                    break;
                default:
                    span.style.backgroundColor = "rgba(143, 143, 143, 0.5)";
                    break;
            }
            span.appendChild(text);
            types.appendChild(span);
        }

        name.textContent = data.name;
        img.setAttribute('src', data.sprites.front_default);
        img.setAttribute('class', 'image card-image-top');
        card.insertBefore(img, name);
        heart.setAttribute('onclick', 'pokeData.toggleFavorite()');
        heart.setAttribute('class', 'heart');
        examineButton.setAttribute('onclick', 'pokeData.examinePokemon()'); //TODO: Call from Page
        compareButton.setAttribute('onclick', 'compareData.updateComparisons()'); //TODO: Call from Page

        if (data.isFavorite) {
            this.setHeart(heart, true)
        }
        card.insertBefore(heart, name);

        var childObj = galleryItemClone.querySelector(".item");
        var parent = document.querySelector("#itemList");
        var childClone = childObj.cloneNode(true);
        parent.appendChild(childClone);
    }
    // Set "Favorite" heart based off of the current status of the heart.
    setHeart(heart, status) {
        if (status) {
            heart.style.backgroundPosition = "100% 0";
        } else {
            heart.style.backgroundPosition = "0 0";
        }
    }
    //TODO: Fix a bug that occurs when removing both of the comparison buttons and adding a new one.
    //TODO: Causes an array entry to become lodged in the array, due to the way the buttons are removed.
    addComparisonButtons() {
        if (compareData.comparisons.length > 0) {
            this.comparisonContainer = document.querySelector(".comparisonContainer");
            this.compareButton = this.comparisonContainer.querySelector(".compareTwoPokemon");

            var compareCount = compareData.comparisons.length;
            var indexToAdd;
            if (compareCount > 1) {
                indexToAdd = 1;
                this.compareButton.disabled = false;
                this.compareButton.style.backgroundColor = "rgba(255, 225, 58, 0.25)";
                this.compareButton.style.boxShadow = "0 0 0 3px rgba(255, 225, 58, 0.51)";
                this.compareButton.addEventListener('click', function () {
                    compareData.comparePokemon(compareData.comparisons)
                });
            }
            else {
                indexToAdd = 0;
            }
            var button = document.createElement('button');
            button.setAttribute('class', 'compareName');
            button.textContent = compareData.comparisons[indexToAdd].name;

            var pokeSpan = document.createElement('span');
            pokeSpan.setAttribute('class', 'hide');
            pokeSpan.textContent = "\u2A09";

            button.appendChild(pokeSpan);
            this.comparisonContainer.appendChild(button);

            pokeSpan.addEventListener('click', function () {
                this.removeComparisonButton(compareData.comparisons[indexToAdd], indexToAdd, button, pokeSpan);
            }.bind(this));
        }
    }
    removeComparisonButton(data, posInComparisonsArray, button, span) {
        button.removeChild(span);
        this.comparisonContainer.removeChild(button);
        this.compareButton.disabled = true;
        this.compareButton.style.backgroundColor = "rgba(143, 143, 143, 0.5)";
        this.compareButton.style.boxShadow = "none";
        compareData.removeData(data, posInComparisonsArray); // posInComparisonsArray breaks here, when all data appears to be removed.
    }
}
// This class handles the pushing and pulling of data from localStorage,
// as well as fetching from the API when the data becomes stale (currently 10 minutes).
class Pokedata {
    constructor() {
        if (localStorage.getItem("pokeStore") === null) {
            this.pokeStore = [];
        }
        else {
            this.pokeStore = JSON.parse(localStorage.getItem("pokeStore"));
        }
    }
    getPokemon(oneResult) {
        var isInPokeStore;
        var posInPokeStore;

        this.pokeStore.forEach(function (arrayMember, i) {
            if (arrayMember.name === oneResult.name) {
                var msSinceRefresh = new Date() - new Date(arrayMember.lastRefreshed);
                if (msSinceRefresh < (10 * 60 * 1000)) {
                    isInPokeStore = true;
                    posInPokeStore = i;
                }
            }
        });
        if (isInPokeStore) {
            mainPage.prepareTemplates(this.pokeStore[posInPokeStore]);
        }
        else {
            this.fetchFromAPI(oneResult)
                .then(data => data.json())
                .then(function (data) {
                    data.lastRefreshed = new Date();
                    posInPokeStore = pokeData.updatePokeStore(data);
                    mainPage.prepareTemplates(this.pokeStore[posInPokeStore]);
                }.bind(this));
        }
    }
    fetchFromAPI(oneResult){
        return fetch(oneResult.url);
    }
    updatePokeStore(onePokemon){
        var isInPokeStore;
        var posInPokeStore;
        onePokemon.lastUpdated = new Date();
        this.pokeStore.forEach(function (arrayMember, i) {
            if (arrayMember.id === onePokemon.id) {
                isInPokeStore = true;
                posInPokeStore = i;
            }
        });
        if (isInPokeStore) {
            if (this.pokeStore[posInPokeStore].isFavorite) {
                onePokemon.isFavorite = true;
            }
            this.pokeStore.splice(posInPokeStore, 1, onePokemon);
        }
        else {
            posInPokeStore = this.pokeStore.push(onePokemon) - 1;
        }
        this.updateLocalStorage();
        return posInPokeStore;
    }
    updateLocalStorage() {
        localStorage.setItem('pokeStore', JSON.stringify(this.pokeStore));
    }
    //TODO: Create additional modal to display currently favorited Pokemon.
    toggleFavorite(){
        var pokemonName = event.srcElement.parentElement.querySelector("h2.name").textContent;
        this.pokeStore.forEach(function (arrayMember, i) {
            if (arrayMember.name === pokemonName) {
                if (arrayMember.isFavorite) {
                    delete arrayMember.isFavorite;
                    mainPage.setHeart(event.srcElement, false);
                }
                else {
                    arrayMember.isFavorite = true;
                    mainPage.setHeart(event.srcElement, true);
                }
            }
        });
        this.updateLocalStorage();
    }
    examinePokemon() {
        var pokemonName = event.srcElement.parentElement.parentElement.querySelector("h2.name").textContent;
        pokeData.pokeStore.forEach(function (arrayMember, i) {
            if (arrayMember.name === pokemonName) {
                var examine = new Examine(event.srcElement, arrayMember);
                examine.setModalContent();
            }
        });
    }
}
// CompareData manages the comparisons array, pushing when a new entry is selected.
// Currently a bug prevents removeData from correctly splicing the entries from the array, causing this to break.
class CompareData {
    constructor() {
        if (localStorage.getItem("comparisons") === null){
            this.comparisons = []
        }
        else {
            this.comparisons = JSON.parse(localStorage.getItem("comparisons"));
        }
    }
    updateComparisons(){
        var pokemonName = event.srcElement.parentElement.parentElement.querySelector("h2.name").textContent;
        pokeData.pokeStore.forEach(function (arrayMember, i) {
            if (arrayMember.name === pokemonName){
                if (this.comparisons.length >= 0 && this.comparisons.length < 2) {
                    if (!this.comparisons.find(obj => obj.name === pokemonName)) // Less robust solution, as find searches the entire array.
                    {
                        this.comparisons.push(arrayMember);
                        mainPage.addComparisonButtons();
                        this.updateLocalStorage();
                    }
                }
            }
        }.bind(this));
    }
    removeData(data, posInComparisonsArray){
        this.comparisons.splice(posInComparisonsArray, 1);
        this.updateLocalStorage();
    }
    updateLocalStorage(){
        localStorage.setItem('comparisons', JSON.stringify(this.comparisons));
    }
    //TODO: Fix bug that occurs when removing the first Pokemon from comparison and adding another.
    //TODO: Causes comparison view to display removed Pokemon and newly added Pokemon.
    comparePokemon(comparisons) {
        if (comparisons.length === 2) {
            var compare = new Compare(comparisons);
            compare.setModalContent();
        }
    }
}
var mainPage = new Page();
var pokeData = new Pokedata();
var compareData;
