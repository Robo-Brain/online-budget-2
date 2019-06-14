// *** TEMPLATES LIST start *** //

function showTemplatesList() {

    $('#templates-list').show();
    $('#month').hide();
    $('#spends').hide();
    $('#allMonths').hide();

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
        '<ul class="template-list">'
            + '<li class="template-list-item" v-for="(currentTemplate, index) in openedListTemplates" v-if="!!currentTemplate.spendName" :key="currentTemplate.templateId">'
                + '{{ currentTemplate.spendName }}'
                + '<span v-if="!editMode || editingIndex != index">'
                    + '<span class="amount"> - {{ currentTemplate.amount }}₽</span>'
                    + '&nbsp;'
                    + ' / <button v-bind:class="[ currentTemplate.salary ? \'salary\' : \'prepaid\' ]"> </button>'
                    + '&nbsp;'
                    + ' / <button v-bind:class="[ currentTemplate.cash ? \'cash\' : \'card\' ]"> </button>'
                + '</span>'
                + '<span v-if="editMode && editingIndex == index">'
                    + '<input type="number" @change="editTemplateAmount($event)" @input="editTemplateAmount($event)" class="templateAmountInput" :value="currentTemplate.amount" />'
                    + '&nbsp;'
                    + '<button @click="salaryToggle($event)" class="edit" v-bind:class="[ currentTemplate.salary ? \'salary\' : \'prepaid\' ]"> </button>'
                    + '&nbsp;'
                    + '<button @click="cashToggle($event)" class="edit" v-bind:class="[ currentTemplate.cash ? \'cash\' : \'card\' ]"> </button>'
                    + '&nbsp;<button class="save" :id="currentTemplate.templateId" @click="editTemplateInList($event)">Save</button>'
                + '</span>'
                + '<span v-if="editingIndex != index" class="edit-block">'
                    + '&nbsp;<button @click="editTemplate(index, $event)" :id="currentTemplate.templateId" class="edit">Edit</button>'
                    + '<button class="delete" :id="currentTemplate.templateId" @click="deleteTemplateFromTemplateList($event)">X</button>'
                + '</span>'
            + '</li>'
        + '</ul>',
        methods: {
            deleteTemplateFromTemplateList: function (event) {
                let openedListId = this.openedListId;
                let templateId = event.target.id;

                axios.delete('/templatesList/deleteTemplateFromTemplateList?templatesListId=' + openedListId + "&templateId=" + templateId)
                    .then(async response => {
                            this.$parent.openedListTemplates = response.data;
                            await getMissingSpends(openedListId).then(res => this.$parent.missingSpendsList = res.data);
                        });

                async function getMissingSpends(openedListId) {
                    return await axios.get('spends/' + openedListId);
                }
            },
            editTemplate: function (index, event) {
                if (this.editingIndex == index){
                    this.editMode = false;
                    this.editingIndex = null;
                } else {
                    this.editingIndex = index;
                    this.editMode = true;
                }
                this.editingTemplateId = event.target.id;
            },
            editTemplateAmount: function (event) {
                if (event.target.value > 2) this.amount = event.target.value;
            },
            salaryToggle: function (event) {
                if (event.target.className == 'salary') {
                    event.target.className = 'prepaid';
                } else {
                    event.target.className = 'salary';
                }
                event.target.className == 'salary' ? this.isSalary = true : this.isSalary = false;
            },
            cashToggle: function (event) {
                if (event.target.className == 'cash') {
                    event.target.className = 'card';
                } else {
                    event.target.className = 'cash';
                }
                event.target.className == 'cash' ? this.isCash = true : this.isCash = false;
            },
            editTemplateInList: function () {
                console.log(
                    'templateId: ' + this.editingTemplateId
                    + '\namount: ' + this.amount
                    + '\nisCash: ' + this.isCash
                    + '\nisSalary: ' + this.isSalary
                    + '\ntemplatesListId: ' + this.openedListId
                );

                axios.put('templatesList/editTemplateInList?templatesListId=' + this.openedListId
                    + '&templateId=' + this.editingTemplateId
                    + '&amount=' + this.amount
                    + '&isSalary=' + this.isSalary
                    + '&isCash=' + this.isCash
                ).then(result => {
                    this.$parent.openedListTemplates = result.data;
                    this.spendId = this.templateAmount = this.isCash = this.isSalary = '';
                    this.editingIndex = null;
                    this.editMode = false;
                });

            }
        }
    });

     Vue.component('templates-list', { // название компонента 1.
        props: ['templatesList'], //ожидаемые данные - коллекция под названием 'templates'
        template:
        '<div class="templatesList">' //родительский шаблон, который вмещает в себя дочерний 'template'
        // <div v-if="templatesList.length > 0"><div v-else>Has no templates yet.</div></div>
            +'<div v-if="templatesList.length > 0" v-for="template in templatesList" class="template" :class="{ active: template.templateEnabled }" >'
                + '<span :id="template.id">'
                    + '<input class="isActive" type="radio" @click="activateTemplate($event)" :id="template.id" :checked="template.templateEnabled" />'
                    + '<button class="name" :id="template.id" @click="openOneMonth($event)"> {{ template.templateName }} </button>' // по клику в метод toggle() передается название класса(соотв-ющее названию шаблона), который присваивает его переменной "openedListClass"
                    + '<div v-if="template.id == openedListId">' // если имя переменной "openedListId" соотв-вует id шаблона, то блок рендерится
                        + '<single-template v-if="openedListTemplates.length > 0" :openedListTemplates="openedListTemplates" :openedListId="openedListId" />'
                        + '<select v-if="missingSpendsList.length > 0" @change="pushSpendToTemplate()" v-model="selectedSpendToAdd" :id="template.id">'
                            + '<option v-for="spend in missingSpendsList" v-bind:value="spend.id">'
                                + '{{ spend.name }}'
                            + '</option>'
                        + '</select>'
                    + '</div>'
                + '</span>'
                + '<span class="edit-block" v-if="template.id != openedListId">'
                    + '<button :id="template.id" @click="createMonthFromThisTemplate($event)" class="fill"> => </button>'
                    + '<button :id="template.id" @click="deleteTemplateList($event)" class="delete"> X </button>'
                + '</span>'
            + '</div>'
            + '<div v-if="templatesList.length == 0"><h4>Has no templates yet.</h4></div>'
            + 'Name: <input @input="handleInputListName($event.target.value)" @change="handleInputListName($event.target.value)" type="text">'
                + '<button @click="pushNewList()" id="pushList" type="button">Add</button>'
        + '</div>',
        data: function() {
            return  {
                openedListId: null,
                openedListClass: null,
                openedListTemplates: [],
                missingSpendsList: [],
                selectedSpendToAdd: '',
                newListName: ''
            }
        },
        methods: {
            activateTemplate: function (event) {
                let id = event.currentTarget.id;
                axios.post('/templatesList/activate=' + id).then( result => this.templatesList = result.data)
            },
            openOneMonth: function(event){
                this.openedListId = event.target.id == this.openedListId ? null : event.target.id;
                // this.openedListClass = event.target.className == this.openedListClass ? null : event.target.className;
                console.log(this.openedListId);
                if (this.openedListId != null){ //нажата кнопка открыть/закрыть-> проверка, если открыт какой-то пункт меню, то запросить разностный массив для него, иначе нажата кнопка закрыть и делать ничего не надо
                    this.openedListTemplates = [];
                    this.missingSpendsList = [];

                    axios.get('templates/' + this.openedListId).then(result =>
                        this.openedListTemplates = result.data
                    );

                    axios.get('spends/' + this.openedListId).then(result =>
                        result.data.forEach(spend => {
                            this.missingSpendsList.push(spend);
                        })
                    );
                }
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
                    axios.put('templatesList/create?name=' + name).then(result => // получаем все листы из spends
                        this.templatesList = result.data
                    );
                    // this.templatesList = newTemplatesList;
                }
            },
            deleteTemplateList: function(event) {
                let id = event.currentTarget.id;
                axios.post('/templatesList/delete=' + id).then(result => this.templatesList = result.data)
            },
            createMonthFromThisTemplate: function (event) {
                let templateListId = event.currentTarget.id;
                axios.put('/month/createMonthFromTemplatesList?templateListId=' + templateListId)
                    .then(result => alert('success'))
            }
        },
        created: function () { //функция, котора ожидает подгрузки всего необходимого и ДО рендера страницы меняет содержимое на то, что получено через axios.get()
            axios.get('templatesList').then(result => this.templatesList = result.data); // получаем все листы из templates_list
        }
    });

    let templatesLists = new Vue({
        el: '#templates-list', // айдишник блока, куда рендерить
        template: '<div id="templates-list"><templates-list :templatesList = "templatesList" /></div>', // ссылка на название компонента 1 и ссылка название коллекции в data.
        data: {
            templatesList: []
        }
    });
}