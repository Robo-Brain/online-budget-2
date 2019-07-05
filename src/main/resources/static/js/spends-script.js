// *** SPENDS start *** //

function showSpendsList() {

    $('#templates-list').hide();
    $('#month').hide();
    $('#allMonths').hide();
    $('#spends').show();

    Vue.component('spends-list', {
        data: function() {
            return  {
                localSpends: [],
                newSpendName: ''
            }
        },
        template:
        '<ul class="spends">'
            + '<li v-for="spend in localSpends" >'
                + '<i>{{ spend.id }}</i> <span v-bind:value="spend.id">{{ spend.name }}</span>'
            + '</li>'
            + '<li class="new">Name: <input v-model="newSpendName" type="text"></li><button @click="pushSpend()" id="pushSpend" type="button">Send</button>'
        + '</ul>',
        methods: {
            pushSpend: function () {
                if (this.newSpendName.length > 1){
                    let name = this.newSpendName;
                    axios.put('spends/' + name).then(result => {
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