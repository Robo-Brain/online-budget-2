// *** TEMPLATES LIST start *** //

function showTemplatesList() {

    $('#templates-list').show();
    $('#upper-menu-templates').addClass('selected-menu-item');

    $('#month').hide();
    $('#spends').hide();
    $('#allMonths').hide();
    $('#options').hide();
    $('#upper-menu-month').removeClass('selected-menu-item');
    $('#upper-menu-allMonths').removeClass('selected-menu-item');
    $('#upper-menu-spends').removeClass('selected-menu-item');


    Vue.component('single-template',{
        props: ['openedListTemplates', 'openedListId'],
        data: function() {
            return  {
                editMode: false,
                editingTemplateId: null,
                amount: '',
                dateId: null,
                isSalary: '',
                isCash: '',
                editingIndex: null,
                minimizedSum: false,
                totals: {
                    totalAmountSalaryCard: 0, totalAmountSalaryCash: 0, totalAmountPrepaidCard: 0, totalAmountPrepaidCash: 0
                }
            }
        },
        watch: {
            openedListTemplates: {
                handler: function (val, oldVal) {
                    this.totals.totalAmountSalaryCash = this.totals.totalAmountSalaryCard = this.totals.totalAmountPrepaidCash = this.totals.totalAmountPrepaidCard = null;
                    for (const item of this.openedListTemplates){
                        this.totals.totalAmountSalaryCash = item.salary && item.cash ? this.totals.totalAmountSalaryCash + item.amount : this.totals.totalAmountSalaryCash;
                        this.totals.totalAmountSalaryCard = item.salary && !item.cash ? this.totals.totalAmountSalaryCard + item.amount : this.totals.totalAmountSalaryCard;
                        this.totals.totalAmountPrepaidCash = !item.salary && item.cash ? this.totals.totalAmountPrepaidCash + item.amount : this.totals.totalAmountPrepaidCash;
                        this.totals.totalAmountPrepaidCard = !item.salary && !item.cash ? this.totals.totalAmountPrepaidCard + item.amount : this.totals.totalAmountPrepaidCard;
                    }
                },
                deep: true
            }
        },
        template:
        '<div @click="$parent.templateNameEditMode = false" class="months">'
            + '<div @click="minimizedSum = !minimizedSum" v-bind:class="{ minimized: minimizedSum }" class="template-total-window">'
                + '<p v-if="this.totals.totalAmountSalaryCash > 0 && !minimizedSum">ЗП нал: {{totals.totalAmountSalaryCash}} </p>'
                + '<p v-if="this.totals.totalAmountSalaryCard > 0 && !minimizedSum">ЗП карта: {{totals.totalAmountSalaryCard}} </p>'
                + '<p v-if="totals.totalAmountSalaryCash + totals.totalAmountSalaryCard > 0  && !minimizedSum" class="subtotal">'
                    + 'ЗП итого: {{totals.totalAmountSalaryCash + totals.totalAmountSalaryCard}}'
                + '</p>'
                + '<p v-if="this.totals.totalAmountPrepaidCash > 0 && !minimizedSum">Аванс нал: {{totals.totalAmountPrepaidCash}} </p>'
                + '<p v-if="this.totals.totalAmountPrepaidCard > 0 && !minimizedSum">Аванс карта: {{totals.totalAmountPrepaidCard}} </p>'
                + '<p v-if="totals.totalAmountPrepaidCash + totals.totalAmountPrepaidCard > 0  && !minimizedSum" class="subtotal">'
                    + 'Аванс итого: {{totals.totalAmountPrepaidCash + totals.totalAmountPrepaidCard}}'
                + '</p>'
                + '<p class="total">Итого: {{totals.totalAmountSalaryCash + totals.totalAmountSalaryCard + totals.totalAmountPrepaidCash + totals.totalAmountPrepaidCard}} </p>'
            + '</div>'
            + '<div v-if="!!currentTemplate.spendName" class="month-item templates-list" v-bind:class="[{ gray: colorScheme == \'gray\' }]" v-for="(currentTemplate, index) in openedListTemplates" >'
                + '<v-touch v-on:swipe="editTemplate(index, currentTemplate.templateId)">'
                    + '<div class="name-notices-block">'
                        + '<div class="name"> {{ currentTemplate.spendName }} </div>'
                    + '</div>'
                    + '<div class="deposited">'
                        + '<span v-if="!editMode || editingIndex != index" class="month-amount">{{ currentTemplate.amount }}</span>'
                        + '<input v-if="editMode && editingIndex == index" type="number" @change="editTemplateAmount($event)" @input="editTemplateAmount($event)" :value="currentTemplate.amount" />'
                    + '</div>'
                    + '<div v-if="!editMode || editingIndex != index" class="buttons">'
                        + '<button v-bind:class="[ currentTemplate.salary ? \'salary\' : \'prepaid\' ]"> </button>'
                        + '<button v-bind:class="[ currentTemplate.cash ? \'cash\' : \'card\' ]"> </button>'
                    + '</div>'
                    + '<div v-if="editMode && editingIndex == index" class="salary-cash-select">'
                        + '<select class="salary-prepaid-form" @change="salaryToggle($event, index, currentTemplate.templateId)">'
                            + '<option value="salary" :selected="currentTemplate.salary">ЗП</option>'
                            + '<option value="prepaid" :selected="!currentTemplate.salary">Аванс</option>'
                        + '</select>'
                        + '<br />'
                        + '<select class="cash-card-form" @change="cashToggle($event, index, currentTemplate.templateId)">'
                            + '<option value="cash" :selected="currentTemplate.cash">Нал</option>'
                            + '<option value="card" :selected="!currentTemplate.cash">Карта</option>'
                        + '</select>'
                    + '</div>'
                    + '<div class="sub-edit-block">'
                        + '<button v-if="editMode && editingIndex == index" class="save" @click="saveEditedTemplate()"> </button>'
                        + '<button v-if="editMode && editingIndex == index" class="delete" @click="deleteTemplateFromTemplateList(currentTemplate.templateId)"> </button>'
                        + '<button v-if="!editMode || editingIndex != index" @click="editTemplate(index, currentTemplate.templateId)" class="edit"> </button>'
                    + '</div>'
                + '</v-touch>'
            + '</div>'
        + '</div>',
        methods: {
            deleteTemplateFromTemplateList: function (templateId) {
                axios.delete('/templatesList/deleteTemplateFromTemplateList?templatesListId=' + this.openedListId + "&templateId=" + templateId)
                    .then(async response => {
                            this.$parent.openedListTemplates = response.data;
                            await getMissingSpends(this.openedListId).then(res => {
                                this.$parent.missingSpendsList = res.data;
                            });
                        });

                async function getMissingSpends(openedListId) {
                    return await axios.get('spends/' + openedListId);
                }
                this.editingIndex = null;
            },
            editTemplate: function (index, templateId) {
                if (this.editingIndex == index){
                    this.editMode = false;
                    this.editingIndex = null;
                } else {
                    this.editingIndex = index;
                    this.editMode = true;
                }
                this.editingTemplateId = templateId;
            },
            editTemplateAmount: function (event) {
                if (event.target.value > 0) this.amount = event.target.value;
            },
            salaryToggle: function (event, index, editingTemplateId) { // изменение стиля кнопки salary <-> prepaid и установка значения в this.isSalary
                this.editingTemplateId = editingTemplateId;
                this.editingIndex = index;
                this.isSalary = event.target.value === 'salary';
                console.log(this.editingTemplateId)
                console.log(this.isSalary)
            },
            cashToggle: function (event, index, monthlySpendsId) { // изменение стиля кнопки cash <-> card и установка значения в this.isCash
                this.monthlySpendsId = monthlySpendsId;
                this.editingIndex = index;
                this.isCash = event.target.value === 'cash';
                console.log(this.editingTemplateId)
                console.log(this.isCash)
            },
            saveEditedTemplate: function () {
                axios.put('templatesList/editTemplateInList?templatesListId=' + this.openedListId
                    + '&templateId=' + this.editingTemplateId
                    + '&amount=' + this.amount
                    + '&isSalary=' + this.isSalary
                    + '&isCash=' + this.isCash
                ).then(result => {
                    this.$parent.openedListTemplates = result.data;
                    this.spendId = this.templateAmount = this.amount = this.isCash = this.isSalary = '';
                    this.editingIndex = null;
                    this.editMode = false;
                });
            }
        },
        created: function () {
            this.totals.totalAmountSalaryCash = this.totals.totalAmountSalaryCard = this.totals.totalAmountPrepaidCash = this.totals.totalAmountPrepaidCard = null;
            for (const item of this.openedListTemplates){
                this.totals.totalAmountSalaryCash = item.salary && item.cash ? this.totals.totalAmountSalaryCash + item.amount : this.totals.totalAmountSalaryCash;
                this.totals.totalAmountSalaryCard = item.salary && !item.cash ? this.totals.totalAmountSalaryCard + item.amount : this.totals.totalAmountSalaryCard;
                this.totals.totalAmountPrepaidCash = !item.salary && item.cash ? this.totals.totalAmountPrepaidCash + item.amount : this.totals.totalAmountPrepaidCash;
                this.totals.totalAmountPrepaidCard = !item.salary && !item.cash ? this.totals.totalAmountPrepaidCard + item.amount : this.totals.totalAmountPrepaidCard;
            }
        }
    });

     Vue.component('templates-list', { // название компонента 1.
         data: function() {
             return  {
                 localTemplatesList: [],
                 openedListId: null,
                 openedListClass: null,
                 openedListTemplates: [],
                 missingSpendsList: [],
                 selectedSpendToAdd: '',
                 newListName: '',
                 templateListId: null,
                 templateNameEditMode: false,
                 deleting: false,
                 deletingIndex: null,
                 colorScheme: ''
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
        '<div class="templatesList">' //родительский шаблон, который вмещает в себя дочерний 'template'
            +'<div v-if="localTemplatesList.length > 0" v-for="(template, index, key) in localTemplatesList" class="template" :class="{ active: template.templateEnabled, deleting: index == deletingIndex && deleting, gray: colorScheme == \'gray\' }" >'
                + '<div @click="deleting = false" class="template-name"  :class="{ editing: template.id == openedListId }" :id="template.id">'
                    + '<input class="isActive" type="radio" @click="activateTemplate(template.id)" :checked="template.templateEnabled" />'
                    + '<button v-if="!templateNameEditMode || template.id != openedListId" class="name" @click="openOneMonth(template.id)"> {{ template.templateName }} </button>'
                    + '<input class="newNameInput" v-if="templateNameEditMode && template.id == openedListId" v-on:keyup="send($event)" @input="editTemplatesListName($event)" v-model="template.templateName" v-focus/>'
                    + '<button class="edit-template-name" @click="templateNameEditMode = !templateNameEditMode" v-if="template.id == openedListId"> </button>'

                    + '<single-template v-if="openedListTemplates.length > 0 && template.id == openedListId" :openedListTemplates="openedListTemplates" :openedListId="openedListId" />'
                    + '<select v-if="missingSpendsList.length > 0 && template.id == openedListId" @change="pushSpendToTemplate()" v-model="selectedSpendToAdd">'
                        + '<option v-for="spend in missingSpendsList" v-bind:value="spend.id">'
                            + '{{ spend.name }}'
                        + '</option>'
                    + '</select>'
                + '</div>'
                + '<div class="edit-block" v-if="template.id != openedListId">'
                    + '<span @click="deleting = false" v-if="deleting && deletingIndex == index" class="templates-list-delete-warning">Будет удалено при повторном нажатии!</span>'
                    + '<button @click="copyMonthFromThisTemplate(template.id)" class="copy"> </button>'
                    + '<button @click="deleteTemplateList(template.id, index)" class="delete"> </button>'
                + '</div>'
            + '</div>'
            + '<div v-if="localTemplatesList.length == 0"><h4>Has no templates yet.</h4></div>'
            + '<div class="new-template-list">'
                + '<input @input="handleInputListName($event)" v-on:keyup="handleInputListName($event)" type="text">'
                + '<button @click="pushNewList()" id="pushList" type="button">Создать</button>'
            + '</div>'
        + '</div>',
        methods: {
            send: function (event) {
                if (event.keyCode === 13) this.templateNameEditMode = false;
            },
            activateTemplate: function (templateListId) {
                axios.post('/templatesList/activate=' + templateListId).then( result => this.localTemplatesList = result.data)
            },
            openOneMonth: function(templateListId){
                this.openedListId = templateListId === this.openedListId ? null : templateListId;
                if (this.openedListId != null){ //нажата кнопка открыть/закрыть-> проверка, если открыт какой-то пункт меню, то запросить разностный массив для него, иначе нажата кнопка закрыть и делать ничего не надо
                    this.openedListTemplates = [];
                    this.missingSpendsList = [];

                    axios.get('templates/' + this.openedListId).then(result => {
                        console.log(result.data);
                        this.openedListTemplates = result.data
                    });

                    axios.get('spends/' + this.openedListId).then(result =>
                            this.missingSpendsList = result.data
                    );
                }
            },
            editTemplatesListName: function(event) {
                this.newListName = event.target.value; //функция принимает новое имя и сразу же записывает его в глобальную переменную
                let tmpVal = event.target.value; //функция принимает новое имя и сразу же записывает его в локальную переменную
                let self = this;
                setTimeout(function(){
                    if(tmpVal === self.newListName) { //если глобальная переменная == локальной, тогда записывать
                        axios.post('templatesList/renameList?templatesListId=' + self.openedListId +'&newName=' + event.target.value)
                            .then(result => this.localTemplatesList = result.data)
                    }
                }, 1500);
            },
            pushSpendToTemplate: function () {
                let templatesListId = this.openedListId;
                let spendId = this.selectedSpendToAdd;

                if (spendId != null && templatesListId != null && spendId > 0 && templatesListId > 0){
                     axios.put('templatesList/pushSpendToTemplateList?templatesListId=' + templatesListId
                         + '&spendId=' + spendId
                     ).then(async () => {
                        await getMissingSpends(templatesListId).then(res => this.missingSpendsList = res.data);
                        await getTemplatesForThisList(templatesListId).then(res => this.openedListTemplates = res.data);
                        });

                    async function pushTemplateToTemplateList(id) {
                        return await axios.get('templatesList/getMissingSpends?templatesListId=' + id);
                    }

                    async function getMissingSpends(id) {
                        return await axios.get('templatesList/getMissingSpends?templatesListId=' + id);
                    }

                    async function getTemplatesForThisList(id) {
                        return await axios.get('templates/' + id);
                    }

                }
            },
            handleInputListName: function(event) {
                if (event.keyCode === 13){
                    this.pushNewList();
                    event.target.value = '';
                } else {
                    this.newListName = event.target.value;
                }
            },
            pushNewList: function () {
                if (this.newListName.length > 1){
                    let name = this.newListName;
                    let newTemplatesList = [];
                    axios.put('templatesList/create?name=' + name).then(result => // получаем все листы из spendsid="templates-list"
                        this.localTemplatesList = result.data
                    );
                    // this.templatesList = newTemplatesList;
                }
            },
            copyMonthFromThisTemplate: function(templateListId) {
                axios.post('templatesList/createTemplatesListFromAnotherTemplatesList?templatesListId=' + templateListId).then(result => {
                    this.localTemplatesList = result.data;
                });
            },
            deleteTemplateList: function(templateListId, index) {
                if (this.deleting && this.deletingIndex === index){
                    axios.delete('/templatesList/delete=' + templateListId).then(result => this.localTemplatesList = result.data);
                    this.deleting = false;
                    this.deletingIndex = null;
                } else {
                    this.deleting = true;
                    this.deletingIndex = index;
                }
            }
        },
        created: function () {
            axios.get('templatesList').then(result => {
                this.localTemplatesList = result.data
            }); // получаем все листы из templates_list


            axios.get('options').then(result => {
                let arr = {};
                arr = result.data.properties;
                window.options = result.data;
                try{
                    arr = JSON.parse(result.data.properties);
                } catch (e) {
                    console.log('already object \'created\'');
                }

                this.colorScheme = arr.color_scheme;

            });
        }
    });

    let templatesLists = new Vue({
        el: '#templates-list', // айдишник блока, куда рендерить
        template: '<div id="templates-list"><templates-list /></div>' // ссылка на название компонента 1 и ссылка название коллекции в data.
    });
}