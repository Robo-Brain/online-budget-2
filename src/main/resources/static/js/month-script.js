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
                spendId: '',
                missingSpendsList: [],
                dateId: '',
                templateAmount: '',
                newMonthAmount: null,
                isCash: '',
                isSalary: '',
                editMode: false,
                // deleteMode: true,
                monthlySpendsId: '',
                totalAmountSalaryCard: 0,
                totalAmountSalaryCash: 0,
                totalAmountPrepaidCard: 0,
                totalAmountPrepaidCash: 0,
                editingIndex: '',
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
                            + '<div class="name"> {{ month.spendName }}</div>'
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
            + '</div>',
        watch: {
            noticesMonthlySpendsId: {
                handler: function (val, oldVal) {},
                deep: true
            },
            localMonthList: {
                handler: function (val, oldVal) {},
                deep: true
            }
        },
        methods: {
            setMonthAmount: function(monthlySpendId) {
                this.monthlySpendsId = monthlySpendId;
                this.newMonthAmount = event.target.value;
                axios.put('month/saveMonthAmount?monthlySpendsId='
                    + this.monthlySpendsId
                    + "&amount="
                    + this.newMonthAmount)
                    .then(result => this.localMonthList = result.data)
            },
            editModeToggle: function() { // режим редактирования monthly_spend On/Off
                if (this.localMonthList.length > 0){
                    this.spendId = '';
                    this.showSpendInput = false;
                    this.templateAmount = '';
                    this.editMode = !this.editMode;
                    // this.deleteMode = true;
                }
            },
            setAmount: function(event, index, monthlySpendsId) { // установка новой суммы для spend в режиме редактирования monthly_spend
                this.editingIndex = index;
                this.templateAmount = event.target.value;
                this.monthlySpendsId = monthlySpendsId;
                // this.deleteMode = false;
            },
            salaryToggle: function (event, index, monthlySpendsId) { // изменение стиля кнопки salary <-> prepaid и установка значения в this.isSalary
                this.monthlySpendsId = monthlySpendsId;
                this.editingIndex = index;
                this.isSalary = event.target.className !== 'salary';
                event.target.className = this.isSalary ? 'salary' : 'prepaid';
                // this.deleteMode = false;
            },
            cashToggle: function (event, index, monthlySpendsId) { // изменение стиля кнопки cash <-> card и установка значения в this.isCash
                this.monthlySpendsId = monthlySpendsId;
                this.editingIndex = index;
                this.isCash = event.target.className !== 'cash';
                event.target.className = this.isCash ? 'cash' : 'card';
                // this.deleteMode = false;
            },
            saveSpendInMonth: function () {
                if (this.monthlySpendsId.length > 0){
                    axios.put('month/editMonthSpend?monthlySpendsId=' + this.monthlySpendsId
                        + '&amount=' + this.templateAmount
                        + '&isSalary=' + this.isSalary
                        + '&isCash=' + this.isCash
                    ).then(async result => {
                        if(result.data.length > 0) {
                            this.localMonthList = result.data;
                            await getTotalAmounts(result.data).then(amountsArr => {
                                this.totalAmountSalaryCash = amountsArr.amountSalaryCash;
                                this.totalAmountSalaryCard = amountsArr.amountSalaryCard;
                                this.totalAmountPrepaidCash = amountsArr.amountPrepaidCash;
                                this.totalAmountPrepaidCard = amountsArr.amountPrepaidCard;
                            });
                            this.spendId = this.templateAmount = this.isCash = this.isSalary = this.editingIndex = '';
                            // this.editMode = false;
                            // this.deleteMode = true;
                        }
                    });
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
                    console.log(result.data);
                    if (result.data.length === 0){ //если месяц "пустой"
                        this.editMode = true; // включить режим редактирования принудительно
                        await axios.get('dates/lastDate') // попробовать получить dateId
                            .then(result => {
                                this.date = result.data.date;
                                this.dateId = result.data.id
                            });
                        await axios.get('spends') // попробовать получить dateId
                            .then(result => {
                                this.missingSpendsList = result.data;
                            });
                    }
                    let d1 = new Date(result.data[0].date).getMonth();
                    let d2 = new Date().getMonth();
                    if (parseInt(d1,10) !== parseInt(d2,10)){
                        console.log('месяц НЕ совпадает');
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
                    // this.localMonthList = result.data;

                    // axios.get('notices')
                    //     .then(result => {
                    //         result.data.forEach(note => {
                    //             this.noticesMonthlySpendsId.push(note.monthlySpendId);//this.noticesMonthlySpendsId
                    //         });
                    //     });

                    await getTotalAmounts(result.data)
                        .then(amountsArr => {
                            this.totalAmountSalaryCash = amountsArr.amountSalaryCash;
                            this.totalAmountSalaryCard = amountsArr.amountSalaryCard;
                            this.totalAmountPrepaidCash = amountsArr.amountPrepaidCash;
                            this.totalAmountPrepaidCard = amountsArr.amountPrepaidCard;
                    });

                    await getMissingSpends(this.dateId)
                        .then(res => this.missingSpendsList = res.data);
                });
        }
    });

    let monthList = new Vue({
        el: '#month',
        template: '<div id="month"><month-list /></div>'
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