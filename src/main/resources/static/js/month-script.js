// *** SPENDS start *** //

function showLastMonth() {
    $('#month').show();
    $('#upper-menu-month').addClass('selected-menu-item');

    $('#templates-list').hide();
    $('#spends').hide();
    $('#allMonths').hide();
    $('#options').hide();

    $('#upper-menu-allMonths').removeClass('selected-menu-item');
    $('#upper-menu-spends').removeClass('selected-menu-item');
    $('#upper-menu-templates').removeClass('selected-menu-item');

    Vue.component('month-list', {
        data: function() {
            return {
                localMonthList: [],
                noticesMonthlySpendsId: [],
                // showNoMonthModal: false,
                showCreateNoticeModal: false,
                showNoticeModal: false,
                showCreateTemplateModal: false,
                showCreateMonthModal: false,
                showDeleteMonthModal: false,
                showPlusAmountMonthModal: false,
                showAmountHistoryModal: false,
                showPreviousMonthOverpaidModal: false,
                showTotalAmountModal: false,
                spendId: '',
                spendName: '',
                missingSpendsList: [],
                date: '',
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
                notices: [],
                deleting: false,
                fillCurrentMonth: false,
                previousMonthOverpaid: false,
                prop: {},
                colorScheme: ''
            }
        },
        template:
            '<div class="months" v-bind:class="[{ gray: colorScheme == \'gray\' }]">'
                + '<div v-if="localMonthList.length > 0" class="date">'
                    + '{{ localMonthList[0].date}}'
                    + '<span class="overpaid-icon" @click="showPreviousMonthOverpaidModal = true" v-if="previousMonthOverpaid"> </span>'
                + '</div>'
                + '<div v-if="localMonthList.length < 1">'
                    + '<div v-if="date.length > 0" class="date">{{ date}}</div>'
                    + '<br />Список пуст, добавь статьи расходов вручную, <a href="#" @click="createMonthModal(true)">заполни по шаблону или предыдущему месяцу</a>'
                + '</div>'
                + '<div v-if="!editMode && localMonthList.length > 0" class="month-item" :key="month.id" v-for="(month, index, key) in localMonthList" '
                    + 'v-bind:class="{ notInTotal: prop.highlight_unsum && itemsContains(month.templateId) }" >'
                    // + '<div v-if="itemsContains(month.templateId)">ITSALIVE</div>'
                    + '<div class="name-notices-block">'
                        + '<div @click="showAmountHistory(month.monthlySpendsId, month.spendName)" class="name"> {{ month.spendName }} </div>'
                        + '<button v-if="hasNotice(month.monthlySpendsId)" @click="getNoticesAndShowNoticeModal(month.monthlySpendsId)" class="month-notices-show-button" > </button>'
                    + '</div>'
                    + '<div class="deposited" v-bind:class="{ lack: month.monthAmount <  month.templateAmount }">'
                        + '<input type="number" ref="amount" v-on:keyup="setMonthAmount($event, month.monthlySpendsId, index)" @input="setMonthAmount($event, month.monthlySpendsId, index)" :value="month.monthAmount > 0 ? month.monthAmount : \'\'" />'
                        + '<button @click="showPlusAmountMonthModalFunc(index, month.monthlySpendsId)" class="plus-button"> </button>'
                        + '<br/><span class="month-amount">{{ month.templateAmount }}</span>'
                    + '</div>'
                    + '<div class="buttons">'
                        + '<button v-bind:class="[ month.salary ? \'salary\' : \'prepaid\' ]"> </button>'
                        + '<button v-bind:class="[ month.cash ? \'cash\' : \'card\' ]"> </button>'
                    + '</div>'
                    + '<div class="sub-edit-block">'
                        + '<button @click="toggleNoticeModal(month.monthlySpendsId)" class="notice"> </button>'
                    + '</div>'
                    + '<plusAmountMonthModal v-if="showPlusAmountMonthModal && plusIndex == index" :monthlySpendsId="monthlySpendsId" :templateAmount="month.templateAmount" />'
                + '</div>'

                + '<div v-if="editMode" class="month-item" :key="month.id" v-for="(month, index, key) in localMonthList" >'
                    + '<div class="name">'
                        + ' {{ month.spendName }}'
                    + '</div>'
                    + '<div class="deposited" v-bind:class="{ edit: editMode }">'
                        + '<input type="number" v-model="month.templateAmount" @input="setAmount($event, index, month.monthlySpendsId)" />'
                    + '</div>'
                    + '<div class="salary-cash-select">'
                        + '<select class="salary-prepaid-form" @change="salaryToggle($event, index, month.monthlySpendsId)">'
                            + '<option value="salary" :selected="month.salary">ЗП</option>'
                            + '<option value="prepaid" :selected="!month.salary">Аванс</option>'
                        + '</select>'
                        + '<br />'
                        + '<select class="cash-card-form" @change="cashToggle($event, index, month.monthlySpendsId)">'
                            + '<option value="cash" :selected="month.cash">Нал</option>'
                            + '<option value="card" :selected="!month.cash">Безнал</option>'
                        + '</select>'
                    + '</div>'
                    + '<div class="sub-edit-block">'
                        + '<button v-if="editingIndex == index && !deleting" class="save" @click="saveSpendInMonth()"> </button>'
                        + '<button v-else-if="editingIndex != index" class="delete" @click="delMonthSpend(month.monthlySpendsId, index)"> </button>'
                        + '<span class="monthly-spend-delete-warning" v-if="deleting && editingIndex == index" >при повторном нажатии ✖ БУДЕТ УДАЛЕНО!</span>'
                        + '<button v-if="deleting && editingIndex == index" class="delete min" @click="delMonthSpend(month.monthlySpendsId, index)"> </button>'
                    + '</div>'
                + '</div>'

                + '<div @click="showTotalAmountModal = true" v-if="!editMode" class="total-amount" >'
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
                + '<div class="submenu-buttons" v-bind:class="[{ gray: colorScheme == \'gray\' }]">'
                    + '<button v-show="!editMode" title="Создать следующий месяц по текущему месяцу" class="create-month-button" @click="createMonthModal(false)"> </button>'
                    + '<button v-show="!editMode" title="Создать шаблон по текущему месяцу" class="create-template-button" @click="showCreateTemplateModal = true"> </button>'
                    + '<button v-show="editMode && localMonthList.length > 0" title="Удалить текущий месяц" class="delete-month-button" @click="showDeleteMonthModal = true"> </button>'
                    + '<button v-show="localMonthList.length > 0" title="Редактировать" class="edit-button" v-bind:class="{ true: editMode }" @click="editModeToggle()"> </button>'
                + '</div>'
                + '<previousMonthOverpaidModal v-if="showPreviousMonthOverpaidModal" :dateId="dateId" />' //'<span v-if="previousMonthOverpaid">В предыдущем месяце переплаты бла бла <button @click="transfer()">transfer</button></span>'
                // + '<noMonthModal v-if="showNoMonthModal" />'
                + '<createMonthModal v-if="showCreateMonthModal" :dateId="dateId" :fillCurrentMonth="fillCurrentMonth" />'
                + '<createTemplateModal v-if="showCreateTemplateModal" :dateId="dateId" />'
                + '<createNoticeModal v-if="showCreateNoticeModal" :monthlySpendsId="monthlySpendsId" />'
                + '<noticeModal v-if="showNoticeModal" :notices="notices" />'
                + '<deleteMonthModal v-if="showDeleteMonthModal" :dateId="dateId" />'
                + '<amountHistoryModal v-if="showAmountHistoryModal" :monthlySpendsId="monthlySpendsId" :spendName="spendName" />'
                + '<totalAmountModal v-if="showTotalAmountModal" :localMonthList="localMonthList" :prop="prop" />'
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
                        if (this.prop.templates_ignore && !this.prop.templates_ignore.includes(item.templateId)){
                            this.totals.totalAmountSalaryCash = item.salary && item.cash ? this.totals.totalAmountSalaryCash + item.templateAmount : this.totals.totalAmountSalaryCash;
                            this.totals.totalAmountSalaryCard = item.salary && !item.cash ? this.totals.totalAmountSalaryCard + item.templateAmount : this.totals.totalAmountSalaryCard;
                            this.totals.totalAmountPrepaidCash = !item.salary && item.cash ? this.totals.totalAmountPrepaidCash + item.templateAmount : this.totals.totalAmountPrepaidCash;
                            this.totals.totalAmountPrepaidCard = !item.salary && !item.cash ? this.totals.totalAmountPrepaidCard + item.templateAmount : this.totals.totalAmountPrepaidCard;

                            this.totals.depositSalaryCash = item.salary && item.cash ? this.totals.depositSalaryCash + item.monthAmount : this.totals.depositSalaryCash;
                            this.totals.depositSalaryCard = item.salary && !item.cash ? this.totals.depositSalaryCard + item.monthAmount : this.totals.depositSalaryCard;
                            this.totals.depositPrepaidCash = !item.salary && item.cash ? this.totals.depositPrepaidCash + item.monthAmount : this.totals.depositPrepaidCash;
                            this.totals.depositPrepaidCard = !item.salary && !item.cash ? this.totals.depositPrepaidCard + item.monthAmount : this.totals.depositPrepaidCard;
                        }
                    }
                },
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
            },
            prop: {
                handler: function (val, oldVal) {
                    this.totals.totalAmountSalaryCash = this.totals.totalAmountSalaryCard = this.totals.totalAmountPrepaidCash = this.totals.totalAmountPrepaidCard = null;
                    this.totals.depositSalaryCard = this.totals.depositSalaryCash = this.totals.depositPrepaidCard = this.totals.depositPrepaidCash = null;
                    for (const item of this.localMonthList){
                        if (this.prop.templates_ignore && !this.prop.templates_ignore.includes(item.templateId)){
                            this.totals.totalAmountSalaryCash = item.salary && item.cash ? this.totals.totalAmountSalaryCash + item.templateAmount : this.totals.totalAmountSalaryCash;
                            this.totals.totalAmountSalaryCard = item.salary && !item.cash ? this.totals.totalAmountSalaryCard + item.templateAmount : this.totals.totalAmountSalaryCard;
                            this.totals.totalAmountPrepaidCash = !item.salary && item.cash ? this.totals.totalAmountPrepaidCash + item.templateAmount : this.totals.totalAmountPrepaidCash;
                            this.totals.totalAmountPrepaidCard = !item.salary && !item.cash ? this.totals.totalAmountPrepaidCard + item.templateAmount : this.totals.totalAmountPrepaidCard;

                            this.totals.depositSalaryCash = item.salary && item.cash ? this.totals.depositSalaryCash + item.monthAmount : this.totals.depositSalaryCash;
                            this.totals.depositSalaryCard = item.salary && !item.cash ? this.totals.depositSalaryCard + item.monthAmount : this.totals.depositSalaryCard;
                            this.totals.depositPrepaidCash = !item.salary && item.cash ? this.totals.depositPrepaidCash + item.monthAmount : this.totals.depositPrepaidCash;
                            this.totals.depositPrepaidCard = !item.salary && !item.cash ? this.totals.depositPrepaidCard + item.monthAmount : this.totals.depositPrepaidCard;
                        }
                    }
                },
                deep: true
            }
        },
        methods: {
            itemsContains: function(templateId) {
                if (this.prop.templates_ignore && this.prop.templates_ignore.length > 0){
                    return this.prop.templates_ignore.indexOf(templateId) > -1
                } else return false
            },
            createMonthModal: function(isCurrentMonth) {
                if (isCurrentMonth) {
                    this.fillCurrentMonth = true;
                }
                this.showCreateMonthModal = true;
            },
            showAmountHistory: function(monthlySpendsId, spendName) {
                this.spendName = spendName;
                this.monthlySpendsId = monthlySpendsId;
                this.showAmountHistoryModal = true;
            },
            setMonthAmount: function(event, monthlySpendId, ind) {
                this.monthlySpendsId = monthlySpendId;
                this.newMonthAmount = event.target.value;
                let tmpVal = event.target.value;
                let self = this;
                setTimeout(function(){
                    if(tmpVal === self.newMonthAmount) {
                        axios.put('month/saveMonthAmount?monthlySpendsId='
                            + self.monthlySpendsId
                            + "&amount="
                            + self.newMonthAmount)
                            .then(result => self.localMonthList = result.data);
                    }
                }, 1500);
                if (event.keyCode === 13){
                    this.$nextTick(() => {
                        let index = ind + 1;
                        this.$refs.amount[index].focus();
                    });
                }
            },
            editModeToggle: function() { // режим редактирования monthly_spend On/Off
                if (this.localMonthList.length > 0){
                    this.spendId = '';
                    this.showSpendInput = false;
                    this.templateAmount = '';
                    this.editMode = !this.editMode;
                    this.deleting = false;
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
                this.isSalary = event.target.value === 'salary';
            },
            cashToggle: function (event, index, monthlySpendsId) { // изменение стиля кнопки cash <-> card и установка значения в this.isCash
                this.monthlySpendsId = monthlySpendsId;
                this.editingIndex = index;
                this.isCash = event.target.value === 'cash';
            },
            saveSpendInMonth: function () {
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
            delMonthSpend: function (monthlySpendsId, index) {
                if(this.deleting && this.editingIndex === index){
                    axios.delete('month/deleteSpendFromMonth?monthId=' + monthlySpendsId).then(async result => {
                        await getMissingSpends(result.data[0].dateId).then(res => {
                            this.missingSpendsList = res.data;
                        });
                        this.localMonthList = result.data;
                    });
                    this.deleting = false;
                    this.editingIndex = null;
                } else {
                    this.deleting = true;
                    this.editingIndex = index;
                }
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
                                console.log(this.date);
                                this.dateId = result.data.id;
                            });
                        await axios.get('spends')
                            .then(result => {
                                this.missingSpendsList = result.data;
                            });
                    } else {
                        this.dateId = result.data[0].dateId;
                        result.data.forEach(month => {
                            this.localMonthList.push(month);
                            if (month.noticesList.length > 0){
                                this.noticesMonthlySpendsId.push(month.monthlySpendsId)
                            }
                        });
                    }
                    // let lastDBDate = new Date(result.data[0].date);
                    // let curDate = new Date();
                    // if (parseInt(lastDBDate.getMonth(),10)
                    //     <
                    //     parseInt(curDate.getMonth(),10)){
                    //         this.showNoMonthModal = true;
                    // } else if(parseInt(lastDBDate.getFullYear(),10)
                    //     <
                    //     parseInt(curDate.getFullYear(),10)) {
                    //         this.showNoMonthModal = true;
                    // }

                    await getMissingSpends(this.dateId)
                        .then(res => this.missingSpendsList = res.data);
                });

            axios.get('month/getPreviousMonthOverpayment' ).then(() => {
                this.previousMonthOverpaid = true;
            });

            axios.get('options').then(result => {
                this.prop = result.data.properties;
                window.options = result.data;
                try{
                    this.prop = JSON.parse(result.data.properties);
                } catch (e) {
                    console.log('already object \'created\'');
                }

                this.colorScheme = this.prop.color_scheme;

                this.totals.totalAmountSalaryCash = this.totals.totalAmountSalaryCard = this.totals.totalAmountPrepaidCash = this.totals.totalAmountPrepaidCard = null;
                this.totals.depositSalaryCard = this.totals.depositSalaryCash = this.totals.depositPrepaidCard = this.totals.depositPrepaidCash = null;
                for (const item of this.localMonthList){
                    if (this.prop.templates_ignore && !this.prop.templates_ignore.includes(item.templateId)){
                        this.totals.totalAmountSalaryCash = item.salary && item.cash ? this.totals.totalAmountSalaryCash + item.templateAmount : this.totals.totalAmountSalaryCash;
                        this.totals.totalAmountSalaryCard = item.salary && !item.cash ? this.totals.totalAmountSalaryCard + item.templateAmount : this.totals.totalAmountSalaryCard;
                        this.totals.totalAmountPrepaidCash = !item.salary && item.cash ? this.totals.totalAmountPrepaidCash + item.templateAmount : this.totals.totalAmountPrepaidCash;
                        this.totals.totalAmountPrepaidCard = !item.salary && !item.cash ? this.totals.totalAmountPrepaidCard + item.templateAmount : this.totals.totalAmountPrepaidCard;

                        this.totals.depositSalaryCash = item.salary && item.cash ? this.totals.depositSalaryCash + item.monthAmount : this.totals.depositSalaryCash;
                        this.totals.depositSalaryCard = item.salary && !item.cash ? this.totals.depositSalaryCard + item.monthAmount : this.totals.depositSalaryCard;
                        this.totals.depositPrepaidCash = !item.salary && item.cash ? this.totals.depositPrepaidCash + item.monthAmount : this.totals.depositPrepaidCash;
                        this.totals.depositPrepaidCard = !item.salary && !item.cash ? this.totals.depositPrepaidCard + item.monthAmount : this.totals.depositPrepaidCard;
                    }
                }
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