Vue.component('amountHistoryModal', {
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
            + '<div v-if="subModal" class="modal-content">'
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
                    this.$parent.showAmountHistoryModal = false;
                } else {
                    this.amountHistoryArr = result.data;
                }
            });
    }
});

Vue.component('createMonthModal', { //<modalCreateMonth v-if="this.showCreateMonthModal" :dateId="dateId" />
        props: ['dateId'],
        data: function() {
        return {
            bodyText: 'Создать новый месяц?',
            warning: false,
            ignoreWarning: false,
            subModal: true,
            emptyMonth: false
        }
    },
    template:
    '<div class="modal">'// v-if="this.$parent.showCreateMonthModal"
        + '<transition name="slideIn" appear>'
            + '<div v-if="subModal" class="modal-content new-month">'
                + '<div @click="closeModal()" class="modal-button close">×</div>'
                + '<p>'
                    + '{{ bodyText }}<br />'
                    + '<button class="new-month-button no" @click="closeModal()">NO</button> '
                    + '<button v-if="!warning" @click="checkBeforeCreateNewMonth()" class="new-month-button yes">YES</button>'
                    + '<button v-if="warning" :disabled="!ignoreWarning" @click="createNewMonth()" class="new-month-button yes">YES</button>'
                    + '<br /><br />'
                    + '<span class="new-month-warning" v-if="!warning"><input id="emptyMonth" v-model="emptyMonth" type="checkbox" /> <label for="emptyMonth">Создать пустой месяц</label></span>'
                    + '<span class="new-month-warning" v-if="warning"><input id="warning" v-model="ignoreWarning" type="checkbox" /> <label for="warning">Игнорировать предупреждение</label></span>'
                + '</p>'
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
            this.bodyText = 'Создать новый месяц?';
        },
        checkBeforeCreateNewMonth: function () {
            axios.get('month/checkBeforeCreateNewMonth?dateId=' + this.dateId)
                .then(result => {
                    switch (result.data) {
                        case 'MONTH_OK.FULL_OK':
                            if(!this.emptyMonth){
                                this.createNewMonth();
                            } else {
                                this.emptyMonth = true;
                                this.createNewMonth();
                            }
                            break;
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
        },
        createNewMonth: function () {
            if(!this.emptyMonth){
                axios.put('month/createNewMonthByDateId?dateId=' + this.dateId)
                    .then(result => {
                        this.$parent.localMonthList = result.data;
                    });
            } else {
                axios.put('dates/makeNewDate')
                    .then(async result => {
                        this.$parent.localMonthList = result.data;
                        this.$parent.editMode = true; // включить режим редактирования принудительно

                        await axios.get('dates/lastDate') // попробовать получить dateId
                            .then(result => {
                                this.date = result.data.date;
                                this.dateId = result.data.id
                            });
                        await axios.get('spends') // попробовать получить dateId
                            .then(result => {
                                this.missingSpendsList = result.data;
                            });
                    });
            }
            this.closeModal();
        }
    }
});

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
        + '<div v-if="subModal" class="modal-content new-template">'
                + '<div @click="closeModal()" class="modal-button close">×</div>'
                + '{{ bodyText }}'
                + '<p><input v-model="name" v-on:keyup="handleTemplateName($event)" v-focus /> <button class="save-button" @click="saveTemplateList()"> </button></p>'
            + '</div>'
        + '</transition>'
    + '</div>',
    methods: {
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

Vue.component('noMonthModal', { //'<modalNoMonth v-if="this.showNoMonthModal == true" />
    data: function() {
        return {
            enabledTemplatesHasFound: false,
            previousMonthHasFound: false,
            hideTimeoutIsOver: false,
            subModal: true,
            bodyText: 'Создать их по активному шаблону или по платежам за предыдущий месяц?',
            warning: false,
            templatesList: [],
            selectedTemplateId: null
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
        '<div v-if="(enabledTemplatesHasFound || previousMonthHasFound) && hideTimeoutIsOver" class="modal">' //  && this.date <= actualDate
            + '<transition name="slideIn" appear>'
                + '<div v-if="subModal" class="modal-content notice">'
                    + '<div v-if="true" @click="closeModal()" class="modal-button close">×</div>'//$emit('close'),
                    + '<p>Внимание, платежи по текущему месяцу не найдены!</p>'
                    + '<span v-if="bodyText.length > 1">{{ bodyText }}<br /></span>'
                    + '<span class="new-month-warning" v-if="warning"><input id="warning" @click="warningToggle()" type="checkbox" /> <label for="warning">Игнорировать предупреждение</label></span>'
                    + '<div class="buttonBlock">'
                        + '<button v-if="!warning" :disabled="!previousMonthHasFound" @click="createMonthByLast()">по последнему месяцу</button>'
                    + '</div>'
                    + '<div class="buttonBlock">'
                        + '<select v-if="!warning" @change="pushSpendToMonth()" >'
                            + '<option v-for="template in templatesList" v-bind:value="template.id" :selected="template.templateEnabled === true" >'
                            + '{{ template.templateName }}'
                            + '</option>'
                        + '</select>'
                        + '&nbsp;<button v-if="!warning" :disabled="!enabledTemplatesHasFound" @click="createMonthBySelected()">по шаблону</button>'
                    + '</div>'
                + '</div>'
            + '</transition>'
        + '</div>',
    methods: {
        closeModal: function () {
            this.subModal = false;
            let self = this;
            setTimeout(function(){
                self.$parent.showNoMonthModal = false;
            }, 500);
            let d = new Date();
            d.setMinutes(d.getMinutes()+5);
            localStorage.date = d; // записать время+5мин в localStorage
        },
        warningToggle: function () {
            this.warning = false;
            this.bodyText = '';
        },
        createMonthBySelected: function () {
            if (this.selectedTemplateId > 0){
                axios.post('month/createFromTemplateListId?templateListId=' + this.selectedTemplateId).then(result => {
                    this.$parent.localMonthList = result.data;
                    this.$parent.date = result.data[0].date;
                });
                this.$parent.showNoMonthModal = false;
            } else {
                console.log('selectedTemplateId not found or 0 less')
            }
        },
        createMonthByLast: function () {
            if (this.previousMonthHasFound) {
                axios.get('month/createFromLastMonth').then(result => {
                    this.$parent.localMonthList = result.data;
                    this.$parent.date = result.data[0].date;
                });
                this.$parent.showNoMonthModal = false;
            }
        }
    },
    created: function () {
        axios.get('templatesList/getEnabledTemplate').then( // если найден шаблон с полем enabled = true, то
            response => {
                if(response.data.id){
                    this.enabledTemplatesHasFound = true // сделать кнопку "Заполнить по активному шаблону" активной
                }
            }
        ).catch(
            () => this.enabledTemplatesHasFound = false
        );
        axios.get('month/all').then( // если найдены предыдущие месяцы, то
            response => {
                if(response.data.length > 0){
                    this.previousMonthHasFound = true // сделать кнопку "Заполнить по предыдущему месяцу" активной
                }
            }
        ).catch(
            () => this.previousMonthHasFound = false
        );
        axios.get('month/checkBeforeCreateNewMonth?dateId=' + this.$parent.dateId)
            .then(result => {
                switch (result.data) {
                    case 'MONTH_OK.FULL_NOT':
                        this.bodyText = 'Платежи по текущему месяцу внесены не до конца';
                        this.warning = true;
                        break;
                }
            });

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
            + '<div v-if="subModal" class="modal-plus-content">'
                // + '<div @click="closeModal()" class="modal-button close">×</div>'
                + '<button class="fill" @click="fillMonthAmount()">  </button>'
                + '<input class="plusAmountInput" v-model="plusAmount" v-on:keyup="handleMonthAmount($event)" type="number" v-focus />'
                + '<button class="plus" @click="plusMonthAmount()"> + </button>'
            + '</div>'
        + '</transition>',
    methods: {
        closeModal: function () {
            this.subModal = false;
            let self = this;
            setTimeout(function(){
                self.$parent.showPlusAmountMonthModal = false;
            }, 500);
        },
        handleMonthAmount: function(event) {
            if (event.keyCode === 13) this.plusMonthAmount();
        },
        plusMonthAmount: function () {
            console.log(this.templateAmount + ' / ' + this.monthlySpendsId);
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