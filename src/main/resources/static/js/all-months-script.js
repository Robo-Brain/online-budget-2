// *** SPENDS start *** //

function showAllMonths() {

    $('#templates-list').hide();
    $('#month').hide();
    $('#allMonths').show();
    $('#spends').hide();

    // Vue.component('one-month', {
    //     props: ['month'],
    //     data: function() {
    //         return {
    //             date: ''
    //         }
    //     },
    //     template:
    //     '<table class="months">'
    //         + '<tr><td class="monthDate" colspan="4"><br /> {{ month[0].date }} </td></tr>'
    //         + '<tr class="head">'
    //             + '<td>Название:</td>'
    //             + '<td>Внесено:</td>'
    //             + '<td>??:</td>'
    //             + '<td>??:</td>'
    //         + '</tr>'
    //         + '<tr class="month-item" v-for="(m, index, key) in month" >'
    //             + '<td class="name"> {{ m.spendName }}</td>'
    //             + '<td class="deposited">{{ m.monthAmount }}  / {{ m.templateAmount }} </td>'
    //             + '<td v-bind:class="[ m.isCash ? \'cash\' : \'card\' ]"> </td>'
    //             + '<td v-if="m.salaryOrPrepaid" class="salary">ЗП</td>'
    //             + '<td v-else class="prepaid">Аванс</td>'
    //         + '</tr>'
    //     + '</table>'
    // });
    //
    // Vue.component('all-months-list', {
    //     props: ['allMonthsList'],
    //     template:
    //         '<div><one-month class="allMonths" v-for="month in allMonthsList" :key="month.id" :month="month" /></div>', //'<spends-list v-for="spend in spendsList" :key="spend.id" :spend="spend" />'
    //     methods: {
    //
    //     },
    //     created: function () { //функция, котора ожидает подгрузки всего необходимого и ДО рендера страницы меняет содержимое на то, что получено через axios.get()
    //         axios.get('month/all').then(result => {// получаем все листы из spends
    //             result.data.forEach(month => {
    //                 this.allMonthsList.push(month);
    //             })
    //         });
    //     }
    // });

    Vue.component('dates-list', {
        props: ['datesList'],
        data: function() {
            return  {
                monthList: [],
                openedListId: ''
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
                                + '<td v-if="month.salaryOrPrepaid" class="salary">ЗП</td>'
                                + '<td v-else class="prepaid">Аванс</td>'
                            + '</tr>'
                        + '</table>'
                    + '</div>'
                + '</div>'
                + '<h4 v-if="datesList.length == 0">Has no months.</h4>'
            + '</div>',
        methods: {
            getMonthWithDateId: function (event) {
                var dateId = event.target.id;
                if (dateId) {
                    this.monthList = [];
                    axios.get('month/getMonthWithDateId?dateId=' + dateId).then(result => {
                        this.openedListId = result.data[0].date;
                        result.data.forEach(month => {
                            this.monthList.push(month);
                        })
                    });
                }
            }
        },
        created: function () {
            axios.get('dates').then(result => {// получаем все листы из spends
                result.data.forEach(date => {
                    this.datesList.push(date);
                })
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

// axios.get('month/all').then(result => {// получаем все листы из spends
//     result.data.forEach(month => {
//         console.log(month);
//     })
// });