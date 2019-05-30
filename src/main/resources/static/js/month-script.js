// *** SPENDS start *** //

function showLastMonth() {

    $('#month').show();
    $('#spends').hide();
    $('#templates-list').hide();
    $('#allMonths').hide();

    Vue.component('modal', {
        template:
        '<div v-if="this.$parent.showModal == true && (enabledTemplatesHasFound || previousMonthHasFound)" id="modal-template">'
            + '<div class="modal-mask"><div class="modal-wrapper"><div class="modal-container">'
                + '<div class="modal-header">'
                    + '<slot name="header">Внимание, текущий месяц не найден!</slot>'
                + '</div>'
                + '<div class="modal-body">'
                    + '<slot name="body">Создай новый месяц по активному шаблону или по предыдущему месяцу.</slot>'
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
                newMonthAmount: '',
                showModal: false,
                spendId: '',
                missingSpendsList: ['one', 'two', 'three'],
                dateId: '',
                showSpendInput: false,
                templateAmount: '',
                isCash: '',
                isSalary: '',
                editMode: false
            }
        },
        template:
            '<div><table class="months">'
                + '<tr><td class="monthDate" colspan="4"> {{ date }} </td></tr>'
                + '<button v-if="date" @click="editModeToggle()">Edit</button><tr class="head">'
                    + '<td>Название:</td>'
                    + '<td>Внесено:</td>'
                    + '<td>??:</td>'
                    + '<td>??:</td>'
                + '</tr>'
                + '<tr v-if="!editMode"class="month-item" v-for="(month, index, key) in monthList" >'
                        + '<td class="name"> {{ month.spendName }}</td>'
                        + '<td class="deposited">'
                            + '<input @input="editMonthAmount($event)" @change="editMonthAmount($event)" :id="month.monthlySpendsId" class="monthAmountInput" :value="month.monthAmount" />'
                            + ' / {{ month.templateAmount }}'
                        + '</td>'
                        + '<td><button v-bind:class="[ month.salaryOrPrepaid ? \'salary\' : \'prepaid\' ]"> </button></td>'
                        + '<td><button v-bind:class="[ month.cashOrCard ? \'cash\' : \'card\' ]"> </button></td>'
                + '</tr>'
                + '<tr v-if="editMode" class="month-item" v-for="(month, index, key) in monthList" >'
                    + '<td class="name"> {{ month.spendName }}</td>'
                    + '<td class="deposited"> / <input :id="month.monthlySpendsId" :value="month.templateAmount" @input="setAmount($event)" /></td>'
                    + '<td><button @click="salaryToggle($event)" v-bind:class="[ month.salaryOrPrepaid ? \'salary\' : \'prepaid\' ]"> </button></td>'
                    + '<td><button @click="cashToggle($event)" v-bind:class="[ month.cashOrCard ? \'cash\' : \'card\' ]"> </button></td>'
                    + '<td><button @click="delMonthSpend($event)" :id="month.monthlySpendsId">X</button></td>'
                + '</tr>'
            + '</table>'
                + '<select v-if="!editMode" @change="toggleShowSpendInput()" v-model="spendId" >'
                    + '<option v-for="spend in missingSpendsList" v-bind:value="spend.id">'
                        + '{{ spend.name }}'
                    + '</option>'
                + '</select>'
                + '<span v-if="!editMode & showSpendInput" class="spend-input">'
                    + 'Сумма: <input v-model="templateAmount" />'
                    + '&nbsp;<button v-bind:class="[ isSalary ? \'salary\' : \'prepaid\' ]" @click="salaryToggle($event)"> </button>'
                    + '&nbsp;<button v-bind:class="[ isCash ? \'cash\' : \'card\' ]" @click="cashToggle($event)"> </button>'
                    + '&nbsp;<button v-if="templateAmount.length > 2" @click="pushSpendToTemplate()">Add</button>'
                + '</span>'
            + '<modal /></div>',
        methods: {
            editModeToggle: function() { // режим редактирования monthly_spend On/Off
                this.spendId = '';
                this.showSpendInput = false;
                this.templateAmount = '';
                this.editMode = !this.editMode
            },
            toggleShowSpendInput: function() { // форма добавления нового spend в monthly_spends On/Off
                this.showSpendInput = true;
                this.isCash = false;
                this.isSalary = false;
            },
            setAmount: function(event) { // установка новой суммы для spend в режиме редактирования monthly_spend
                this.newMonthAmount = event.target.value;
                let monthlySpendsId = event.target.id;
                console.log('this.newMonthAmount = ' + this.newMonthAmount);
                console.log('monthlySpendsId = ' + monthlySpendsId)
            },
            editTemplateAmount: function(event) {
                this.templateAmount = event.target.value;
                let monthlySpendsId = event.target.id;
            },
            salaryToggle: function (event) {
                this.isSalary = !this.isSalary;
                if (event.target.className == 'salary') {
                    event.target.className = 'prepaid';
                } else {
                    event.target.className = 'salary';
                }
            },
            cashToggle: function (event) {
                this.isCash = !this.isCash;
                if (event.target.className == 'cash') {
                    event.target.className = 'card';
                } else if(event.target.className == 'card') {
                    event.target.className = 'cash';
                }
            },
            pushSpendToTemplate: function () {
                let tmpMonthList = [];
                let tempSpendList = [];
                const params = new URLSearchParams();
                params.append('dateId', this.dateId);
                params.append('spendId', this.spendId);
                params.append('templateAmount', this.templateAmount);
                params.append('isCash', this.isCash);
                params.append('isSalary', this.isSalary);

                console.log(
                    'dateId: ' + this.dateId
                    + '\nspendId: ' + this.spendId
                    + '\ntemplateAmount: ' + this.templateAmount
                    + '\nisCash: ' + this.isCash
                    + '\nisSalary: ' + this.isSalary
                );

                axios.put('month/pushSpendToMonth', params).then(result => {
                    if(result.data.length > 0) {
                        this.date = result.data[0].date;
                        this.dateId = result.data[0].dateId;
                        result.data.forEach(spend => {
                            tmpMonthList.push(spend)
                        });
                        this.spendId = '';
                        this.showSpendInput = false;
                        this.templateAmount = '';
                    }
                }).then(function () {
                    axios.get('month/getMonthlyMissingSpends?monthlyDateId=' + this.dateId).then(res => {
                        res.data.forEach(spend => {
                            tempSpendList.push(spend);
                        })
                    });
                    this.missingSpendsList = tempSpendList;
                });
                this.monthList = tmpMonthList;
            },
            delMonthSpend: function (event) {
                let tmpMonthList = [];
                let monthId = event.target.id;
                axios.delete('month/deleteSpendFromMonth?monthId=' + monthId).then(result =>
                    result.data.forEach(spend => {
                        tmpMonthList.push(spend)
                    })
                );
                this.monthList = tmpMonthList;
            }
        },
        created: function () {
            function getThisMonth() {
                return axios.get('month');
            }
            function getLastMonth() {
                return axios.get('month/getPreviousMonth');
            }

            getThisMonth().then(async result => {
                this.date = result.data[0].date;
                this.dateId = result.data[0].dateId;
                this.monthList = result.data;
                await getMissingSpends(res.data[0].dateId).then(res => this.missingSpendsList = res.data);
            })
                .catch(() => {
                    getLastMonth().then(async res => {
                        this.date = res.data[0].date;
                        this.dateId = res.data[0].dateId;
                        this.monthList = res.data;
                        await getMissingSpends(res.data[0].dateId).then(res => this.missingSpendsList = res.data);
                    })
            });

            async function getMissingSpends(id) {
                return await axios.get('month/getMonthlyMissingSpends?monthlyDateId=' + id);
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
}