// *** TEMPLATES LIST start *** //

function showTemplatesList() {

    $('#templates-list').show();
    $('#month').hide();
    $('#spends').hide();
    $('#allMonths').hide();

    Vue.component('createMonthByTemplatesListModal', {
        props: ['templatesListId'],
        data: function() {
            return {
                bodyText: 'Создать новый месяц по этому шаблону?',
                warning: false,
                ignoreWarning: false,
                subModal: true
            }
        },
        template:
        '<div class="modal">'// v-if="this.$parent.showCreateMonthModal"
            + '<transition name="slideIn" appear>'
                + '<div v-if="subModal" class="modal-content new-month">'
                    + '<div @click="$emit(\'close\'), closeModal()" class="modal-button close">×</div>'
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
                    self.$parent.showCreateMonthByTemplatesListModal = false;
                }, 500);
                this.ignoreWarning = this.warning = false;
                this.bodyText = 'Создать новый месяц?';
            },
            createNewMonth: function () {
                if (!this.warning){
                    axios.get('month/checkLastMonthBeforeCreateNewMonth')
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
                } else if (this.ignoreWarning && this.templatesListId > 0){
                    axios.put('month/createNewMonthByTemplatesListId?templateListId=' + this.templatesListId)
                        .then(result => {
                            this.bodyText = 'OK';
                            let self = this;
                            setTimeout(function(){
                                self.closeModal();
                            }, 1000);
                            this.bodyText = 'OK';
                        })
                }

            }
        }
    });

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
            }
        },
        template:
        '<div @click="$parent.templateNameEditMode = false" class="template-list">'
            + '<div v-if="!!currentTemplate.spendName" class="month-item templates-list" v-for="(currentTemplate, index) in openedListTemplates" >'
                + '<div class="name">{{ currentTemplate.spendName }}</div>'
                + '<div class="deposited">'
                    + '<span v-if="!editMode || editingIndex != index" class="month-amount">{{ currentTemplate.amount }}</span>'
                    + '<input v-if="editMode && editingIndex == index" type="number" @change="editTemplateAmount($event)" @input="editTemplateAmount($event)" class="templateAmountInput" :value="currentTemplate.amount" />'
                + '</div>'
                + '<div v-if="!editMode || editingIndex != index" class="buttons">'
                    + '<button v-bind:class="[ currentTemplate.salary ? \'salary\' : \'prepaid\' ]"> </button>'
                    + '<button v-bind:class="[ currentTemplate.cash ? \'cash\' : \'card\' ]"> </button>'
                + '</div>'
                + '<div v-if="editMode && editingIndex == index" class="buttons editing">'
                    + '<button @click="salaryToggle($event)" v-bind:class="[ currentTemplate.salary ? \'salary\' : \'prepaid\' ]"> </button>'
                    + '<button @click="cashToggle($event)" v-bind:class="[ currentTemplate.cash ? \'cash\' : \'card\' ]"> </button>'
                + '</div>'
                + '<div class="sub-edit-block">'
                    + '<button v-if="editMode && editingIndex == index" class="save" @click="saveEditedTemplate()">Save</button>'
                    + '<button v-if="editMode && editingIndex == index" class="delete" @click="editingIndex = null">X</button>'
                    + '<button v-if="!editMode || editingIndex != index" @click="editTemplate(index, currentTemplate.templateId)" class="edit"> </button>'
                + '</div>'
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
            salaryToggle: function (event) {
                this.isSalary = event.target.className !== 'salary';
                event.target.className = this.isSalary ? 'salary' : 'prepaid';
            },
            cashToggle: function (event) {
                this.isCash = event.target.className !== 'cash';
                event.target.className = this.isCash ? 'cash' : 'card';
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
                 showCreateMonthByTemplatesListModal: false,
                 templateListId: null,
                 templateNameEditMode: false
             }
         },
        template:
        '<div class="templatesList">' //родительский шаблон, который вмещает в себя дочерний 'template'
            +'<div v-if="localTemplatesList.length > 0" v-for="template in localTemplatesList" class="template" :class="{ active: template.templateEnabled }" >'
                + '<div class="template-name"  :class="{ editing: template.id == openedListId }" :id="template.id">'
                    + '<input class="isActive" type="radio" @click="activateTemplate(template.id)" :checked="template.templateEnabled" />'

                    + '<button v-if="!templateNameEditMode" class="name" @click="openOneMonth(template.id)"> {{ template.templateName }} </button>'
                    + '<input class="newNameInput" v-if="templateNameEditMode" @input="editTemplatesListName($event)" v-model="template.templateName" />'
                    + '<button class="edit-template-name" @click="templateNameEditMode = !templateNameEditMode" v-if="template.id == openedListId"> </button>'

                    + '<single-template v-if="openedListTemplates.length > 0 && template.id == openedListId" :openedListTemplates="openedListTemplates" :openedListId="openedListId" />'
                    + '<select v-if="missingSpendsList.length > 0 && template.id == openedListId" @change="pushSpendToTemplate()" v-model="selectedSpendToAdd">'
                        + '<option v-for="spend in missingSpendsList" v-bind:value="spend.id">'
                            + '{{ spend.name }}'
                        + '</option>'
                    + '</select>'
                + '</div>'
                + '<div class="edit-block" v-if="template.id != openedListId">'
                    + '<button @click="createMonthFromThisTemplate(template.id)" class="fill"> => </button>'
                    + '<button @click="deleteTemplateList(template.id)" class="delete"> X </button>'
                + '</div>'
            + '</div>'
            + '<div v-if="localTemplatesList.length == 0"><h4>Has no templates yet.</h4></div>'
            + '<div class="new-template-list">'
                + '<input @input="handleInputListName($event.target.value)" @change="handleInputListName($event.target.value)" type="text">'
                + '<button @click="pushNewList()" id="pushList" type="button">Add</button>'
            + '</div>'
            + '<createMonthByTemplatesListModal v-if="showCreateMonthByTemplatesListModal" :templatesListId="templateListId" />'
        + '</div>',
        methods: {
            activateTemplate: function (templateListId) {
                axios.post('/templatesList/activate=' + templateListId).then( result => this.localTemplatesList = result.data)
            },
            openOneMonth: function(templateListId){
                this.openedListId = templateListId == this.openedListId ? null : templateListId;
                if (this.openedListId != null){ //нажата кнопка открыть/закрыть-> проверка, если открыт какой-то пункт меню, то запросить разностный массив для него, иначе нажата кнопка закрыть и делать ничего не надо
                    this.openedListTemplates = [];
                    this.missingSpendsList = [];

                    axios.get('templates/' + this.openedListId).then(result =>
                        this.openedListTemplates = result.data
                    );

                    axios.get('spends/' + this.openedListId).then(result =>
                            this.missingSpendsList = result.data
                    );
                }
            },
            editTemplatesListName: function(event) {
                axios.post('templatesList/renameList?templatesListId=' + this.openedListId +'&newName=' + event.target.value)
                    .then(result => this.localTemplatesList = result.data)
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
            handleInputListName: function(value) {
                this.newListName = value;
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
            deleteTemplateList: function(templateListId) {
                axios.post('/templatesList/delete=' + templateListId).then(result => this.localTemplatesList = result.data)
            },
            createMonthFromThisTemplate: function (templateListId) {
                this.templateListId = templateListId;
                this.showCreateMonthByTemplatesListModal = true;
            }
        },
        created: function () {
            axios.get('templatesList').then(result => {
                this.localTemplatesList = result.data
            }); // получаем все листы из templates_list
        }
    });

    let templatesLists = new Vue({
        el: '#templates-list', // айдишник блока, куда рендерить
        template: '<div id="templates-list"><templates-list /></div>' // ссылка на название компонента 1 и ссылка название коллекции в data.
    });
}