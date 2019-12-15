// *** SPENDS start *** //

function showAllMonths() {
    $('#allMonths').show();
    $('#upper-menu-allMonths').addClass('selected-menu-item');

    $('#templates-list').hide();
    $('#month').hide();
    $('#spends').hide();
    $('#options').hide();

    $('#upper-menu-month').removeClass('selected-menu-item');
    $('#upper-menu-spends').removeClass('selected-menu-item');
    $('#upper-menu-templates').removeClass('selected-menu-item');



    Vue.component('amountHistoryModal', {
        props: ['monthlySpendsId', 'spendName'],
        data: function() {
            return {
                subModal: true,
                amountHistoryArr: [],
                unexpectedDelete: true,
                historyElementId: null,
                historyAmountId: null,
                comment: ''
            }
        },
        template:
        '<div class="modal">'
            + '<transition name="slideIn" appear>'
                + '<div @focusout="handleFocusOut" v-if="subModal" class="modal-content">'
                    + '<div @click="closeModal()" class="modal-button close">×</div>'
                    + '<h3>{{ spendName }}</h3>'
                    + '<div class="amount-history" v-for="(amountHistory, key, parentIter) in amountHistoryArr">' //  дата : { платежи }
                        + '{{amountHistory[0].date}}'
                        + '<div class="history-item" v-for="(item, subIter) in amountHistory">' // платеж : { ... }
                            + '<span>{{ item.time }} - {{ item.amount }}р.</span> '
                            + '<span v-if="!unexpectedDelete && item.id == historyElementId " class="delete-warning-text">Будет удалено при повторном нажатии:<br/></span>'
                            + '<input v-bind:class="{ deleting: !unexpectedDelete && item.id == historyElementId }" @input="setComment(item.id)" :value="item.comment" />'
                            + '<button @click="deleteHistoryElement(item.id)" class="delete"> </button>'
                            + '<span class="difference">'
                                + '<span class="difference-hidden-date">{{ item.time }}</span>'
                                + '<span v-if="parentIter > 0 && subIter == 0" class="difference-amount">' // если для статьи больше 1 элемента истории и он первый для этой даты
                                    + '+ {{ getAmount(item.amount, parentIter) }}р.'
                                + '</span>'
                                + '<span v-else-if="subIter > 0" class="difference-amount">'
                                    + '+ {{ item.amount - amountHistory[subIter - 1].amount }}р.'
                                + '</span>'
                            + '</span>'
                        + '</div>'
                    + '</div>'
                + '</div>'
            + '</transition>'
        + '</div>',
        watch: {
            amountHistoryArr: {
                handler: function (val, oldVal) {},
                deep: true
            }
        },
        methods: {
            getAmount(currentAmount, iter) {
                let arr = Object.values(this.amountHistoryArr)[iter - 1];
                let amount = arr[arr.length - 1].amount;
                return currentAmount - amount;
            },
            handleFocusOut() {
                this.closeModal();
            },
            closeModal: function () {
                this.subModal = false;
                this.historyElementId = null;
                this.unexpectedDelete = true;
                let self = this;
                setTimeout(function(){
                    self.$parent.showAmountHistoryModal = false;
                }, 500);
            },
            setComment: function (itemId) {
                this.historyAmountId = itemId;
                this.comment = event.target.value;

                let tmpId = this.historyAmountId;
                let comment = this.comment;
                let self = this;
                setTimeout(function(){
                    if(tmpId === self.historyAmountId && comment === self.comment) {
                        axios.post('monthAmountHistory?historyAmountId=' + self.historyAmountId + '&comment=' + comment);
                        self.historyAmountId = null;
                        self.comment = '';
                    } else {
                        console.log('tmpId === self.historyAmountId %s / comment === self.comment %s', tmpId === self.historyAmountId, comment === self.comment)
                    }
                }, 1500);
            },
            deleteHistoryElement: function (itemId) {
                if (this.unexpectedDelete){
                    this.historyElementId = itemId;
                    this.unexpectedDelete = false;
                } else if(!this.unexpectedDelete && this.historyElementId === itemId) {
                    axios.delete('monthAmountHistory?historyAmountId=' + itemId).then(result => {
                        this.amountHistoryArr = result.data;
                    });
                    this.unexpectedDelete = true;
                    this.historyElementId = null;
                } else if(this.historyElementId !== itemId) {
                    this.unexpectedDelete = true;
                    this.historyElementId = null;
                }
            }
        },
        created: function () {
            axios.get('monthAmountHistory/' + this.monthlySpendsId)
                .then(result => {
                    if (!result.data || result.data.length < 1){
                        this.subModal = false;
                        this.$parent.showAmountHistoryModal = false;
                    } else {
                        this.amountHistoryArr = result.data;
                    }
                });
        }
    });

    Vue.component('all-month-single-template',{
        props: ['openedListSpends', 'noticesByMonthlySpendsId'],
        data: function() {
            return  {
                editingTemplateId: null,
                dateId: null,
                minimizedSum: false,
                monthList: [],
                totals: {
                    totalAmountSalaryCard: 0, totalAmountSalaryCash: 0, totalAmountPrepaidCard: 0, totalAmountPrepaidCash: 0
                },
                showAmountHistoryModal: false,
                spendName: '',
                monthlySpendsId: null
            }
        },
        template:
        '<div>'
            + '<div v-if="openedListSpends.length > 0" class="month-item" :key="month.id" v-for="(month, index, key) in openedListSpends" >'
                + '<div class="name-notices-block">'
                    + '<div @click="showAmountHistory(month.monthlySpendsId, month.spendName)" class="name"> {{ month.spendName }} </div>'
                    + '<button v-if="hasNotice(month.monthlySpendsId)" @click="getNoticesAndShowNoticeModal(month.monthlySpendsId)" class="month-notices-show-button" > </button>'
                + '</div>'
                + '<div class="deposited">'
                    + '<span class="month-amount all">{{ month.monthAmount }} / {{ month.templateAmount }}</span>'
                + '</div>'
                + '<div class="buttons">'
                    + '<button v-bind:class="[ month.salary ? \'salary\' : \'prepaid\' ]"> </button>'
                    + '<button v-bind:class="[ month.cash ? \'cash\' : \'card\' ]"> </button>'
                + '</div>'
                + '<div class="sub-edit-block">'
                    + '<button @click="toggleNoticeModal(month.monthlySpendsId)" class="notice"> </button>'
                + '</div>'
            + '</div>'
            + '<amountHistoryModal v-if="showAmountHistoryModal" :monthlySpendsId="monthlySpendsId" :spendName="spendName" />'
        + '</div>',
        methods: {
            hasNotice: function(monthlySpendId) {
                return this.noticesByMonthlySpendsId.includes(monthlySpendId);
            },
            showAmountHistory: function (monthlySpendsId, spendName) {
                this.monthlySpendsId = monthlySpendsId;
                this.spendName = spendName;
                this.showAmountHistoryModal = true;
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
                openedListSpends: [],
                openedListId: '',
                monthlySpendsId: null,
                dateId: '',
                date: '',
                showAllMonthsAddNoticeModal: false,
                showAllMonthsNoticeModal: false,
                showAllMonthsAmountHistoryModal: false,
                showAllMonthsSingleTemplate: false,
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
                // + '<div :id="date.date" v-if="monthList.length > 0 && date.id == dateId">'
                //     + '<div class="months">'//+ '<div class="months all-months">'
                //         + '<div class="date">{{ date.date }}</div>'
                //             + '<div class="month-item" v-for="(month, index, key) in monthList" >'
                //                 + '<div class="name-notices-block">'
                //                     + '<div @click="showAllMonthsAmountHistory(month.monthlySpendsId)" class="name"> {{ month.spendName }}</div>'
                //                     + '<button v-if="hasNotice(month.monthlySpendsId)" @click="getNoticesShowAllMonthModal(month.monthlySpendsId)" class="month-notices-show-button" > </button>'
                //                 + '</div>'
                //                 + '<div class="deposited">'
                //                     + '<span class="month-amount all">{{ month.monthAmount }} / {{ month.templateAmount }}</span>'
                //                 + '</div>'
                //                 + '<div class="buttons">'
                //                     + '<button v-bind:class="[ month.salary ? \'salary\' : \'prepaid\' ]"> </button>'
                //                     + '<button v-bind:class="[ month.cash ? \'cash\' : \'card\' ]"> </button>'
                //                 + '</div>'
                //                 + '<div class="sub-edit-block">'
                //                     + '<button @click="addNoticeModalFunc(month.monthlySpendsId)" class="notice"> </button>'
                //                 + '</div>'
                //             + '</div>'
                //         + '</div>'
                //     + '</div>'
                // + '</div>'
                + '<div v-if="date.id == openedListId && openedListSpends.length > 0" class="date">{{ date.date }}</div>'
                + '<all-month-single-template v-if="date.id == openedListId && openedListSpends.length > 0" :openedListSpends="openedListSpends" :noticesByMonthlySpendsId="noticesByMonthlySpendsId" />'
                + '<h4 v-if="localDatesList.length == 0">Has no months.</h4>'
                + '<allMonthsAddNoticeModal v-if="showAllMonthsAddNoticeModal" :monthlySpendsId="monthlySpendsId" />'
                + '<allMonthsNoticeModal v-if="showAllMonthsNoticeModal" :notices="notices" />'
                + '<allMonthsAmountHistoryModal v-if="showAllMonthsAmountHistoryModal" :monthlySpendsId="monthlySpendsId" />'
            + '</div>'
        + '</div>',
        watch: {
            noticesByMonthlySpendsId: {
                handler: function (val, oldVal) {},
                deep: true
            }
        },
        methods: {
            openOneMonth: function(dateId){
                this.openedListId = dateId === this.openedListId ? null : dateId;
                if (this.openedListId != null){ //нажата кнопка открыть/закрыть-> проверка, если открыт какой-то пункт меню, то запросить разностный массив для него, иначе нажата кнопка закрыть и делать ничего не надо
                    this.openedListSpends = [];

                    axios.get('month/getMonthWithDateId?dateId=' + this.dateId).then(result => {
                        console.log(result.data);
                        this.openedListSpends = result.data;
                    });
                }
            },
            getMonthWithDateId: function (dateId, date) {
                this.openedListId = this.dateId = dateId = dateId === this.openedListId ? null : dateId;
                this.date = date;
                if (this.openedListId != null){ //нажата кнопка открыть/закрыть-> проверка, если открыт какой-то пункт меню, то запросить разностный массив для него, иначе нажата кнопка закрыть и делать ничего не надо
                    this.openedListSpends = [];

                    axios.get('month/getMonthWithDateId?dateId=' + this.dateId).then(result => {
                        console.log(result.data);
                        this.openedListSpends = result.data;
                    });
                }
            },
            addNoticeModalFunc: function (monthlySpendId) {
                this.monthlySpendsId = monthlySpendId;
                this.showAllMonthsAddNoticeModal = true;
            },
            dateHasNotice: function(dateId) {
                return this.noticesByDateId.includes(dateId);
            },
            async getNoticesShowAllMonthModal(monthlySpendId) {
                await axios.get('notices/getByMonthlySpendsId/' + monthlySpendId).then(result => {
                    this.notices = result.data;
                    this.showAllMonthsNoticeModal = true;
                });
            },
            showAllMonthsAmountHistory: function(monthlySpendsId) {
                this.monthlySpendsId = monthlySpendsId;
                this.showAllMonthsAmountHistoryModal = true;
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
                    + '<div v-if="true" @click="closeModal()" class="modal-button close">×</div>'//<input style="width: 0; height: 0; border: none; margin: 0; padding: 0" @keydown.esc="$parent.showNoMonthModal = false" autofocus/>
                        + '<p>'
                        + '{{ bodyText }}<br />'
                        + '<textarea v-model="text" v-focus></textarea>'
                        + '<input id="is-remind" v-model="remind" type="checkbox"> <label for="is-remind">Remind</label> <button class="save-button" @click="saveNotice()"> </button>'
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

    Vue.component('allMonthsAmountHistoryModal', {
        props: ['monthlySpendsId'],
        data: function() {
            return {
                subModal: true,
                amountHistoryArr: [],
                unexpectedDelete: true,
                historyElementId: null
            }
        },
        template:
        '<div class="modal">'
            + '<transition name="slideIn" appear>'
                + '<div @focusout="handleFocusOut" v-if="subModal" class="modal-content">'
                    + '<div @click="closeModal()" class="modal-button close">×</div>'
                    + '<div class="amount-history" v-for="amountHistory in amountHistoryArr">'
                        + '{{amountHistory[0].date}}<div class="history-item" v-for="item in amountHistory">'
                        + '<span>{{ item.time }} - {{ item.amount }}р.</span> '
                        + '<span v-if="!unexpectedDelete && item.id == historyElementId " class="delete-warning-text">Будет удалено при повторном нажатии:<br/></span>'
                        + '<input v-bind:class="{ deleting: !unexpectedDelete && item.id == historyElementId }" @input="setComment(item.id)" :value="item.comment" />'
                        + '<button @click="deleteHistoryElement(item.id)" class="delete"> </button>'
                    + '</div>'
                    + '</div>'
                + '</div>'
            + '</transition>'
        + '</div>',
        watch: {
            amountHistoryArr: {
                handler: function (val, oldVal) {},
                deep: true
            }
        },
        methods: {
            handleFocusOut() {
                this.closeModal();
            },
            closeModal: function () {
                this.subModal = false;
                this.historyElementId = null;
                this.unexpectedDelete = true;
                let self = this;
                setTimeout(function(){
                    self.$parent.showAllMonthsAmountHistoryModal = false;
                }, 500);
            },
            setComment: function (itemId) {
                axios.post('monthAmountHistory?historyAmountId=' + itemId + '&comment=' + event.target.value);
            },
            deleteHistoryElement: function (itemId) {
                if (this.unexpectedDelete){
                    this.historyElementId = itemId;
                    this.unexpectedDelete = false;
                } else if(!this.unexpectedDelete && this.historyElementId === itemId) {
                    axios.delete('monthAmountHistory?historyAmountId=' + itemId).then(result => {
                        this.amountHistoryArr = result.data;
                    });
                    this.unexpectedDelete = true;
                    this.historyElementId = null;
                } else if(this.historyElementId !== itemId) {
                    this.unexpectedDelete = true;
                    this.historyElementId = null;
                }
            }
        },
        created: function () {
            axios.get('monthAmountHistory/' + this.monthlySpendsId)
                .then(result => {
                    if (!result.data || result.data.length < 1){
                        this.subModal = false;
                        this.$parent.showAllMonthsAmountHistoryModal = false;
                    } else {
                        this.amountHistoryArr = result.data;
                    }
                });
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
