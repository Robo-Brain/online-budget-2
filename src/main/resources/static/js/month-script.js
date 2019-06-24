// *** SPENDS start *** //

function showLastMonth() {

    $('#month').show();
    $('#spends').hide();
    $('#templates-list').hide();
    $('#allMonths').hide();

    Vue.component('notice', {
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
        '<div v-if="this.$parent.showNoticeModal" id="modal-template">'
            + '<div class="modal-mask"><div class="modal-wrapper"><div class="modal-container">'
                + '<div class="modal-header">'
                    + '<slot name="header"><strong>Notice</strong></slot>'
                + '</div>'
                + '<div class="modal-body">'
                    + '<p v-bind:class="[ isError ? \'error\' : \'noError\' ]"><slot name="body">{{ bodyText }}</slot></p>'
                    + '<textarea v-model="text" ></textarea>'
                    + 'Remind: <input v-model="remind" type="checkbox" />'
                + '</div>'
                + '<div class="modal-footer">'
                    + '<slot name="footer">'
                    + '<button @click="closeModal()">X</button> <button @click="saveNotice()">Save</button>'
                    + '</slot>'
                + '</div>'
            + '</div></div></div>'
        + '</div>',
        methods: {
            closeModal: function () {
                this.$parent.showNoticeModal = false;
            },
            saveNotice: function () {
                axios.put('notices/add?monthlySpendId=' + this.monthlySpendsId + '&text=' + this.text + '&remind=' + this.remind)
                    .then(() => {
                        this.bodyText = 'OK';
                        let self = this;
                        setTimeout(function(){
                            self.$parent.showNoticeModal = false
                        }, 1000);
                    })
                    .catch((error) => {
                        this.isError = true;
                        this.bodyText = error;
                    });
            }
        }
    });

    Vue.component('modal', { // модальное окно с сообщением о том, что текущего месяца нет
        template:
        '<div v-if="this.$parent.showModal == true && (enabledTemplatesHasFound || previousMonthHasFound)" id="modal-template">'
            + '<div class="modal-mask"><div class="modal-wrapper"><div class="modal-container">'
                + '<div class="modal-header">'
                    + '<slot name="header">Внимание, текущий месяц не найден!</slot>'
                + '</div>'
                + '<div class="modal-body">'
                    + '<slot name="body">Создай новый месяц по активному шаблону или по предыдущему месяцу:</slot>'
                + '</div>'
                + '<div class="modal-footer">'
                    + '<slot name="footer">'
                        + '<button @click="closeModal()">X</button> <button :disabled="!enabledTemplatesHasFound" @click="createMonthByEnabled()">by Enabled</button>'
                            + '&nbsp;'
                        + '<button :disabled="!previousMonthHasFound" @click="createMonthByLast()">by Last</button>'
                    + '</slot>'
                + '</div>'
            + '</div></div></div>'
        + '</div>',
        data: function() {
            return {
                enabledTemplatesHasFound: false,
                previousMonthHasFound: false
            }
        },
        methods: {
            closeModal: function () {
                this.$parent.showModal = false;
            },
            createMonthByEnabled: function () {
                if (this.enabledTemplatesHasFound){
                    let tmpList = [];
                    axios.get('month/createFromEnabled').then(result =>
                        result.data.forEach(month => {
                            tmpList.push(month);
                        })
                    );
                    this.$parent.showModal = false;
                    this.$parent.monthList = tmpList;
                }
            },
            createMonthByLast: function () {
                if (this.previousMonthHasFound) {
                    var tmpList = [];
                    axios.get('month/createFromLastMonth').then(result =>
                        result.data.forEach(month => {
                            tmpList.push(month);
                        })
                    );
                    this.$parent.showModal = false;
                    this.$parent.monthList = tmpList;
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

    Vue.component('month-list', {
        props: ['monthList'],
        data: function() {
            return {
                date: '',
                showModal: false,
                showNoticeModal: false,
                spendId: '',
                missingSpendsList: [],
                dateId: '',
                showSpendInput: false,
                templateAmount: '',
                newMonthAmount: null,
                isCash: '',
                isSalary: '',
                editMode: false,
                deleteMode: true,
                monthlySpendsId: '',
                totalAmountSalaryCard: 0,
                totalAmountSalaryCash: 0,
                totalAmountPrepaidCard: 0,
                totalAmountPrepaidCash: 0
            }
        },
        template:
            '<div class="months">'
                + '<div class="monthDate" colspan="4"> {{ date }} <button class="edit-button" v-bind:class="{ true: editMode }" v-if="date" @click="editModeToggle()"> </button></div>'
                + '<div v-if="!editMode"class="month-item" v-for="(month, index, key) in monthList" >'
                        + '<div class="name"> {{ month.spendName }}</div>'
                        + '<div class="deposited">'
                            + '<input @input="setMonthAmount($event)" :id="month.monthlySpendsId" :value="month.monthAmount" />'
                            + '/<span class="month-amount">{{ month.templateAmount }}</span>'
                        + '</div>'
                        + '<div class="buttons">'
                            + '<button v-bind:class="[ month.salary ? \'salary\' : \'prepaid\' ]"> </button>'
                            + '<button v-bind:class="[ month.cash ? \'cash\' : \'card\' ]"> </button>'
                            + '<button @click="toggleNoticeModal(month.monthlySpendsId)" class="notice"> </button>'
                        + '</div>'
                + '</div>'
                + '<div v-if="editMode" class="month-item" v-for="(month, index, key) in monthList" >'
                    + '<div class="name">'
                        + ' {{ month.spendName }}'
                    + '</div>'
                    + '<div class="deposited" v-bind:class="{ edit: editMode }">'
                        + '<input :id="month.monthlySpendsId" :value="month.templateAmount" @input="setAmount($event)" />'
                    + '</div>'
                    + '<div class="buttons" v-bind:class="{ edit: editMode }">'
                        + '<button :id="month.monthlySpendsId" @click="salaryToggle($event)" v-bind:class="[ month.salary ? \'salary\' : \'prepaid\' ]"> </button>'
                        + '<button :id="month.monthlySpendsId" @click="cashToggle($event)" v-bind:class="[ month.cash ? \'cash\' : \'card\' ]"> </button>'
                        + '<button v-if="!deleteMode" class="save" @click="saveSpendInMonth()">✓</button>'
                        + '<button v-else-if="deleteMode" class="delete" @click="delMonthSpend(month.monthlySpendsId)">X</button>'
                    + '</div>'
                + '</div>'
                + '<div v-if="!editMode" class="total-amount">'
                    + '<div class="salary-block">'
                        + '<div class="salary-total">'
                            + 'ЗП: {{ totalAmountSalaryCash + totalAmountSalaryCard }}<span>{</span>'
                        + '</div>'
                        + '<div class="cash-total">'
                            + '<button class="cash"> </button> {{ totalAmountSalaryCash }}'
                        + '</div>'
                        + '<div class="card-total">'
                            + '<button class="card"> </button> {{ totalAmountSalaryCard }}'
                        + '</div>'
                    + '</div>'
                    + '<div class="prepaid-block">'
                        + '<div class="prepaid-total">'
                            + 'Аванс: {{ totalAmountPrepaidCash + totalAmountPrepaidCard }}<span>{</span>'
                        + '</div>'
                        + '<div class="cash-total">'
                            + '<button class="cash"> </button> {{ totalAmountPrepaidCash }}'
                        + '</div>'
                        + '<div class="card-total">'
                            + '<button class="card"> </button> {{ totalAmountPrepaidCard }}'
                        + '</div>'
                    + '</div>'
                + '</div>'
                + '<select class="add-new-spend" v-else-if="editMode" @change="toggleShowSpendInput()" v-model="spendId" >'
                    + '<option v-for="spend in missingSpendsList" v-bind:value="spend.id">'
                        + '{{ spend.name }}'
                    + '</option>'
                + '</select>'
                + '<div v-if="editMode && showSpendInput" class="spend-input">'
                    + 'Сумма: <input v-model="templateAmount" />'
                    + '&nbsp;<button v-bind:class="[ isSalary ? \'salary\' : \'prepaid\' ]" @click="salaryToggle($event)"> </button>'
                    + '&nbsp;<button v-bind:class="[ isCash ? \'cash\' : \'card\' ]" @click="cashToggle($event)"> </button>'
                    + '&nbsp;<button v-if="templateAmount.length > 2" @click="pushSpendToMonth()">Add</button>'
                + '</div>'
            + '<modal /><notice :monthlySpendsId="monthlySpendsId" /></div>',
        methods: {
            setMonthAmount: function(event) {
                this.monthlySpendsId = event.target.id;
                this.newMonthAmount = event.target.value;
                axios.put('month/saveMonthAmount?monthlySpendsId='
                    + this.monthlySpendsId
                    + "&amount="
                    + this.newMonthAmount)
                    .then(result => this.monthList = result.data)
            },
            editModeToggle: function() { // режим редактирования monthly_spend On/Off
                this.spendId = '';
                this.showSpendInput = false;
                this.templateAmount = '';
                this.editMode = !this.editMode;
                this.deleteMode = true;
            },
            toggleShowSpendInput: function() { // форма добавления нового spend в monthly_spends On/Off
                this.showSpendInput = true;
                this.isCash = false;
                this.isSalary = false;
            },
            setAmount: function(event) { // установка новой суммы для spend в режиме редактирования monthly_spend
                this.templateAmount = event.target.value;
                this.monthlySpendsId = event.target.id;
                this.deleteMode = false;
            },
            salaryToggle: function (event) { // изменение стиля кнопки salary <-> prepaid и установка значения в this.isSalary
                this.monthlySpendsId = event.target.id;
                this.isSalary = event.target.className !== 'salary';
                event.target.className = this.isSalary ? 'salary' : 'prepaid';
                this.deleteMode = false;
            },
            cashToggle: function (event) { // изменение стиля кнопки cash <-> card и установка значения в this.isCash
                this.monthlySpendsId = event.target.id;
                this.isCash = event.target.className !== 'cash';
                event.target.className = this.isCash ? 'cash' : 'card';
                this.deleteMode = false;
            },
            saveSpendInMonth: function () {
                if (this.monthlySpendsId.length > 0){
                    axios.put('month/editMonthSpend?monthlySpendsId=' + this.monthlySpendsId
                        + '&amount=' + this.templateAmount
                        + '&isSalary=' + this.isSalary
                        + '&isCash=' + this.isCash
                    ).then(async result => {
                        if(result.data.length > 0) {
                            this.monthList = result.data;
                            await getTotalAmounts(result.data).then(amountsArr => {
                                this.totalAmountSalaryCash = amountsArr.amountSalaryCash;
                                this.totalAmountSalaryCard = amountsArr.amountSalaryCard;
                                this.totalAmountPrepaidCash = amountsArr.amountPrepaidCash;
                                this.totalAmountPrepaidCard = amountsArr.amountPrepaidCard;
                            });
                            this.spendId = this.templateAmount = this.isCash = this.isSalary = '';
                            this.editMode = false;
                            this.deleteMode = true;
                        }
                    });
                }
            },
            pushSpendToMonth: function () {
                axios.put('month/pushSpendToMonth?spendId=' + this.spendId
                    + '&monthlySpendsId=' + this.monthlySpendsId
                    + '&amount=' + this.templateAmount
                    + '&isSalary=' + this.isSalary
                    + '&isCash=' + this.isCash
                    )
                        .then(async result => {
                            if (result.data.length > 0) {
                                this.date = result.data[0].date;
                                this.dateId = result.data[0].dateId;

                                this.monthList = result.data;
                                await getMissingSpends(this.dateId).then(res => {
                                    this.missingSpendsList = res.data;
                                });

                                await getTotalAmounts(result.data).then(amountsArr => {
                                    this.totalAmountSalaryCash = amountsArr.amountSalaryCash;
                                    this.totalAmountSalaryCard = amountsArr.amountSalaryCard;
                                    this.totalAmountPrepaidCash = amountsArr.amountPrepaidCash;
                                    this.totalAmountPrepaidCard = amountsArr.amountPrepaidCard;
                                });

                                this.spendId = this.templateAmount = this.isCash = this.isSalary = '';
                                this.showSpendInput = false;
                            }
                        });

            },
            delMonthSpend: function (monthlySpendsId) {
                axios.delete('month/deleteSpendFromMonth?monthId=' + monthlySpendsId).then(async result => {
                    await getMissingSpends(result.data[0].dateId).then(res => {
                        this.missingSpendsList = res.data;
                    });
                    await getTotalAmounts(result.data).then(amountsArr => {
                        this.totalAmountSalaryCash = amountsArr.amountSalaryCash;
                        this.totalAmountSalaryCard = amountsArr.amountSalaryCard;
                        this.totalAmountPrepaidCash = amountsArr.amountPrepaidCash;
                        this.totalAmountPrepaidCard = amountsArr.amountPrepaidCard;
                    });
                    this.monthList = result.data;
                    this.editMode = false;
                });

            },
            toggleNoticeModal: function (monthlySpendId) {
                this.monthlySpendsId = monthlySpendId;
                this.showNoticeModal = true;
            }
        },
        created: function () {
            function getThisMonth() {
                return axios.get('month');
            }
            function getLastMonth() {
                return axios.get('month/getPreviousMonth');
            }

            getThisMonth().then(async result => {// получить текущий месяц
                this.date = result.data[0].date;
                this.dateId = result.data[0].dateId;
                this.monthList = result.data;
                await getTotalAmounts(result.data).then(amountsArr => {
                    this.totalAmountSalaryCash = amountsArr.amountSalaryCash;
                    this.totalAmountSalaryCard = amountsArr.amountSalaryCard;
                    this.totalAmountPrepaidCash = amountsArr.amountPrepaidCash;
                    this.totalAmountPrepaidCard = amountsArr.amountPrepaidCard;
                });
                await getMissingSpends(this.dateId).then(res => this.missingSpendsList = res.data);
            })
                .catch(error => { // прикрутить обработчик ошибок на код 404 чтобы вылетал modal
                    getLastMonth().then(async res => {// если не вышло, то какой-то из прошлых
                        this.date = res.data[0].date;
                        this.dateId = res.data[0].dateId;
                        this.monthList = res.data;
                        this.showModal = true;
                        await getMissingSpends(res.data[0].dateId).then(res => this.missingSpendsList = res.data);
                    })
                        .catch(async () => {// если снова не вышло, то что-то пошло не так, вероятно таблица dates вообще пустая
                            await getAllSpends().then(res => this.missingSpendsList = res.data);
                        })
                });

            async function getAllSpends() {
                return await axios.get('spends');
            }

        }
    });

    let monthList = new Vue({
        el: '#month',
        template: '<div id="month"><month-list :monthList = "monthList" /></div>',
        data: {
            monthList: []
        }
    });

    async function getTotalAmounts(data) {
        let amountSalary = amountPrepaid = amountSalaryCash = amountSalaryCard = amountPrepaidCash = amountPrepaidCard = 0;

        for await(const item of data){
            amountSalaryCash = item.salary && item.cash ? amountSalaryCash + item.templateAmount : amountSalaryCash;
            amountSalaryCard = item.salary && !item.cash ? amountSalaryCard + item.templateAmount : amountSalaryCard;
            amountPrepaidCash = !item.salary && item.cash ? amountPrepaidCash + item.templateAmount : amountPrepaidCash;
            amountPrepaidCard = !item.salary && !item.cash ? amountPrepaidCard + item.templateAmount : amountPrepaidCard;
        }
        return await {
            amountSalaryCash: amountSalaryCash,
            amountSalaryCard: amountSalaryCard,
            amountPrepaidCash: amountPrepaidCash,
            amountPrepaidCard: amountPrepaidCard
        }
    }

    async function getMissingSpends(id) {
        return await axios.get('month/getMonthlyMissingSpends?monthlyDateId=' + id);
    }
}