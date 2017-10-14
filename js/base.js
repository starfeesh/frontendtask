document.addEventListener("DOMContentLoaded", function () {
    var contentIsSupported = 'content' in document.createElement('template');

    if (contentIsSupported) {
        fetch('https://pokeapi.co/api/v2/pokemon/?limit=4') //TODO: Implement pagination.
            .then(data => data.json())
            .then(function (data) {
                mainPage.setup(data);
            });
    }
});
class Page {
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
        var closeButton = galleryItemClone.querySelector(".close");

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
        closeButton.setAttribute('onclick', 'mainPage.closeExamine()');

        if (data.isFavorite) {
            this.setHeart(heart, true)
        }
        card.insertBefore(heart, name);

        var childObj = galleryItemClone.querySelector(".item");
        var parent = document.querySelector("#itemList");
        var childClone = childObj.cloneNode(true);
        parent.appendChild(childClone);

    }
    setHeart(heart, status) {
        if (status) {
            heart.style.backgroundPosition = "100% 0";
        } else {
            heart.style.backgroundPosition = "0 0";
        }
    }
}
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
var mainPage = new Page();
var pokeData = new Pokedata();