class Examine {
    constructor(button, data) {
        this.sourcePokemon = button.parentElement.parentElement.querySelector("h2.name");
        var modal = document.querySelector(".modal");
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
            console.log(ps);

            ps.forEach(function (p) {
                console.log(p.parentNode.textContent.replace(/\s/g,''))
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