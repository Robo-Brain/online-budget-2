// *** TEMPLATES LIST start *** //

function showTemplatesList() {

    $('#templates-list').show();
    $('#month').hide();
    $('#spends').hide();
    $('#allMonths').hide();

    Vue.component('single-template',{
        props: ['openedListTemplates', 'openedListId'],
        template:
        '<ul class="template-list">'
            + '<button v-if="this.$parent.openedListTemplates.length > 1" @click="editTemplate()" id="editTemplateButton">Edit</button>'
            + '<li class="template-list-item" v-for="currentTemplate in openedListTemplates" v-if="!!currentTemplate.spendName">'
                + '{{ currentTemplate.spendName }} '
                + '<span v-if="!editMode">'
                    + '<span> {{ currentTemplate.amount }} </span>'
                    + '&nbsp;'
                    + '<span v-if="currentTemplate.salaryOrPrepaid" class="salary">ЗП</span>'
                        + '<span v-else class="prepaid">Аванс</span>'
                    + '&nbsp;'
                    + '<span v-if="currentTemplate.cashOrCard">Cash</span>'
                        + '<span v-else>Card</span>'
                + '</span>'
                + '<span v-else-if="editMode">'
                    + '<input type="number" @change="editTemplateAmount($event)" @input="editTemplateAmount($event)" class="templateAmountInput" :value="currentTemplate.amount" />'
                        + '&nbsp;'
                    + '<button @click="salaryToggle($event)" v-bind:class="[ currentTemplate.salaryOrPrepaid ? \'salary\' : \'prepaid\' ]"> </button>'
                        + '&nbsp;'
                    + '<button @click="cashToggle($event)" v-bind:class="[ currentTemplate.cashOrCard ? \'cash\' : \'card\' ]"> </button>'
                + '</span>'
                + '&nbsp;'
                + '<button v-if="!editMode" class="delete" :id="currentTemplate.templateId" @click="deleteTemplateEverywhere($event)">X</button>'
                + '<button v-if="editMode" class="save" :id="currentTemplate.templateId" @click="editSpendInTemplate($event)">Save</button>'
            + '</li>'
        + '</ul>',
        data: function() {
            return  {
                editMode: false,
                amount: '',
                dateId: null,
                isSalary: true,
                isCash: true,
                salaryOrPrepaidButtonText: ''
            }
        },
        methods: {
            deleteTemplateEverywhere: function (event) {
                var templateId = event.target.id;
                var openedListId = this.openedListId;

                var tmpListArr = [];

                axios.delete('templates/deleteSpendFromTemplate?templateId=' + templateId + "&templatesListId=" + openedListId + "&dateId=" + this.dateId)
                    .then(response =>
                        response.data.forEach(tmp => {
                            tmpListArr.push(tmp);
                        })
                    )
                    .catch(function () {
                        console.log('error')
                    });
                this.$parent.openedListTemplates = tmpListArr;
            },
            deleteTemplateFromTemplateList: function (event) {
                var openedListId = this.openedListId;
                var templateId = event.target.id;

                var tmpListArr = [];
                var spendsArr = [];

                axios.delete('templates/deleteTemplateFromTemplateList?templatesListId=' + openedListId + "&templateId=" + templateId)
                    .then(response =>
                        response.data.forEach(tmp => {
                            tmpListArr.push(tmp);
                        })
                    )
                    .catch(function () {
                        console.log('error')
                    })
                    .then(function () {
                        axios.get('spends/' + openedListId).then(result =>
                            result.data.forEach(spend => {
                                spendsArr.push(spend);
                            })
                        );

                    });

                this.$parent.openedListTemplates = tmpListArr;
                this.$parent.missingSpendsList = spendsArr;
            },
            editTemplate: function () {
                this.editMode = !this.editMode;
            },
            editSpendInTemplate: function () { //                          ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! !
                const params = new URLSearchParams();
                params.append('templatesListId', '2');
                params.append('templateId', '19');
                params.append('spendId', '1');
                params.append('amount', '1928');
                params.append('salaryOrPrepaid', 'true');
                params.append('isCash', 'true');
                axios.put('templates/editTemplate', params).then(result =>
                    result.data.forEach(tmp => {
                        console.log(tmp)
                    })
                );
            },
            editTemplateAmount: function (event) {
                this.amount = event.target.value;
                // this.amount = Number(this.amount);
                if (this.amount.length > 2){
                    console.log('amount: ' + this.amount)
                }
            },
            salaryToggle: function (event) {
                if (event.target.className == 'salary') {
                    event.target.className = 'prepaid';
                    this.isSalary = false;
                } else {
                    event.target.className = 'salary';
                    this.isSalary = true;
                }
                console.log("isSalary: " + this.isSalary)
            },
            cashToggle: function (event) {
                if (event.target.className == 'cash') {
                    event.target.className = 'card';
                    this.isCash = false;
                } else {
                    event.target.className = 'cash';
                    this.isCash = true;
                }
                console.log("isCash: " + this.isCash)
            }
        }
    });

     Vue.component('templates-list', { // название компонента 1.
        props: ['templatesList'], //ожидаемые данные - коллекция под названием 'templates'
        template:
        '<div class="templatesList">' //родительский шаблон, который вмещает в себя дочерний 'template'
        // <div v-if="templatesList.length > 0"><div v-else>Has no templates yet.</div></div>
            +'<div v-if="templatesList.length > 0" v-for="template in templatesList" class="template" :class="{ active: template.templateEnabled }" >'
                + '<span :id="template.id"><i>{{ template.id }}</i>'
                    + '{{ template.templateName }}'
                    + '<input type="radio" @click="activateTemplate($event)" :id="template.id" :checked="template.templateEnabled" />'
                    + '<button :class="template.templateName" :id="template.id" @click="toggle($event)">{{ buttonText }}</button>' // по клику в метод toggle() передается название класса(соотв-ющее названию шаблона), который присваивает его переменной "openedListClass"
                    + '<div v-if="template.templateName == openedListClass">' // если имя переменной "openedListClass" соотв-вует названию шаблона, то блок рендерится
                        // + '<span v-if="openedListTemplates.length > 0 && !!currentTemplate.spendName" v-for="currentTemplate in openedListTemplates" v-bind:value="currentTemplate.id">'
                            + '<single-template v-if="openedListTemplates.length > 0" :openedListTemplates="openedListTemplates" :openedListId="openedListId" />'
                        // + '</span>'
                        + '<select v-if="missingSpendsList.length > 0" @change="pushSpendToTemplate()" v-model="selectedSpendToAdd" :id="template.id">'
                            + '<option v-for="spend in missingSpendsList" v-bind:value="spend.id">'
                                + '{{ spend.name }}'
                            + '</option>'
                        + '</select>'
                    + '</div>'
                + '</span>'
            + '</div><div v-if="templatesList.length == 0"><h4>Has no templates yet.</h4></div>'
            + 'Name: <input @input="handleInputListName($event.target.value)" @change="handleInputListName($event.target.value)" type="text">'
                + '<button @click="pushNewList()" id="pushList" type="button">Add</button>'
        + '</div>',
        data: function() {
            return  {
                openedListId: null,
                openedListClass: null,
                openedListTemplates: [],
                buttonText: 'Open',
                missingSpendsList: [],
                selectedSpendToAdd: '',
                newListName: ''
            }
        },
        methods: {
            activateTemplate: function (event) {
                var id = event.currentTarget.id;
                axios.post('/templatesList/activate=' + id).then( result => this.templatesList = result.data)
            },
            toggle: function(event){
                this.openedListId = event.target.id == this.openedListId ? null : event.target.id;
                this.openedListClass = event.target.className == this.openedListClass ? null : event.target.className;
                this.buttonText = this.openedListClass == null ? 'Open' : 'Close';

                if (this.openedListClass != null){ //нажата кнопка открыть/закрыть-> проверка, если открыт какой-то пункт меню, то запросить разностный массив для него, иначе нажата кнопка закрыть и делать ничего не надо
                    this.openedListTemplates = [];
                    this.missingSpendsList = [];

                    axios.get('templates/' + this.openedListId).then(result =>
                        result.data.forEach(tmp => {
                            this.openedListTemplates.push(tmp);
                        })
                    );

                    axios.get('spends/' + this.openedListId).then(result =>
                        result.data.forEach(spend => {
                            this.missingSpendsList.push(spend);
                        })
                    );
                }
            },
            pushSpendToTemplate: function () {
                var templatesListId = this.openedListId;
                var spendId = this.selectedSpendToAdd;

                if (spendId != null && templatesListId != null && spendId > 0 && templatesListId > 0){
                    const params = new URLSearchParams();
                    var newMissingSpendsList = [];
                    var newTemplateList = [];

                    params.append('templatesListId', templatesListId);
                    params.append('spendId', spendId);

                    axios.put('templates/addSpendToTemplate', params).then(result =>
                        result.data.forEach(spend => {
                            newMissingSpendsList.push(spend);
                        })
                        )
                        .catch(function () {
                            console.log('error')
                        })
                        .then(function () {
                            axios.get('templates/' + templatesListId).then(result => // получаем все листы из templates_list
                                result.data.forEach(tmp => {
                                    newTemplateList.push(tmp);
                                })
                        );
                    });

                    this.missingSpendsList = newMissingSpendsList;
                    this.openedListTemplates = newTemplateList;
                }
            },
            handleInputListName: function(value) {
                this.newListName = value;
            },
            pushNewList: function () {
                if (this.newListName.length > 1){
                    var name = this.newListName;
                    var newTemplatesList = [];
                    axios.put('templatesList/create?name=' + name).then(result => // получаем все листы из spends
                        result.data.forEach(tmp => {
                            newTemplatesList.push(tmp);
                        })
                    );
                    this.templatesList = newTemplatesList;
                }
            }
        },
        created: function () { //функция, котора ожидает подгрузки всего необходимого и ДО рендера страницы меняет содержимое на то, что получено через axios.get()
            axios.get('templatesList').then(result => // получаем все листы из templates_list
                result.data.forEach(tmp => {
                    this.templatesList.push(tmp);
                })
            );
        }
    });

    var templatesLists = new Vue({
        el: '#templates-list', // айдишник блока, куда рендерить
        template: '<div id="templates-list"><templates-list :templatesList = "templatesList" /></div>', // ссылка на название компонента 1 и ссылка название коллекции в data.
        data: {
            templatesList: []
        }
    });
}