document.addEventListener("DOMContentLoaded", function () {
    var contentIsSupported = 'content' in document.createElement('template');

    if (contentIsSupported) {
        fetch('https://pokeapi.co/api/v2/pokemon/?limit=20') //TODO: Implement pagination.
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
        var card = galleryItemClone.querySelector(".card-body");

        //console.log(data.types[0].type.name);

        for (var j = 0; j < data.types.length; j++){
            var span = document.createElement('span');
            span.setAttribute('class', 'pill');
            var text = document.createTextNode(data.types[j].type.name);
            span.appendChild(text);
            types.appendChild(span);
        }

        //favorite.whatever = data.isFavorite;
        name.textContent = data.name;
        img.setAttribute('src', data.sprites.front_default);
        img.setAttribute('class', 'image card-image-top');
        card.insertBefore(img, name);

        var childObj = galleryItemClone.querySelector(".item");
        var parent = document.querySelector("#itemList");
        var childClone = childObj.cloneNode(true);
        parent.appendChild(childClone);

        var favoriteButton = galleryItemClone.querySelector(".btn");
        //pokeData.attachFavoriteToggleEvent(favoriteButton);
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
                if (msSinceRefresh < (60 * 60 * 1000)) {
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
                    mainPage.prepareTemplates(data);
                    pokeData.updatePokeStore(data);
                });
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
            this.pokeStore.splice(posInPokeStore, 1, onePokemon);
        }
        else {
            this.pokeStore.push(onePokemon);
        }

        localStorage.setItem('pokeStore', JSON.stringify(this.pokeStore));
    }
    toggleFavorite(){
        var pokemonName = event.srcElement.parentElement.children[1].textContent;
        //TODO: Actually toggle favorite in data and change appearance of button.
    }
}
var mainPage = new Page();
var pokeData = new Pokedata();