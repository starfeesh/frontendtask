// These two classes populate the modals on the page. The majority of this
// is styling.
class Examine {
    constructor(button, data) {
        this.sourcePokemon = button.parentElement.parentElement.querySelector("h2.name");
        var modal = document.querySelector("#pokeModal");
        this.modalBody = modal.querySelector(".modal-body");
        this.modalTitle = modal.querySelector(".modal-title");
        this.examineImg = this.modalBody.querySelector(".examineImg");
        this.examineStats = this.modalBody.querySelector(".examineStats");

        this.pokemon = data;
    }
    setModalContent() {
        if (this.modalTitle.textContent.length > 0) {
            this.modalTitle.textContent = "";

            for (var j = this.examineImg.childNodes.length - 1; j >= 0; j--){
                this.examineImg.removeChild(this.examineImg.childNodes[j]);
            }
            for (var k = this.examineStats.childNodes.length - 1; k >= 0; k--){
                this.examineStats.removeChild(this.examineStats.childNodes[k]);
            }
            for (var m = this.modalBody.querySelectorAll("p").length - 1; m >= 0; m--) {
                this.modalBody.querySelectorAll("p")[m].textContent = "";
            }
        }
        this.modalTitle.textContent = this.sourcePokemon.textContent;

        var img = document.createElement('img');
        img.setAttribute('src', this.pokemon.sprites.front_default);
        img.setAttribute('class', '');

        this.examineImg.appendChild(img);

        for (var i = 0; i < this.pokemon.stats.length; i++){
            var outer = document.createElement('div');
            var inner = document.createElement('div');
            inner.textContent = this.pokemon.stats[i].stat.name + " " + this.pokemon.stats[i].base_stat + "%";
            inner.style.width = this.pokemon.stats[i].base_stat + "%";

            outer.setAttribute('class', 'statContainer');
            inner.setAttribute('class', 'stat ' + this.pokemon.stats[i].stat.name);

            outer.appendChild(inner);
            this.examineStats.appendChild(outer);
        }

        var card = this.modalBody.querySelector(".card");
        var rows = card.querySelectorAll(".row");
        rows.forEach(function (row) {
            var ps = row.querySelectorAll("p");

            ps.forEach(function (p) {
                var attribute = p.parentNode.textContent.replace(/\s/g,'');
                switch(attribute){
                    case "Height":
                        p.textContent = "0." + this.pokemon.height + " m";
                        break;
                    case "Weight":
                        p.textContent = (this.pokemon.weight/10).toFixed(2) + " kg";
                        break;
                    case "Abilities":
                        for (var l = 0; l < this.pokemon.abilities.length; l++){
                            if (l > 0) {
                                p.textContent += ", ";
                            }
                            p.textContent += this.pokemon.abilities[l].ability.name;
                        }
                }
            }.bind(this))
        }.bind(this));
    }
}

//This could be improved upon. Template the output of name, image, stats and reuse below.
//TODO: Add difference/comparison column between stats of Pokemon.
class Compare {
    constructor(array) {
        this.arrayOfComparitors = array;
        this.modal = document.querySelector("#comparisonModal");
        this.modalTitle = this.modal.querySelector(".modal-title");
    }
    setModalContent() {
        this.modal.querySelector(".modal-title").textContent = "Comparing:";
        this.arrayOfComparitors.forEach(function (pokemon, index) {
            var compareImg = this.modal.querySelector(".compareImg" + index);
            var compareStats = this.modal.querySelector(".compareStats" + index);

            this.clearContent(compareImg, compareStats);

            var names = this.modal.querySelectorAll("h3");
            names[index].textContent = this.arrayOfComparitors[index].name;

            var img = document.createElement('img');
            img.setAttribute('src', pokemon.sprites.front_default);
            img.setAttribute('class', '');
            compareImg.appendChild(img);

            for (var i = 0; i < pokemon.stats.length; i++){
                var outer = document.createElement('div');
                var inner = document.createElement('div');
                var span = document.createElement('span');

                span.textContent = pokemon.stats[i].stat.name + " " + pokemon.stats[i].base_stat + "%";
                inner.style.width = pokemon.stats[i].base_stat + "%";

                outer.setAttribute('class', 'statContainer');
                inner.setAttribute('class', 'stat ' + pokemon.stats[i].stat.name);

                outer.appendChild(inner);
                compareStats.appendChild(outer);
                compareStats.insertBefore(span, outer)
            }

            var cards = this.modal.querySelectorAll(".card");
            cards.forEach(function (card) {
                var rows = card.querySelectorAll(".row");
                rows.forEach(function (row) {
                    var ps = row.querySelectorAll("p");

                    ps.forEach(function (p) {
                        var attribute = p.parentNode.textContent.replace(/\s/g,'');
                        switch(attribute){
                            case "Height":
                                p.textContent = "0." + pokemon.height + " m";
                                break;
                            case "Weight":
                                p.textContent = (pokemon.weight/10).toFixed(2) + " kg";
                                break;
                            case "Abilities":
                                for (var l = 0; l < pokemon.abilities.length; l++){
                                    if (l > 0) {
                                        p.textContent += ", ";
                                    }
                                    p.textContent += pokemon.abilities[l].ability.name;
                                }
                        }
                    }.bind(this))
                }.bind(this));
            }.bind(this));
        }.bind(this));
    }
    clearContent(img, stats){
        if (stats.childNodes.length > 0) {
            this.modalTitle.textContent = "";

            for (var j = img.childNodes.length - 1; j >= 0; j--){
                img.removeChild(img.childNodes[j]);
            }
            for (var k = stats.childNodes.length - 1; k >= 0; k--){
                stats.removeChild(stats.childNodes[k]);
            }
            for (var m = this.modal.querySelectorAll("p").length - 1; m >= 0; m--) {
                this.modal.querySelectorAll("p")[m].textContent = "";
            }
        }
    }
}
