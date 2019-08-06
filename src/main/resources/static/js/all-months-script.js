// *** SPENDS start *** //

function showAllMonths() {

    $('#templates-list').hide();
    $('#month').hide();
    $('#allMonths').show();

    $('#spends').hide();

    Vue.component('allMonthsAddNoticeModal', {
        props: ['monthlySpendsId'],
        data: function() {
            return {
                text: null,
                bodyText: 'Текст заметки:',
                isError: false,
                remind: false,
                subModal: true
            }
        },
        template:
        '<div class="modal">'
            + '<transition name="slideIn" appear>'
                + '<div v-if="subModal" class="modal-content notice">'
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
                this.subModal = false;
                let self = this;
                setTimeout(function(){
                    self.$parent.showAllMonthsAddNoticeModal = false;
                }, 500);
                this.text = null;
                this.bodyText = 'Текст заметки:';
                this.isError = false;
                this.remind = false;
            },
            saveNotice: function () {
                axios.put('notices/add?monthlySpendId=' + this.monthlySpendsId + '&text=' + this.text + '&remind=' + this.remind)
                    .then(async () => {
                        this.bodyText = 'OK';
                        this.$parent.noticesByMonthlySpendsId = await getNotices();
                        let self = this;
                        setTimeout(function(){
                            self.closeModal();
                        }, 1000);
                    })
            }
        }
    });

    Vue.component('allMonthsNoticeModal', {
        props: ['notices'],
        data: function() {
            return {
                subModal: true
            }
        },
        template:
            '<div class="modal">'
                + '<transition name="slideIn" appear>'
                    + '<div v-if="subModal" class="modal-content">'
                        + '<div @click="closeModal()" class="modal-button close">×</div>'
                        + '<div v-if="notices.length > 0" v-for="notice in notices">'
                            + '<li>{{ notice.text }}</li>'
                        + '</div>'
                    + '</div>'
                + '</transition>'
            + '</div>',
        methods: {
            closeModal: function () {
                this.subModal = false;
                let self = this;
                setTimeout(function(){
                    self.$parent.showAllMonthsNoticeModal = false;
                }, 500);
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
            }
        }

    });

    Vue.component('dates-list', {
        data: function() {
            return  {
                localDatesList: [],
                monthList: [],
                noticesByDateId: [],
                noticesByMonthlySpendsId: [],
                openedListId: '',
                monthlySpendsId: null,
                dateId: '',
                date: '',
                showAllMonthsAddNoticeModal: false,
                showAllMonthsNoticeModal: false,
                notices: []
            }
        },
        template:
            '<div class="all-month-buttons">'
                + '<div class="date-block" v-if="localDatesList.length > 0" v-for="date in localDatesList">'
                    + '<div class="date-button">'
                        + '<button v-if="date.id != dateId && dateHasNotice(date.id)" class="all-month-notices-button" > </button>'
                        + '<button class="all-monts-date-button" @click="getMonthWithDateId(date.id, date.date)">{{ date.date }}</button>'
                    + '</div>'
                    + '<div :id="date.date" v-if="monthList.length > 0 && date.id == dateId">'
                        + '<div class="months">'//+ '<div class="months all-months">'
                            + '<div class="date">{{ date.date }}</div>'
                                + '<div class="month-item" v-for="(month, index, key) in monthList" >'
                                    + '<div class="name-notices-block">'
                                        + '<div class="name"> {{ month.spendName }}</div>'
                                        + '<button v-if="hasNotice(month.monthlySpendsId)" @click="getNoticesShowAllMonthModal(month.monthlySpendsId)" class="month-notices-show-button" > </button>'
                                    + '</div>'
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
                + '</div>'
                + '<h4 v-if="localDatesList.length == 0">Has no months.</h4>'
                + '<allMonthsAddNoticeModal v-if="showAllMonthsAddNoticeModal" :monthlySpendsId="monthlySpendsId" />'
                + '<allMonthsNoticeModal v-if="showAllMonthsNoticeModal" :notices="notices" />'
            + '</div>',
        watch: {
            noticesByMonthlySpendsId: {
                handler: function (val, oldVal) {},
                deep: true
            }
        },
        methods: {
            getMonthWithDateId: function (dateId, date) {
                this.dateId = dateId;
                this.date = date;
                if (this.dateId) {
                    this.monthList = [];
                    axios.get('month/getMonthWithDateId?dateId=' + this.dateId).then(result => {
                        this.monthList = result.data;
                    });
                }
            },
            addNoticeModalFunc: function (monthlySpendId) {
                this.monthlySpendsId = monthlySpendId;
                this.showAllMonthsAddNoticeModal = true;
            },
            hasNotice: function(monthlySpendId) {
                return this.noticesByMonthlySpendsId.includes(monthlySpendId);
            },
            dateHasNotice: function(dateId) {
                return this.noticesByDateId.includes(dateId);
            },
            async getNoticesShowAllMonthModal(monthlySpendId) {
                await axios.get('notices/getByMonthlySpendsId/' + monthlySpendId).then(result => {
                    this.notices = result.data;
                    this.showAllMonthsNoticeModal = true;
                });
            }
        },
        created: function () {
            axios.get('dates').then( result => {
                this.localDatesList = result.data;
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
        template: '<div id="allMonths"><dates-list /></div>'
    });

    async function getNotices() {
        let arr = [];
        await axios.get('notices')
            .then(result => {
                result.data.forEach(note => {
                    arr.push(note.monthlySpendId);//this.noticesMonthlySpendsId
                });
            });
        return arr;
    }

}
