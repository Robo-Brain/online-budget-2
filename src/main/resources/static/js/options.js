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

            }
        },
        computed: {
            prop: {
                get: function () {
                    try{
                        return JSON.parse(window.options.properties)
                    } catch (e) {
                        console.log('options already parsed');
                        return window.options.properties
                    }
                },
                set: function (newProp) {
                    window.options.properties = newProp;
                }
            }
        },
        template:
        '<div>'
            + '<div class="color-scheme">Цветовая схема: '
                + '<select @change="colorSchemeChange($event)">'
                    + '<option value="def" :selected="prop.color_scheme == \'def\'">Default</option>'
                    + '<option value="gray" :selected="prop.color_scheme == \'gray\'">Gray</option>'
                + '</select>'
                + '<br />Выделять не отслеживаемые платежи: <input @change="highlightUnsummaryToggle()" type="checkbox" :checked="this.prop.highlight_unsum" />'
            + '</div>'
        + '</div>',
        methods: {
            colorSchemeChange: function (event) {
                if (this.prop.color_scheme !== event.target.value){
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
                axios({
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    method: 'put',
                    url: '/options/setProperties',
                    data: window.options
                })
            }
        }
    });

    let options = new Vue({
        el: '#options',
        data: {
            properties: []
        },
        template: '<div id="options"><userMenu /></div>'
    });

}
