function warningsCheck() {
    Vue.component('warning-button', {
        props: ['warningsList'],
        data: function() {
            return {
                show: false
            }
        },
        template: '<div>{{warningsList}}</div>',
    });

    let warnings = new Vue({
        el: '#warnings',
        data: function() {
            return {
                warningsList: []
            }
        },
        template: '<div id="warning-button"><warning-button v-if="warningsList.length > 0" :warningsList="warningsList" /></div>',
        created: function () {
            axios.get('notices/getMissingNotes') // получаю заметки с несуществующими monthly_spends_id
                .then(result => this.warningsList = result.data);
        }
    });
}