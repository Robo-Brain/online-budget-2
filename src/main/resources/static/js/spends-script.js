// *** SPENDS start *** //

function showSpendsList() {
    $('#spends').show();

    $('#templates-list').hide();
    $('#month').hide();
    $('#allMonths').hide();
    $('#options').hide();

    Vue.component('spends-list', {
        data: function() {
            return  {
                localSpends: [],
                newSpendName: ''
            }
        },
        directives: {
            focus: {
                inserted: function (el) {
                    el.focus()
                }
            }
        },
        template:
        '<ul class="spends">'
            + '<li v-for="spend in localSpends" >'
                + '<i>{{ spend.id }}</i> <span v-bind:value="spend.id">{{ spend.name }}</span>'
            + '</li>'
            + '<li class="new">Name: <input ref="amount" v-on:keyup="handleSpendName($event)" v-model="newSpendName" type="text" v-focus /></li><button @click="pushSpend()" id="pushSpend" type="button">Send</button>'
        + '</ul>',
        methods: {
            handleSpendName: function (event) {
                if (event.keyCode === 13) this.pushSpend();
            },
            pushSpend: function () {
                if (this.newSpendName.length > 1){
                    axios.put('spends/' + this.newSpendName).then(result => {
                        this.localSpends = result.data;
                        this.newSpendName = '';
                    });
                }
            }
        },
        created: function () { //функция, котора ожидает подгрузки всего необходимого и ДО рендера страницы меняет содержимое на то, что получено через axios.get()
            axios.get('spends').then(result => this.localSpends = result.data);
        }
    });

    var spendsList = new Vue({
        el: '#spends', // айдишник блока, куда рендерить
        template: '<div id="spends"><spends-list /></div>',
    });
}