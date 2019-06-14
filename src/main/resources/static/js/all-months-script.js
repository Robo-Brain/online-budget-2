// *** SPENDS start *** //

function showAllMonths() {

    $('#templates-list').hide();
    $('#month').hide();
    $('#allMonths').show();
    $('#spends').hide();

    Vue.component('dates-list', {
        props: ['datesList'],
        data: function() {
            return  {
                monthList: [],
                openedListId: '',
                dateId: ''
            }
        },
        template:
            '<div>'
                + '<div v-if="datesList.length > 0" v-for="date in datesList">'
                    + '<button :id="date.id" @click="getMonthWithDateId($event)">{{ date.date }}</button>'
                    + '<div :id="date.date" v-if="monthList.length > 0 && date.date == openedListId">'
                        + '<table class="months">'
                            + '<tr class="head">'
                                + '<td>Название:</td>'
                                + '<td>Внесено:</td>'
                                + '<td>??:</td>'
                                + '<td>??:</td>'
                            + '</tr>'
                            + '<tr class="month-item" v-for="month in monthList" >'
                                + '<td class="name"> {{ month.spendName }}</td>'
                                + '<td class="deposited"> {{ month.monthAmount }} / {{ month.templateAmount }} </td>'
                                + '<td v-bind:class="[ month.isCash ? \'cash\' : \'card\' ]"> </td>'
                                + '<td v-if="month.salary" class="salary">ЗП</td>'
                                + '<td v-else class="prepaid">Аванс</td>'
                            + '</tr>'
                        + '</table>'
                    + '</div>'
                + '</div>'
                + '<h4 v-if="datesList.length == 0">Has no months.</h4>'
            + '</div>',
        methods: {
            getMonthWithDateId: function (event) {
                this.dateId = event.target.id;
                if (this.dateId) {
                    this.monthList = [];
                    axios.get('month/getMonthWithDateId?dateId=' + this.dateId).then(result => {
                        this.openedListId = result.data[0].date;
                        this.monthList = result.data;
                    });
                }
            }
        },
        created: function () {
            axios.get('dates').then(result => {
                this.datesList = result.data;
            });
        }
    });

    var allMonthsList = new Vue({
        el: '#allMonths',
        template: '<div id="allMonths"><dates-list :datesList = "datesList" /></div>',
        data: {
            datesList: []
        }
    });
}