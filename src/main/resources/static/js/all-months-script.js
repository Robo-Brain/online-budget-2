// *** SPENDS start *** //

function showAllMonths() {

    $('#templates-list').hide();
    $('#month').hide();
    $('#allMonths').show();

    $('#spends').hide();

    Vue.component('notice', {
        props: ['notices'],
        data: function() {
            return  {
                showSubModal: true
            }
        },
        template:
            '<div class="modal">'
                + '<transition name="slideIn" appear>'
                    + '<ul v-show="showSubModal" class="modal-content">'
                        + '<li v-for="notice in notices" :key="notice.id"> '
                            + '{{ notice.text }} '
                            + '&nbsp;<button v-if="notice.remind" @click="muteNotice(notice.id)"> Mute </button>'
                            + '&nbsp;<button @click="deleteNotice(notice.id)"> X </button>'
                            + '&nbsp;<button @click="closeModal()"> close </button>'
                        + '</li>'
                    + '</ul>'
                + '</transition>'
            + '</div>',
        methods: {
            closeModal: function () {
                let that = this;
                that.showSubModal = false;
                setTimeout(function(){
                    that.$parent.modal = false;
                    that.showSubModal = true;
                }, 500);
            },
        }
    });

    Vue.component('dates-list', {
        props: ['datesList'],
        data: function() {
            return  {
                monthList: [],
                openedListId: '',
                monthlySpendsId: null,
                dateId: '',
                date: '',
                modal: false,
                addNoticeModal: false,
                notices : [],
                showSubModal: true
            }
        },
        template:
            '<div>'
                + '<div v-if="datesList.length > 0" v-for="date in datesList">'
                    + '<button :id="date.id" @click="getMonthWithDateId($event, date.date)">{{ date.date }}</button>'
                    + '<div :id="date.date" v-if="monthList.length > 0 && date.id == dateId">'
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
                                    + '<td v-else-if="!month.salary" class="prepaid">Аванс</td>'
                                    + '<td class="notice">'
                                        + '<button class="notice" v-if="month.haveNotice" @click="getNoticesByMonthlySpendsId(month.monthlySpendsId)"> </button>'
                                        + '<button @click="showAddNoticeModal(month.monthlySpendsId)"> + </button>'
                                    + '</td>'
                            + '</tr>'
                        + '</table>'
                    + '</div>'
                    + '<transition v-if="modal" name="fadeIn">'
                        + '<div class="modal">'
                            + '<transition name="slideIn" appear>'
                                + '<div v-show="showSubModal" class="modal-content">'
                                    + '<div @click="closeNoticeModal()" class="modal-button close">×</div>'
                                    + '<div class="notices" v-for="notice in notices" :key="notice.id"> '
                                        + '<div class="notice-text">'
                                            + '○ {{ notice.text }} '
                                            + '&nbsp;<button v-if="notice.remind" @click="muteNotice(notice.id)"> Mute </button>'
                                        + '</div>'
                                        + '<div @click="deleteNotice(notice.id)" class="modal-button delete">×</div>'
                                    + '</div>'
                                + '</div>'
                            + '</transition>'
                        + '</div>'
                    + '</transition>'
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
            getNoticesByMonthlySpendsId: function (monthlySpendsId) {
                axios.get('notices/' + monthlySpendsId).then(result => {
                    this.notices = result.data;
                });
                this.modal = true;
            },
            showAddNoticeModal: function (monthlySpendId) {
                let that = this;
                let n = new Noty({
                    type: 'success',
                    theme: 'metroui',
                    layout: 'center',
                    text: '<div class="modal-body"><textarea class="remindText"></textarea><br />Remind: <input class="remindCheckbox" type="checkbox" /></div>',
                    modal: true,
                    closeWith: ['button'],
                    buttons: [
                        Noty.button('Save', 'btn btn-success', function () {
                            let text = $('.remindText').val();
                            let isRemind = $('.remindCheckbox').is(':checked');
                            axios.put('notices/add?monthlySpendId=' + monthlySpendId + '&text=' + text + '&remind=' + isRemind)
                                .then(() => {
                                    axios.get('allMonths/' + that.dateId)
                                        .then(result => that.monthList = result.data);
                                    n.close();
                                })
                                .catch(error => alert(error));
                        })
                    ]
                }).show();
            },
            closeNoticeModal: function () {
                let that = this;
                that.showSubModal = false;
                setTimeout(function(){
                    that.modal = false;
                    that.showSubModal = true;
                }, 500);
            },
            deleteNotice: function (noticeId) {
                axios.delete('/notices/' + noticeId)
                    .then(result => {
                        if (result.data < 1) {
                            this.$parent.modal = false;
                        }
                        this.notices = result.data;
                    })
                    .catch(error => alert(error));

            },
            muteNotice: function (noticeId) {
                axios.post('/notices/muteNotice/' + noticeId)
                    .then(result => this.notices = result.data)
                    .catch(error => alert(error))
            }
        },
        created: function () {
            axios.get('dates').then(result => {
                this.datesList = result.data;
            });
        }
    });

    let allMonthsList = new Vue({
        el: '#allMonths',
        template: '<div id="allMonths"><dates-list :datesList = "datesList" /></div>',
        data: {
            datesList: []
        }
    });

    async function axiosMonthWithDateId(dateId) {
        return await axios.get('allMonths/' + dateId);
    }

}
