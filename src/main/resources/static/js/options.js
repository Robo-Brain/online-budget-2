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

    Vue.component('userMenu', {
        props: ['properties'],
        data: function() {
            return {

            }
        },
        template:
        '<div>'
            + '{{ properties }}'
        + '</div>',
        methods: {

        }
    });

    let options = new Vue({
        el: '#options',
        data: {
            properties: []
        },
        template: '<div id="options"><userMenu :properties="properties" /></div>',
        created: function () {
            this.properties = properties;
        }
    });

}
