// *** SPENDS start *** //

function showAllMonths() {

    $('#templates-list').hide();
    $('#month').hide();
    $('#allMonths').show();

    $('#spends').hide();

    Vue.component('allMonthsAddNotice', {
        props: ['monthlySpendsId'],
        data: function() {
            return {
                text: null,
                bodyText: 'Текст заметки:',
                isError: false,
                remind: false
            }
        },
        template:
        '<div v-if="this.$parent.addNoticeModal" class="modal">'
            + '<transition name="slideIn" appear>'
                + '<div class="modal-content notice">'
                    + '<div @click="closeModal()" class="modal-button close">×</div>'
                    + '<p>'
                        + '{{ bodyText }}<br />'
                        + '<textarea v-model="text" ></textarea>'
                        + '<input id="is-remind" v-model="remind" type="checkbox" /> <label for="is-remind">Remind</label>'
                        + '<button @click="saveNotice()">Сохранить</button>'
                    + '</p>'
                + '</div>'
            + '</transition>'
        + '</div>',
        methods: {
            closeModal: function () {
                this.$parent.addNoticeModal = false;
                this.text = null;
                this.bodyText = 'Текст заметки:';
                this.isError = false;
                this.remind = false;
            },
            saveNotice: function () {
                axios.put('notices/add?monthlySpendId=' + this.monthlySpendsId + '&text=' + this.text + '&remind=' + this.remind)
                    .then(() => {
                        this.bodyText = 'OK';
                        let self = this;
                        setTimeout(function(){
                            self.closeModal();
                        }, 1000);
                    })
            }
        }
    });

    Vue.component('haveNoticesButton', {
        props: ['monthlySpendId'],
        data: function() {
            return {
                showNoticeModal: false,
                notices: []
            }
        },
        template:
            '<span>'
                + '<button @click="showNoticeModalFunc()" class="month-notices-show-button" > </button>'
                + '<div v-if="showNoticeModal" class="modal">'
                    + '<transition name="slideIn" appear>'
                        + '<div class="modal-content notice">'
                            + '<div @click="closeModal()" class="modal-button close">×</div>'
                            + '<div v-if="notices.length > 0" v-for="notice in notices">'
                                + '<p>{{ notice.text }}</p>'
                            + '</div>'
                        + '</div>'
                    + '</transition>'
                + '</div>'
            + '</span>',
        methods: {
            showNoticeModalFunc: function () {
                this.showNoticeModal = true;
                axios.get('notices/getByMonthlySpendsId/' + this.monthlySpendId).then(result => {
                    this.notices = result.data;
                });
            },
            closeModal: function () {
                this.showNoticeModal = false;
            }
        }

    });

    Vue.component('dates-list', {
        props: ['datesList'],
        data: function() {
            return  {
                monthList: [],
                noticesByDateId: [],
                noticesByMonthlySpendsId: [],
                openedListId: '',
                monthlySpendsId: null,
                dateId: '',
                date: '',
                addNoticeModal: false
            }
        },
        template:
            '<div class="all-month-buttons">'
                + '<div class="date-block" v-if="datesList.length > 0" v-for="date in datesList">'
                    + '<div class="date-button">'
                        // + '<div v-if="date.id != dateId" class="all-month-notices-quantity"> </div>'
                        + '<button v-if="date.id != dateId && dateHasNotice(date.id)" class="all-month-notices-button" > </button>'
                        + '<button :id="date.id" class="all-monts-date-button" @click="getMonthWithDateId($event, date.date)">{{ date.date }}</button>'
                    + '</div>'
                    + '<div :id="date.date" v-if="monthList.length > 0 && date.id == dateId">'
                        + '<div class="months">'//+ '<div class="months all-months">'
                            + '<div class="date">{{ date.date }}</div>'
                                + '<div class="month-item" v-for="(month, index, key) in monthList" >'
                                    + '<div class="name-notices-block">'
                                        + '<div class="name"> {{ month.spendName }}</div>'
                                        + '<haveNoticesButton v-if="hasNotice(month.monthlySpendsId)" :monthlySpendId="month.monthlySpendsId" />'
                                    + '</div>'
                                    + '<div class="name"> {{ month.spendName }}</div>'
                                    + '<div class="deposited">'
                                        + '<span class="month-amount">{{ month.monthAmount }} / {{ month.templateAmount }}</span>'
                                    + '</div>'
                                    + '<div class="buttons">'
                                        + '<button v-bind:class="[ month.salary ? \'salary\' : \'prepaid\' ]"> </button>'
                                        + '<button v-bind:class="[ month.cash ? \'cash\' : \'card\' ]"> </button>'
                                        + '<button @click="addNoticeModalFunc(month.monthlySpendsId)" class="notice"> </button>'
                                + '</div>'
                            + '</div>'
                        + '</div>'
                    + '</div>'
                    + '<allMonthsAddNotice :monthlySpendsId="monthlySpendsId" />'
                + '</div>'
                + '<h4 v-if="datesList.length == 0">Has no months.</h4>'
            + '</div>',
        methods: {
            getMonthWithDateId: function (event, date) {
                this.dateId = event.target.id;
                this.date = date;
                if (this.dateId) {
                    this.monthList = [];
                    axios.get('allMonths/' + this.dateId).then(result => {
                        this.monthList = result.data;
                    });
                }
            },
            addNoticeModalFunc: function (monthlySpendId) {
                this.monthlySpendsId = monthlySpendId;
                this.addNoticeModal = true;
            },
            deleteNotice: function (noticeId) {
                axios.delete('/notices/' + noticeId)
                    .then(result => {
                        if (result.data < 1) {
                            this.$parent.modal = false;
                        }
                    })
                    .catch(error => alert(error));

            },
            muteNotice: function (noticeId) {
                axios.post('/notices/muteNotice/' + noticeId)
                    .then(result => this.notices = result.data)
                    .catch(error => alert(error))
            },
            hasNotice: function(monthlySpendId) {
                return this.noticesByMonthlySpendsId.includes(monthlySpendId);
            },
            dateHasNotice: function(dateId) {
                return this.noticesByDateId.includes(dateId);
            }
        },
        created: function () {
            axios.get('dates').then( result => {
                this.datesList = result.data;
            });

            axios.get('notices/getAllDateIdsWhereHasNotices')
                .then( result => this.noticesByDateId = result.data);

            axios.get('notices')
                .then( result => {
                    result.data.forEach(note => {
                        this.noticesByMonthlySpendsId.push(note.monthlySpendId)
                    });
                })
        }
    });

    let allMonthsList = new Vue({
        el: '#allMonths',
        template: '<div id="allMonths"><dates-list :datesList = "datesList" /></div>',
        data: {
            datesList: []
        }
    });


}
