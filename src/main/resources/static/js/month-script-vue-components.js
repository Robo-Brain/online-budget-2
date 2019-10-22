Vue.component('amountHistoryModal', {
    props: ['monthlySpendsId'],
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
            //if (this.historyAmountId !== itemId || this.comment === event.target.value) {

            //} else {
             //   console.log('duplicate entry with id: %d, and comment: %s', itemId, event.target.value)
            //}
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

Vue.component('createMonthModal', { //'<modalNoMonth v-if="this.showNoMonthModal == true" />
    props: ['fillCurrentMonth', 'dateId'],
    data: function() {
        return {
            enabledTemplatesHasFound: false,
            previousMonthHasFound: false,
            hideTimeoutIsOver: false,
            subModal: true,
            bodyText: 'Создать новый месяц?',
            warning: false,
            templatesList: [],
            selectedTemplateId: null,
            emptyMonth: false,
            previousMonthOverpaid: false
        }
    },
    mounted() {
        if (localStorage.date) {
            if (new Date() >= new Date(localStorage.date)){ // если текущее время больше, чем сохранненое в localStorage(там сохраняется время + 1минута), значит минута прошла
                this.hideTimeoutIsOver = true; // показать модальное окно "создай новый месяц"
                localStorage.removeItem("date");// удалить дату на всякий случай
            }
        } else {
            this.hideTimeoutIsOver = true;
        }
        axios.get('templatesList').then(result => {
            result.data.forEach(elem => {
                this.templatesList.push(elem);
                if (elem.templateEnabled) {
                    this.selectedTemplateId = elem.id;
                }
            });
        })
    },
    template:
    '<div class="modal">' //  && this.date <= actualDate
        + '<transition name="slideIn" appear>'
            + '<div v-if="subModal" class="modal-content notice">'
                + '<div @click="closeModal()" class="modal-button close">×</div>'//$emit('close'),
                // + '<p>{{bodyText}}</p>'
                + '<p>{{ bodyText.length > 1 ? bodyText : "Создать новый месяц?" }}<br /><br /></p>'
                + '<span class="new-month-warning" v-if="warning"><input id="warning" @click="warningToggle()" type="checkbox" /> <label for="warning">Игнорировать предупреждение</label></span>'
                + '<div v-if="!emptyMonth" class="buttonBlock">'
                    + '<button v-if="!warning" :disabled="!previousMonthHasFound" @click="createMonthByLast()">по последнему месяцу</button>'
                + '</div>'
                + '<div v-if="!emptyMonth" class="buttonBlock">'
                    + '<select v-if="!warning" >'
                        + '<option v-for="template in templatesList" v-bind:value="template.id" :selected="template.templateEnabled === true" >'
                        + '{{ template.templateName }}'
                        + '</option>'
                    + '</select>'
                    + '&nbsp;<button v-if="!warning" :disabled="templatesList.length < 1" @click="createMonthBySelectedTemplatesList()">по шаблону</button>'
                + '<br/><br/></div>'
        + '<span class="new-month-warning" v-if="!warning && !fillCurrentMonth"><input id="emptyMonth" v-model="emptyMonth" type="checkbox" /> <label for="emptyMonth">Создать пустой месяц</label></span>'
        + '<button @click="createEmptyMonth()" v-if="emptyMonth && !fillCurrentMonth">Создать</button>'
    + '</div>'
        + '</transition>'
    + '</div>',
    methods: {
        closeModal: function () {
            this.subModal = false;
            let self = this;
            setTimeout(function(){
                self.$parent.showCreateMonthModal = false;
            }, 500);
            this.ignoreWarning = this.warning = this.emptyMonth = false;
            this.bodyText = '';
            if (this.previousMonthOverpaid){
                this.$parent.showPreviousMonthOverpaidModal = true;
            }
        },
        warningToggle: function () {
            this.warning = false;
            this.bodyText = '';
        },
        createMonthBySelectedTemplatesList: function () {
            if (this.emptyMonth && !this.fillCurrentMonth){
                this.createEmptyMonth();
            } else if (!this.emptyMonth && !this.fillCurrentMonth) {
                if (this.selectedTemplateId > 0) {
                    axios.post('month/createFromTemplateListId?templateListId=' + this.selectedTemplateId).then(result => {
                        this.$parent.localMonthList = result.data;
                    });
                    this.$parent.editMode = false;
                } else {
                    console.log('selectedTemplateId not found or 0 less')
                }
            } else if (!this.emptyMonth && this.fillCurrentMonth) {
                axios.put('month/fillCurrentMonthByTemplatesListId?templateListId=' + this.selectedTemplateId + '&dateId=' + this.dateId).then(result => {
                    this.$parent.localMonthList = result.data;
                });
                this.$parent.editMode = false;
            } else {
                console.log('Abnormal statement!\nthis.emptyMonth: %s\nthis.fillCurrentMonth: %s', this.emptyMonth, this.fillCurrentMonth );
            }
        },
        createMonthByLast: function () {
            if (this.emptyMonth && !this.fillCurrentMonth){
                this.createEmptyMonth();
            } else if (!this.emptyMonth && !this.fillCurrentMonth) {
                if (this.previousMonthHasFound) {
                    axios.put('month/createNewMonthByPreviousMonth').then(result => {
                        this.$parent.localMonthList = result.data;
                    });
                    this.$parent.editMode = false;
                    this.closeModal();
                }
            } else if (!this.emptyMonth && this.fillCurrentMonth) {
                axios.put('month/fillCurrentMonthByPreviousMonth?dateId=' + this.dateId).then(result => {
                    this.$parent.localMonthList = result.data;
                });
                this.$parent.editMode = false;
                this.closeModal();
            } else {
                this.closeModal();
                console.log('Abnormal statement!\nthis.emptyMonth: %s\nthis.fillCurrentMonth: %s', this.emptyMonth, this.fillCurrentMonth );
            }
        },
        createEmptyMonth: function () {
            axios.put('dates/makeNewDate')
                    .then(async result => {
                        this.$parent.localMonthList = result.data;
                        this.$parent.editMode = true; // включить режим редактирования принудительно

                        await axios.get('spends') // попробовать получить dateId
                            .then(result => {
                                this.$parent.missingSpendsList = result.data;
                            });
                    });
            this.closeModal();
        }
    },
    created: function () {
        axios.get('month/all')
            .then(result => {
                    if(result.data.length > 0){
                        this.previousMonthHasFound = true // сделать кнопку "Заполнить по предыдущему месяцу" активной
                    }
                }
            ).catch(() => this.previousMonthHasFound = false);

        if (!this.fillCurrentMonth){
            axios.get('month/checkBeforeCreateNewMonth?dateId=' + this.$parent.dateId)
                .then(result => {
                    switch (result.data) {
                        case 'MONTH_OK.FULL_NOT':
                            this.bodyText = 'Платежи по текущему месяцу внесены не до конца, продолжить?';
                            this.warning = true;
                            break;
                        case 'MONTH_NOT.FULL_OK':
                            this.bodyText = 'Календарный месяц еще не завершен, продолжить?';
                            this.warning = true;
                            break;
                        case 'MONTH_NOT.FULL_NOT':
                            this.bodyText = 'Календарный месяц еще не завершен, платежи по текущему месяцу внесены не до конца, продолжить?';
                            this.warning = true;
                            break;
                    }
                });
        } else {
            this.bodyText = 'Заполнить текущий месяц?';
        }

        axios.get('month/getPreviousMonthOverpayment' ).then(() => {
            this.previousMonthOverpaid = true;
        });
    }
});

// Vue.component('createMonthModal', { //<modalCreateMonth v-if="this.showCreateMonthModal" :dateId="dateId" />
//         props: ['dateId'],
//         data: function() {
//         return {
//             bodyText: 'Создать новый месяц?',
//             warning: false,
//             ignoreWarning: false,
//             subModal: true,
//             emptyMonth: false,
//             previousMonthOverpaid: false
//         }
//     },
//     template:
//     '<div class="modal">'// v-if="this.$parent.showCreateMonthModal"
//         + '<transition name="slideIn" appear>'
//             + '<div v-if="subModal" class="modal-content new-month">'
//                 + '<div @click="closeModal()" class="modal-button close">×</div>'
//                 + '<p>'
//                     + '{{ bodyText }}<br />'
//                     + '<button class="new-month-button no" @click="closeModal()">NO</button> '
//                     + '<button v-if="!warning" @click="checkBeforeCreateNewMonth()" class="new-month-button yes">YES</button>'
//                     + '<button v-if="warning" :disabled="!ignoreWarning" @click="createNewMonth()" class="new-month-button yes">YES</button>'
//                     + '<br /><br />'
//                     + '<span class="new-month-warning" v-if="!warning"><input id="emptyMonth" v-model="emptyMonth" type="checkbox" /> <label for="emptyMonth">Создать пустой месяц</label></span>'
//                     + '<span class="new-month-warning" v-if="warning"><input id="warning" v-model="ignoreWarning" type="checkbox" /> <label for="warning">Игнорировать предупреждение</label></span>'
//                 + '</p>'
//             + '</div>'
//         + '</transition>'
//     + '</div>',
//     methods: {
//         closeModal: function () {
//             this.subModal = false;
//             let self = this;
//             setTimeout(function(){
//                 self.$parent.showCreateMonthModal = false;
//             }, 500);
//             this.ignoreWarning = this.warning = this.emptyMonth = false;
//             this.bodyText = 'Создать новый месяц?';
//         },
//         checkBeforeCreateNewMonth: function () {
//             axios.get('month/checkBeforeCreateNewMonth?dateId=' + this.dateId)
//                 .then(result => {
//                     switch (result.data) {
//                         case 'MONTH_OK.FULL_OK':
//                             if(!this.emptyMonth){
//                                 this.createNewMonth();
//                             } else {
//                                 this.emptyMonth = true;
//                                 this.createNewMonth();
//                             }
//                             break;
//                         case 'MONTH_OK.FULL_NOT':
//                             this.bodyText = 'Платежи по текущему месяцу внесены не до конца, продолжить?';
//                             this.warning = true;
//                             break;
//                         case 'MONTH_NOT.FULL_OK':
//                             this.bodyText = 'Календарный месяц еще не завершен, продолжить?';
//                             this.warning = true;
//                             break;
//                         case 'MONTH_NOT.FULL_NOT':
//                             this.bodyText = 'Календарный месяц еще не завершен, платежи по текущему месяцу внесены не до конца, продолжить?';
//                             this.warning = true;
//                             break;
//                     }
//             });
//         },
//         createNewMonth: function () {
//             axios.get('month/getPreviousMonthOverpayment' ).then(() => {
//                 this.$parent.showPreviousMonthOverpaidModal = true;
//             });
//             if(!this.emptyMonth){
//                 axios.put('month/createNewMonthByPreviousMonth?dateId=' + this.dateId)
//                     .then(result => {
//                         this.$parent.localMonthList = result.data;
//                     });
//             } else {
//                 axios.put('dates/makeNewDate')
//                     .then(async result => {
//                         this.$parent.localMonthList = result.data;
//                         this.$parent.editMode = true; // включить режим редактирования принудительно
//
//                         await axios.get('dates/lastDate') // попробовать получить dateId
//                             .then(result => {
//                                 this.dateId = result.data.id
//                             });
//                         await axios.get('spends') // попробовать получить dateId
//                             .then(result => {
//                                 this.missingSpendsList = result.data;
//                             });
//                     });
//             }
//             if (!this.previousMonthOverpaid){
//                 this.closeModal();
//             }
//         }
//     }
// });

Vue.component('noticeModal', {
    props: ['notices'],
    data: function() {
        return {
            subModal: true
        }
    },
    template:
    '<div class="modal">'
        + '<transition name="slideIn" appear>'
            + '<div @focusout="handleFocusOut" v-if="subModal" class="modal-content">'
                + '<div @click="closeModal()" class="modal-button close">×</div>'
                + '<div v-if="notices.length > 0" v-for="notice in notices">'
                    + '<li>{{ notice.text }}</li>'
                + '</div>'
            + '</div>'
        + '</transition>'
    + '</div>',
    methods: {
        handleFocusOut() {
            this.closeModal();
        },
        closeModal: function () {
            this.subModal = false;
            let self = this;
            setTimeout(function(){
                self.$parent.showNoticeModal = false;
            }, 500);
        }
    }
});

Vue.component('createTemplateModal', {// <modalCreateTemplate v-if="this.showCreateTemplateModal" :dateId="dateId" />
    props: ['dateId'],
    data: function() {
        return {
            name: '',
            bodyText: 'Имя шаблона:',
            subModal: true
        }
    },
    directives: {
        focus: {
            inserted: function (el) {
                el.focus()
            }
        }
    },
    template:
    '<div class="modal">'
    + '<transition name="slideIn" appear>'
        + '<div @focusout="handleFocusOut" v-if="subModal" class="modal-content new-template">'
                + '<div @click="closeModal()" class="modal-button close">×</div>'
                + '{{ bodyText }}'
                + '<p><input v-model="name" v-on:keyup="handleTemplateName($event)" v-focus /> <button class="save-button" @click="saveTemplateList()"> </button></p>'
            + '</div>'
        + '</transition>'
    + '</div>',
    methods: {
        handleFocusOut() {
            this.closeModal();
        },
        closeModal: function () {
            this.subModal = false;
            let self = this;
            setTimeout(function(){
                self.$parent.showCreateTemplateModal = false;
            }, 500);
            this.name = '';
            this.bodyText = 'Имя шаблона:';
        },
        handleTemplateName: function(event) {
            if (event.keyCode === 13) this.saveTemplateList();
        },
        saveTemplateList: function () {
            if (this.dateId > 0 && this.name.length > 1){
                axios.put('templatesList/createTemplatesListFromMonth?dateId=' + this.dateId + '&name=' + this.name)
                    .then(() => {
                        this.bodyText = 'OK';
                        let self = this;
                        setTimeout(function(){
                            self.closeModal();
                        }, 1000);
                    })
            }

        }
    }
});

Vue.component('createNoticeModal', {//<createNotice v-if="this.showNoticeModal" :monthlySpendsId="monthlySpendsId" />
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
    directives: {
        focus: {
            inserted: function (el) {
                el.focus()
            }
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
                self.$parent.showCreateNoticeModal = false;
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
                    this.$parent.noticesMonthlySpendsId.push(this.monthlySpendsId);
                    let self = this;
                    setTimeout(function(){
                        self.closeModal();
                    }, 1000);
                });

        }
    }
});

Vue.component('deleteMonthModal', {
    props: ['dateId'],
    data: function() {
        return {
            ignoreWarning: false,
            subModal: true
        }
    },
    template:
    '<div class="modal">'
        + '<transition name="slideIn" appear>'
            + '<div v-if="subModal" class="modal-content">'
                + '<div @click="closeModal()" class="modal-button close">×</div>'
                + '<p>'
                    + 'Удалить текущий месяц?<br />'
                    + '<button class="new-month-button no" @click="closeModal()">NO</button> <button :disabled="!ignoreWarning" @click="deleteMonth()" class="new-month-button yes">YES</button><br /><br />'
                    + '<span class="new-month-warning"><input id="warning" v-model="ignoreWarning" type="checkbox" /> <label for="warning">Я осознаю, что действие необратимо</label></span>'
                + '</p>'
            + '</div>'
        + '</transition>'
    + '</div>',
    methods: {
        closeModal: function () {
            this.subModal = false;
            let self = this;
            setTimeout(function(){
                self.$parent.showDeleteMonthModal = false;
            }, 500);
        },
        deleteMonth: function() {
            axios.delete('month/deleteMonth?dateId=' + this.dateId)
                .then(result => {
                    this.$parent.localMonthList = result.data;
                    this.closeModal();
                })
        }
    }
});

Vue.component('plusAmountMonthModal', {
    props: ['monthlySpendsId', 'templateAmount'],
    data: function() {
        return {
            subModal: true,
            plusAmount: ''
        }
    },
    directives: {
        focus: {
            inserted: function (el) {
                el.focus()
            }
        }
    },
    template:
        '<transition name="slideToRight" appear>'
            + '<div @focusout="handleFocusOut" tabindex="0" v-if="subModal" class="modal-plus-content">'
                + '<button class="fill" @click="fillMonthAmount()">  </button>'
                + '<input class="plusAmountInput" v-model="plusAmount" v-on:keyup="handleMonthAmount($event)" type="number" v-focus />'
                + '<button class="plus" @click="plusMonthAmount()"> + </button>'
            + '</div>'
        + '</transition>',
    methods: {
        handleFocusOut() {
            if (this.plusAmount < 1){
                this.closeModal();
            }
        },
        closeModal: function () {
            this.subModal = false;
            this.plusAmount = '';
            let self = this;
            setTimeout(function(){
                self.$parent.showPlusAmountMonthModal = false;
            }, 500);
        },
        handleMonthAmount: function(event) {
            if (event.keyCode === 13) this.plusMonthAmount();
        },
        plusMonthAmount: function () {
            if (this.plusAmount > 0 && this.monthlySpendsId > 0){
                axios.put('month/plusMonthAmount?monthlySpendsId=' + this.monthlySpendsId + '&plusAmount=' + this.plusAmount)
                    .then(result => {
                        this.$parent.localMonthList = result.data;
                        this.closeModal();
                    })
            }
        },
        fillMonthAmount: function () {
            if (this.templateAmount > 0 && this.monthlySpendsId > 0){
                axios.put('month/saveMonthAmount?monthlySpendsId=' + this.monthlySpendsId + '&amount=' + this.templateAmount)
                    .then(result => {
                        this.$parent.localMonthList = result.data;
                        this.closeModal();
                    })
            } else if(this.templateAmount === 0) {
                this.closeModal();
            }
        }
    }
});

Vue.component('previousMonthOverpaidModal', {
    data: function() {
        return {
            subModal: true,
            normalizePreviousAmounts: true,
            showOverpaids: false,
            overpaidsList: [],
            selectedOverpaids: [],
            selectAllOverpaids: true
        }
    },
    template:
        '<div class="modal">'
            + '<transition name="slideIn" appear>'
                + '<div v-if="subModal" class="modal-content overpaid">'
                    + '<div @click="closeModal()" class="modal-button close">×</div>'
                    + '<p>'
                        + 'В предыдущем месяце найдена <a @click="showOverpaids = !showOverpaids">переплата</a>, перенести её в текущий месяц?<br />'
                        + '<button class="new-month-button no" @click="closeModal()">NO</button>'
                        + '<button :disabled="!selectAllOverpaids && selectedOverpaids.length < 1" @click="transfer()" class="new-month-button yes">YES</button><br /><br />'
                        + '<span class="new-month-warning"><input id="warning" v-model="normalizePreviousAmounts" type="checkbox"/> <label for="warning">Удалить переплаты из прошлого месяца</label></span>'
                    + '</p>'
                    + '<input type="checkbox" v-model="selectAllOverpaids" id="selectAll" v-if="showOverpaids" /><label v-if="showOverpaids" for="selectAll">Выбрать все</label>'
                    + '<li v-if="showOverpaids" v-for="(overpaid, index) in overpaidsList">'
                        + '<input @change="select(overpaid.monthlySpendsId)" type="checkbox" :id="index" :value="overpaid.monthlySpendsId" :disabled="selectAllOverpaids" :checked="selectAllOverpaids">'
                        + '<label :for="index">{{overpaid.spendName}}: {{overpaid.monthAmount - overpaid.templateAmount}}р.</label>'
                    + '</li>'
                + '</div>'
            + '</transition>'
        + '</div>',
    methods: {
        transfer: function() {
            console.log(this.selectAllOverpaids);
            console.log(this.selectedOverpaids.length);
            if (this.selectAllOverpaids){
                axios.post('month/transferOverpaymentToCurrentMonth?normalize=' + this.normalizePreviousAmounts).then(result => {
                    this.$parent.localMonthList = result.data;
                });
            } else if(!this.selectAllOverpaids && this.selectedOverpaids.length > 0){
                axios.post('/month/transferSelectedOverpaymentToCurrentMonth?overpaymentId=' + this.selectedOverpaids + '&normalize=' + this.normalizePreviousAmounts).then(result => {
                    this.$parent.localMonthList = result.data;
                });
            }
            this.closeModal();
        },
        closeModal: function () {
            this.subModal = false;
            let self = this;
            setTimeout(function(){
                self.$parent.showPreviousMonthOverpaidModal = false;
            }, 500);
        },
        select: function (monthlySpendsId) {
            if (this.selectedOverpaids.includes(monthlySpendsId)) {
                this.selectedOverpaids.splice(this.selectedOverpaids.indexOf(monthlySpendsId), 1)
            } else {
                this.selectedOverpaids.push(monthlySpendsId)
            }
        }
    },
    created: function () {
        axios.get('month/getPreviousMonthOverpayment' ).then(result => {
            console.log(result.data);
            this.overpaidsList = result.data;
            if (this.overpaidsList.length < 1) self.$parent.showPreviousMonthOverpaidModal = false;
        });
    }
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
