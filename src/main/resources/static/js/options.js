// *** OPTIONS start *** //

let user = new Vue({
    el: '#user',
    data: {
        userArr: []
    },
    template:
        '<div id="upper-menu-user" class="user">'
            + '<img :src="userArr.userpic" />'
        + '</div>',
    created: function() {
        axios.get('user').then(result => this.userArr = result.data)
    }
});

function showUserMenu() {
    $('#options').show();

    $('#templates-list').hide();
    $('#month').hide();
    $('#allMonths').hide();
    $('#spends').hide();

    $('#upper-menu-spends').removeClass('selected-menu-item');
    $('#upper-menu-allMonths').removeClass('selected-menu-item');
    $('#upper-menu-month').removeClass('selected-menu-item');
    $('#upper-menu-templates').removeClass('selected-menu-item');

    Vue.component('userMenu', {
        data: function() {
            return {
                prop: {},
                colorScheme: '',
                highlightUnsum: ''
            }
        },
        template:
        '<div>'
            + '<div class="color-scheme">Цветовая схема: '
                + '<select @change="colorSchemeChange($event)">'
                    + '<option value="def" :selected="colorScheme == \'def\'">Default</option>'
                    + '<option value="gray" :selected="colorScheme == \'gray\'">Gray</option>'
                + '</select>'
                + '<br />Выделять не отслеживаемые платежи: <input @change="highlightUnsummaryToggle()" type="checkbox" :checked="highlightUnsum" />'
            + '</div>'
        + '</div>',
        methods: {
            colorSchemeChange: function (event) {
                if (this.colorScheme !== event.target.value){
                    let arr = this.prop;
                    arr.color_scheme = event.target.value;
                    this.prop = arr;

                    this.sendOptions();
                }
            },
            highlightUnsummaryToggle: function () {
                let arr = this.prop;
                arr.highlight_unsum = !arr.highlight_unsum;
                this.prop = arr;

                this.sendOptions();
            },
            sendOptions: function () {
                window.options.properties = this.prop;
                axios({
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    method: 'put',
                    url: '/options/setProperties',
                    data: window.options
                })
            }
        },
        created: function () {
            axios.get('options').then(result => {
                this.prop = result.data.properties;
                window.options = result.data;
                try{
                    this.prop = JSON.parse(result.data.properties);
                } catch (e) {
                    console.log('already object \'created\'');
                }
                this.colorScheme = this.prop.color_scheme;
                this.highlightUnsum = this.prop.highlight_unsum;
                console.log(this.highlightUnsum)
            });

        }
    });

    let options = new Vue({
        el: '#options',
        template: '<div id="options"><userMenu /></div>'
    });

}
