// *** SPENDS start *** //

function showLastMonth() {

    $('#month').show();
    $('#spends').hide();
    $('#templates-list').hide();
    $('#allMonths').hide();

    Vue.component('month-list', {
        data: function() {
            return {
                localMonthList: [],
                noticesMonthlySpendsId: [],
                date: '',
                showNoMonthModal: false,
                showCreateNoticeModal: false,
                showNoticeModal: false,
                showCreateTemplateModal: false,
                showCreateMonthModal: false,
                showDeleteMonthModal: false,
                showPlusAmountMonthModal: false,
                showAmountHistoryModal: false,
                spendId: '',
                missingSpendsList: [],
                dateId: '',
                templateAmount: '',
                newMonthAmount: null,
                isCash: '',
                isSalary: '',
                editMode: false,
                monthlySpendsId: '',
                totals: {
                    totalAmountSalaryCard: 0, totalAmountSalaryCash: 0, totalAmountPrepaidCard: 0, totalAmountPrepaidCash: 0,
                    depositSalaryCard: 0, depositSalaryCash: 0, depositPrepaidCard: 0, depositPrepaidCash: 0
                },
                editingIndex: null,
                plusIndex: null,
                notices: []
            }
        },
        template:
            '<div class="months">'
                + '<div class="date">{{ date }}</div>'
                + '<div v-if="localMonthList.length < 1">'
                    + 'Список пуст, добавь статьи расходов вручную, <a href="#" @click="showNoMonthModal = true">заполни по активному шаблону по предыдущему месяцу</a>'
                + '</div>'
                + '<div v-if="!editMode && localMonthList.length > 0" class="month-item" v-for="(month, index, key) in localMonthList" >'
                        + '<div class="name-notices-block">'
                            + '<div @click="showAmountHistory(month.monthlySpendsId)" class="name"> {{ month.spendName }} </div>'
                            + '<button v-if="hasNotice(month.monthlySpendsId)" @click="getNoticesAndShowNoticeModal(month.monthlySpendsId)" class="month-notices-show-button" > </button>'
                        + '</div>'
                        + '<div class="deposited" v-bind:class="{ lack: month.monthAmount <  month.templateAmount }">'
                            + '<input @input="setMonthAmount(month.monthlySpendsId)" :value="month.monthAmount > 0 ? month.monthAmount : \'\'" />'
                            + '/<span class="month-amount">{{ month.templateAmount }}</span>'
                            + '<button @click="showPlusAmountMonthModalFunc(index, month.monthlySpendsId)" class="plus-button"> </button>'
                            + '<plusAmountMonthModal v-if="showPlusAmountMonthModal && plusIndex == index" :monthlySpendsId="monthlySpendsId" />'
                        + '</div>'
                        + '<div class="buttons">'
                            + '<button v-bind:class="[ month.salary ? \'salary\' : \'prepaid\' ]"> </button>'
                            + '<button v-bind:class="[ month.cash ? \'cash\' : \'card\' ]"> </button>'
                            + '<button @click="toggleNoticeModal(month.monthlySpendsId)" class="notice"> </button>'
                        + '</div>'
                + '</div>'
                + '<div v-if="editMode" class="month-item" v-for="(month, index, key) in localMonthList" >'
                    + '<div class="name">'
                        + ' {{ month.spendName }}'
                    + '</div>'
                    + '<div class="deposited" v-bind:class="{ edit: editMode }">'
                        + '<input v-model="month.templateAmount" @input="setAmount($event, index, month.monthlySpendsId)" />'
                    + '</div>'
                    + '<div class="buttons" v-bind:class="{ edit: editMode }">'
                        + '<button @click="salaryToggle($event, index, month.monthlySpendsId)" v-bind:class="[ month.salary ? \'salary\' : \'prepaid\' ]"> </button>'
                        + '<button @click="cashToggle($event, index, month.monthlySpendsId)" v-bind:class="[ month.cash ? \'cash\' : \'card\' ]"> </button>'
                        + '<button v-if="editingIndex == index" class="save" @click="saveSpendInMonth()">✓</button>'
                        + '<button v-else-if="editingIndex != index" class="delete" @click="delMonthSpend(month.monthlySpendsId)">X</button>'
                    + '</div>'
                + '</div>'
                + '<div v-if="!editMode" class="total-amount">'
                    + '<div class="salary-block">'
                        + '<div class="salary-total">'
                            + 'ЗП: '
                                + '{{ totals.totalAmountSalaryCash + totals.totalAmountSalaryCard - totals.depositSalaryCard - totals.depositSalaryCash }} '
                                + '({{ totals.totalAmountSalaryCash + totals.totalAmountSalaryCard }})'
                                + '<span>{</span>'
                        + '</div>'
                        + '<div class="cash-total">'
                            + '<button class="cash"> </button> {{ totals.totalAmountSalaryCash - totals.depositSalaryCash }} ({{ totals.totalAmountSalaryCash }})'
                        + '</div>'
                        + '<div class="card-total">'
                            + '<button class="card"> </button> {{ totals.totalAmountSalaryCard - totals.depositSalaryCard }} ({{ totals.totalAmountSalaryCard }})'
                        + '</div>'
                    + '</div>'
                    + '<div class="prepaid-block">'
                        + '<div class="prepaid-total">'
                            + 'Аванс: '
                                + '{{ totals.totalAmountPrepaidCash + totals.totalAmountPrepaidCard - totals.depositPrepaidCard - totals.depositPrepaidCash }} '
                                + '({{ totals.totalAmountPrepaidCash + totals.totalAmountPrepaidCard }})'
                                + '<span>{</span>'
                        + '</div>'
                        + '<div class="cash-total">'
                            + '<button class="cash"> </button> {{ totals.totalAmountPrepaidCash - totals.depositPrepaidCash }} ({{ totals.totalAmountPrepaidCash }})'
                        + '</div>'
                        + '<div class="card-total">'
                            + '<button class="card"> </button> {{ totals.totalAmountPrepaidCard - totals.depositPrepaidCard }} ({{ totals.totalAmountPrepaidCard }})'
                        + '</div>'
                    + '</div>'
                + '</div>'
                + '<select class="add-new-spend" v-else-if="editMode" v-model="spendId" @change="pushSpendToMonth()" >'
                    + '<option v-for="spend in missingSpendsList" v-bind:value="spend.id">'
                        + '{{ spend.name }}'
                    + '</option>'
                + '</select>'
                + '<div class="submenu-buttons">'
                    + '<button v-show="!editMode" title="Создать следующий месяц по текущему месяцу" class="create-month-button" @click="showCreateMonthModal = true"> </button>'
                    + '<button v-show="!editMode" title="Создать шаблон по текущему месяцу" class="create-template-button" @click="showCreateTemplateModal = true"> </button>'
                    + '<button v-show="editMode && localMonthList.length > 0" title="Удалить текущий месяц" class="delete-month-button" @click="showDeleteMonthModal = true"> </button>'
                    + '<button v-show="localMonthList.length > 0" title="Редактировать" class="edit-button" v-bind:class="{ true: editMode }" @click="editModeToggle()"> </button>'
                + '</div>'
                + '<noMonthModal v-if="showNoMonthModal" />'
                + '<createMonthModal v-if="showCreateMonthModal" :dateId="dateId" />'
                + '<createTemplateModal v-if="showCreateTemplateModal" :dateId="dateId" />'
                + '<createNoticeModal v-if="showCreateNoticeModal" :monthlySpendsId="monthlySpendsId" />'
                + '<noticeModal v-if="showNoticeModal" :notices="notices" />'
                + '<deleteMonthModal v-if="showDeleteMonthModal" :dateId="dateId" />'
                + '<amountHistoryModal v-if="showAmountHistoryModal" :monthlySpendsId="monthlySpendsId" />'
            + '</div>',
        watch: {
            noticesMonthlySpendsId: {
                handler: function (val, oldVal) {},
                deep: true
            },
            localMonthList: {
                handler: function (val, oldVal) {
                    this.totals.totalAmountSalaryCash = this.totals.totalAmountSalaryCard = this.totals.totalAmountPrepaidCash = this.totals.totalAmountPrepaidCard = null;
                    this.totals.depositSalaryCard = this.totals.depositSalaryCash = this.totals.depositPrepaidCard = this.totals.depositPrepaidCash = null;
                    for (const item of this.localMonthList){
                        this.totals.totalAmountSalaryCash = item.salary && item.cash ? this.totals.totalAmountSalaryCash + item.templateAmount : this.totals.totalAmountSalaryCash;
                        this.totals.totalAmountSalaryCard = item.salary && !item.cash ? this.totals.totalAmountSalaryCard + item.templateAmount : this.totals.totalAmountSalaryCard;
                        this.totals.totalAmountPrepaidCash = !item.salary && item.cash ? this.totals.totalAmountPrepaidCash + item.templateAmount : this.totals.totalAmountPrepaidCash;
                        this.totals.totalAmountPrepaidCard = !item.salary && !item.cash ? this.totals.totalAmountPrepaidCard + item.templateAmount : this.totals.totalAmountPrepaidCard;

                        this.totals.depositSalaryCash = item.salary && item.cash ? this.totals.depositSalaryCash + item.monthAmount : this.totals.depositSalaryCash;
                        this.totals.depositSalaryCard = item.salary && !item.cash ? this.totals.depositSalaryCard + item.monthAmount : this.totals.depositSalaryCard;
                        this.totals.depositPrepaidCash = !item.salary && item.cash ? this.totals.depositPrepaidCash + item.monthAmount : this.totals.depositPrepaidCash;
                        this.totals.depositPrepaidCard = !item.salary && !item.cash ? this.totals.depositPrepaidCard + item.monthAmount : this.totals.depositPrepaidCard;
                    }
                },
                deep: true
            },
            date: {
                handler: function (val, oldVal) {},
                deep: true
            },
            totalAmountSalaryCash: {
                handler: function (val, oldVal) {},
                deep: true
            },
            totalAmountSalaryCard: {
                handler: function (val, oldVal) {},
                deep: true
            },
            totalAmountPrepaidCash: {
                handler: function (val, oldVal) {},
                deep: true
            },
            totalAmountPrepaidCard: {
                handler: function (val, oldVal) {},
                deep: true
            }
        },
        methods: {
            showAmountHistory: function(monthlySpendsId) {
                this.monthlySpendsId = monthlySpendsId;
                this.showAmountHistoryModal = true;
            },
            setMonthAmount: function(monthlySpendId) {
                this.monthlySpendsId = monthlySpendId;
                this.newMonthAmount = event.target.value; // не понимаю как это работает, но работает
                let tmpVal = event.target.value;
                let self = this;
                setTimeout(function(){
                    if(tmpVal === self.newMonthAmount) {
                        axios.put('month/saveMonthAmount?monthlySpendsId='
                            + self.monthlySpendsId
                            + "&amount="
                            + self.newMonthAmount)
                            .then(result => self.localMonthList = result.data); console.log('updated ' + self.newMonthAmount)
                    }
                }, 800);
            },
            editModeToggle: function() { // режим редактирования monthly_spend On/Off
                if (this.localMonthList.length > 0){
                    this.spendId = '';
                    this.showSpendInput = false;
                    this.templateAmount = '';
                    this.editMode = !this.editMode;
                }
            },
            setAmount: function(event, index, monthlySpendsId) { // установка новой суммы для spend в режиме редактирования monthly_spend
                this.editingIndex = index;
                this.templateAmount = event.target.value;
                this.monthlySpendsId = monthlySpendsId;
            },
            salaryToggle: function (event, index, monthlySpendsId) { // изменение стиля кнопки salary <-> prepaid и установка значения в this.isSalary
                this.monthlySpendsId = monthlySpendsId;
                this.editingIndex = index;
                this.isSalary = event.target.className !== 'salary';
                event.target.className = this.isSalary ? 'salary' : 'prepaid';
            },
            cashToggle: function (event, index, monthlySpendsId) { // изменение стиля кнопки cash <-> card и установка значения в this.isCash
                this.monthlySpendsId = monthlySpendsId;
                this.editingIndex = index;
                this.isCash = event.target.className !== 'cash';
                event.target.className = this.isCash ? 'cash' : 'card';
            },
            saveSpendInMonth: function () {
                console.log(this.monthlySpendsId);
                if (this.monthlySpendsId > 0){
                    axios.put('month/editMonthSpend?monthlySpendsId=' + this.monthlySpendsId
                        + '&amount=' + this.templateAmount
                        + '&isSalary=' + this.isSalary
                        + '&isCash=' + this.isCash
                    ).then(async result => {
                        if(result.data.length > 0) {
                            this.localMonthList = result.data;
                            this.spendId = this.templateAmount = this.isCash = this.isSalary = '';
                            this.editingIndex = null;
                        }
                    });
                } else {
                    console.log("monthlySpendsId.length < 0 ??");
                }
            },
            pushSpendToMonth: function () {
                axios.put('month/pushSpendToMonth?spendId=' + this.spendId + '&dateId=' + this.dateId)
                        .then(async result => {
                            if (result.data.length > 0) {
                                this.date = result.data[0].date;
                                this.dateId = result.data[0].dateId;

                                this.localMonthList = result.data;
                                await getMissingSpends(this.dateId).then(res => {
                                    this.missingSpendsList = res.data;
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
                    this.localMonthList = result.data;
                });
            },
            async getNoticesAndShowNoticeModal(monthlySpendId) {
                await axios.get('notices/getByMonthlySpendsId/' + monthlySpendId).then(result => {
                    this.notices = result.data;
                    this.showNoticeModal = true;
                });
            },
            toggleNoticeModal: function (monthlySpendId) {
                this.monthlySpendsId = monthlySpendId;
                this.showCreateNoticeModal = true;
            },
            hasNotice: function(monthlySpendId) {
                return this.noticesMonthlySpendsId.includes(monthlySpendId);
            },
            showPlusAmountMonthModalFunc : function (index, monthlySpendId) {
                this.plusIndex = index;
                this.monthlySpendsId = monthlySpendId;
                this.showPlusAmountMonthModal = !this.showPlusAmountMonthModal;
            }
        },
        created: function () {
            axios.get('month')
                .then(async result => {// получить текущий месяц
                    // console.log(result.data);
                    if (result.data.length === 0){ //если месяц "пустой"
                        this.editMode = true; // включить режим редактирования принудительно
                        await axios.get('dates/lastDate') // попробовать получить dateId
                            .then(result => {
                                this.date = result.data.date;
                                this.dateId = result.data.id
                            });
                        await axios.get('spends')
                            .then(result => {
                                this.missingSpendsList = result.data;
                            });
                    }
                    let lastDBDate = new Date(result.data[0].date);
                    let curDate = new Date();
                    if (parseInt(lastDBDate.getMonth(),10)
                        <
                        parseInt(curDate.getMonth(),10)){
                            this.showNoMonthModal = true;
                    } else if(parseInt(lastDBDate.getFullYear(),10)
                        <
                        parseInt(curDate.getFullYear(),10)) {
                            this.showNoMonthModal = true;
                    }

                    this.date = result.data[0].date;
                    this.dateId = result.data[0].dateId;
                    result.data.forEach(month => {
                        this.localMonthList.push(month);
                        if (month.noticesList.length > 0){
                            this.noticesMonthlySpendsId.push(month.monthlySpendsId)
                        }
                    });

                    this.totals.totalAmountSalaryCash = this.totals.totalAmountSalaryCard = this.totals.totalAmountPrepaidCash = this.totals.totalAmountPrepaidCard = null;
                    this.totals.depositSalaryCard = this.totals.depositSalaryCash = this.totals.depositPrepaidCard = this.totals.depositPrepaidCash = null;
                    for (const item of this.localMonthList){
                        this.totals.totalAmountSalaryCash = item.salary && item.cash ? this.totals.totalAmountSalaryCash + item.templateAmount : this.totals.totalAmountSalaryCash;
                        this.totals.totalAmountSalaryCard = item.salary && !item.cash ? this.totals.totalAmountSalaryCard + item.templateAmount : this.totals.totalAmountSalaryCard;
                        this.totals.totalAmountPrepaidCash = !item.salary && item.cash ? this.totals.totalAmountPrepaidCash + item.templateAmount : this.totals.totalAmountPrepaidCash;
                        this.totals.totalAmountPrepaidCard = !item.salary && !item.cash ? this.totals.totalAmountPrepaidCard + item.templateAmount : this.totals.totalAmountPrepaidCard;

                        this.totals.depositSalaryCash = item.salary && item.cash ? this.totals.depositSalaryCash + item.monthAmount : this.totals.depositSalaryCash;
                        this.totals.depositSalaryCard = item.salary && !item.cash ? this.totals.depositSalaryCard + item.monthAmount : this.totals.depositSalaryCard;
                        this.totals.depositPrepaidCash = !item.salary && item.cash ? this.totals.depositPrepaidCash + item.monthAmount : this.totals.depositPrepaidCash;
                        this.totals.depositPrepaidCard = !item.salary && !item.cash ? this.totals.depositPrepaidCard + item.monthAmount : this.totals.depositPrepaidCard;
                    }
                    await getMissingSpends(this.dateId)
                        .then(res => this.missingSpendsList = res.data);
                });
        }
    });

    let monthList = new Vue({
        el: '#month',
        template: '<div id="month"><month-list /></div>'
    });

    async function getMissingSpends(id) {
        return await axios.get('month/getMonthlyMissingSpends?monthlyDateId=' + id);
    }

}