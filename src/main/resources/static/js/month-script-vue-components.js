Vue.component('createMonthModal', { //<modalCreateMonth v-if="this.showCreateMonthModal" :dateId="dateId" />
        props: ['dateId'],
        data: function() {
        return {
            bodyText: 'Создать новый месяц?',
            warning: false,
            ignoreWarning: false,
            subModal: true
        }
    },
    template:
    '<div class="modal">'// v-if="this.$parent.showCreateMonthModal"
        + '<transition name="slideIn" appear>'
            + '<div v-if="subModal" class="modal-content new-month">'
                + '<div @click="closeModal()" class="modal-button close">×</div>'
                + '<p>'
                    + '{{ bodyText }}<br />'
                    + '<button class="new-month-button no" @click="closeModal()">NO</button> <button :disabled="warning && !ignoreWarning" @click="createNewMonth()" class="new-month-button yes">YES</button><br /><br />'
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
            this.ignoreWarning = this.warning = false;
            this.bodyText = 'Создать новый месяц?';
        },
        createNewMonth: function () {
            if (!this.warning){
                axios.get('month/checkBeforeCreateNewMonth?dateId=' + this.dateId)
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
                    })
            } else if (this.ignoreWarning && this.dateId > 0){
                axios.put('month/createNewMonthByDateId?dateId=' + this.dateId)
                    .then(result => {
                        console.log(result.data);
                        this.$parent.monthList = result.data;
                        this.closeModal();
                    })
            }

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
    template:
    '<div class="modal">'
    + '<transition name="slideIn" appear>'
        + '<div v-if="subModal" class="modal-content new-template">'
                + '<div @click="closeModal()" class="modal-button close">×</div>'
                + '{{ bodyText }}'
                + '<p><input v-model="name" autofocus/> <button class="save-button" @click="saveTemplateList()"> </button></p>'
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
    template:
    '<div class="modal">'
        + '<transition name="slideIn" appear>'
            + '<div v-if="subModal" class="modal-content notice">'
                + '<div v-if="true" @click="closeModal()" class="modal-button close">×</div>'//<input style="width: 0; height: 0; border: none; margin: 0; padding: 0" @keydown.esc="$parent.showNoMonthModal = false" autofocus/>
                + '<p>'
                    + '{{ bodyText }}<br />'
                    + '<textarea v-model="text" @keydown.esc="$parent.showNoMonthModal = false" autofocus></textarea>'
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
                    this.$parent.noticesMonthlySpendsId = await getNotices();
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
            subModal: true
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
    },
    template:
        '<div v-if="(enabledTemplatesHasFound || previousMonthHasFound) && hideTimeoutIsOver" class="modal">' //  && this.date <= actualDate
            + '<transition name="slideIn" appear>'
                + '<div v-if="subModal" class="modal-content notice">'
                    + '<div v-if="true" @click="closeModal()" class="modal-button close">×</div>'//$emit('close'),
                    + '<p>Внимание, платежи по текущему месяцу не найдены!</p>'
                    + '<p>'
                        + 'Создать их по активному шаблону или по платежам за предыдущий месяц?<br />'
                        + '<button :disabled="!enabledTemplatesHasFound" @click="createMonthByEnabled()">по шаблону</button>'
                        + '<button :disabled="!previousMonthHasFound" @click="createMonthByLast()">по месяцу</button>'
                    + '</p>'
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
            d.setMinutes(d.getMinutes()+1);
            localStorage.date = d; // записать время+1мин в localStorage
        },
        createMonthByEnabled: function () {
            if (this.enabledTemplatesHasFound){
                axios.get('month/createFromEnabled').then(result =>
                    this.$parent.localMonthList = result.data
                );
                this.$parent.showNoMonthModal = false;
            }
        },
        createMonthByLast: function () {
            if (this.previousMonthHasFound) {
                axios.get('month/createFromLastMonth').then(result =>
                    this.$parent.localMonthList = result.data
                );
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
            error => this.enabledTemplatesHasFound = false
        );
        axios.get('month/all').then( // если найдены предыдущие месяцы, то
            response => {
                if(response.data.length > 0){
                    this.previousMonthHasFound = true // сделать кнопку "Заполнить по предыдущему месяцу" активной
                }
            }
        ).catch(
            error => this.previousMonthHasFound = false
        );
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
    props: ['monthlySpendsId'],
    data: function() {
        return {
            subModal: true,
            plusAmount: 0
        }
    },
    template:
        '<transition name="slideToRight" appear>'
            + '<div v-if="subModal" class="modal-plus-content">'
                // + '<div @click="closeModal()" class="modal-button close">×</div>'
                + '<input v-model="plusAmount" type="number" />'
                + '<button @click="plusMonthAmount()"> + </button>'
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
        plusMonthAmount: function () {
            if (this.plusAmount > 0 && this.monthlySpendsId > 0){
                axios.put('month/plusMonthAmount?monthlySpendsId=' + this.monthlySpendsId + '&plusAmount=' + this.plusAmount)
                    .then(result => this.$parent.localMonthList = result.data)
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