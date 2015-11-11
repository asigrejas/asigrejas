/**
 * App: As Igrejas Version Beta
 * @author Leandro Henrique Reis http://henriquereis.com
 *
 * Inspirados nas aulas de VueJs do Vedovelli vedcasts.com.br 
 * Alguns métodos e layout foram importados das aulas
 */
angular.module('appChurches', ['flashMessage', 'OrderService']).constant('APP', {
    name: 'As Igrejas Version Beta',
    debug: false,
    views: '/views/',
    path: '/'
}).constant('API', {
//    path: '//api.asigrejas.app/v1/'
    path: '//api.asigrejas.com/v1/'
}).filter('dateFormat', function() {
    return function(value, formatString) {
		if(formatString != undefined)
		{
		    return moment(value).format(formatString);
		}

		return moment(value).format('DD/MM/YYYY');
    };
}).controller('ChurchController', ['$rootScope', '$scope', '$http', '$filter', 'APP', 'API', 'flash', 'OrderService', ChurchController]);

/**
 * Add churches
 * Add events
 * Add worhips
 * 
 * Edit churches
 * Edit events
 * Edit worships
 */
function ChurchController($rootScope, $scope, $http, $filter, APP, API, flash, OrderService) {
	/**
	 * defaults data;
	 */
    var Address = function(){
        var isObject = this instanceof Address;
        /**
         * Garante que seja uma instancia de Address
         *
         * @param  {Boolean} isObject
         *
         * @return new Address
         */
        if (isObject === false) {
            return new Address();
        };


        this.number='';
        this.city='';
        this.district='';
        this.street='';
        this.hasStates=false;
        this.hasCities=false
        this.cities=[];

    };

    $scope.church = {
        addresses: []
    };

    $scope.contacts={};
    $scope.sendContacts=false;

	$scope.churches= {
            all: [],
            list: [],
            paginated: []
        };

     $scope.pagination= {
            perPage: 20,
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            pageNumbers: []
        };

	$scope.interaction= {
            visibleColumns: {'address':true, 'city':true},
            columnsToFilter: [],
            filterTerm: '',
            openComments: []
        };

    $scope.countries=[];
    $scope.states=[];
    $scope.address={
        'country':'',
        'state':''
    };

	$scope.controls= {
            select2: null,
        }

    var defaults={
        'country': 'Brazil'
    }


    /**
     * Adiciona um novo item
     *
     * @param  {string} path
     * @param  {object} dados
     * @param  {function} success
     * @param  {function} error
     * @param  {object} config
     *
     * @return success|error
     */
    $rootScope.post = function(path, dados, success, error, config) {
        config = config ? config : $rootScope.getHeaders();
        if (APP.debug) {
            console.log(config);
        }
        $http.post(path, dados, config).then(function(response) {
            if (APP.debug) {
                console.log(response);
            }

            if (typeof success=="function") {
                success(response);
            }
        }, function(response) {
            if (APP.debug) {
                console.log(response);
            }

            if (typeof error=="function") {
                error(response);
            }
        });
    }

    $rootScope.getHeaders=function()
    {
        return {
            headers: {
                    'Content-Type': 'application/json'
            }
        };
    }
    /**
     * Altera um item
     *
     * @param  {string} path
     * @param  {object} dados
     * @param  {function} success
     * @param  {function} error
     * @param  {object} config
     *
     * @return function
     */
    $rootScope.put = function(path, dados, success, error, config) {
        config = config ? config : $rootScope.getHeaders();
        $http.put(path, dados, config).then(function(response) {
            if (typeof success=="function") {
                success(response);
            }
        }, function(response) {
            if (typeof error=="function") {
                error(response);
            }
        });
    }

    /**
     * Apaga um item
     *
     * @param  {string} path
     * @param  {function} success
     * @param  {function} error
     * @param  {object} config
     *
     * @return function
     */
    $rootScope.delete = function(path, success, error, config) {
        config = config ? config : $rootScope.getHeaders();
        $http.delete(path, config).then(function(response) {
            if (typeof success=="function") {
                success(response);
            }
        }, function(response) {

            if (typeof error=="function") {
                error(response);
            }
        });
    }

    /**
     * Pega um ou mais itens
     *
     * @param  {string} path
     * @param  {function} success
     * @param  {function} error
     * @param  {object} config
     *
     * @return success|error
     */
    $rootScope.get = function(path, success, error, config) {
        config = config ? config : $rootScope.getHeaders();
        $http.get(path, config).then(function(response) {
            if (typeof success=="function") {
                success(response);
            }
        }, function(response) {

            if (typeof error=="function") {
                error(response);
            }
        });
    }

    $scope.churchEdit=function(data){
    	var church=angular.copy(data);

    }

    $scope.churchSave=function(data){
    	var church=angular.copy(data);
    	var save=$http.post;
    	var path=API.path+'churches/';

        if (church.name==undefined) {
            flash.warning('Informe o nome da igreja','AVISO!');
            return false;
        }

        if (church.addresses.length<1) {
            flash.warning('Informe pelo menos um endereço','AVISO!');
            return false;
        }

    	if (church.id!=undefined) {
    		save.$http.put;
    		path+=church.id;
    	}

    	if (APP.debug) {
    		console.log(church);
    		console.log(path);
    	}
        if (APP.debug) {
            console.log("######## DADOS PARA SEREM SALVOS");
            console.log(church);
        }
        flash.confirm(function(){
            save(path, church).then(function(response){
                $scope.church = {
                    addresses: []
                };

                $('.nav-tabs a[href="#tabIgreja"]').tab('show');
                jQuery("#modalChurches").modal('hide');
                $scope.addAddess();
    //            getAll();
                flash.success('Igreja Salva com sucesso! - Aguardando Aprovação','SUCESSO!');
            }, function(response){
                if (APP.debug) {
                    console.log(response.data);
                }
                var errors=[];
                    angular.forEach(response.data.message,function(error, key){
                        errors.push(key);
                    });
                flash.error('Houve uma falha ao tentar salvar a igreja, verifique se preencheu todos os dados do(s) endereço(s).','ERRO!');
            })

        },'Continuar?','SALVAR DADOS','Sim','Não');
    }

    $scope.setPaginationData= function(list)
        {
            var chunk    = _.chunk(list, $scope.pagination.perPage);

            $scope.churches.paginated = chunk;
            $scope.churches.list = chunk[0];

            $scope.pagination.currentPage = 1;
            $scope.pagination.totalItems = list.length;
            $scope.pagination.totalPages = Math.ceil(list.length / $scope.pagination.perPage);
            $scope.pagination.pageNumbers = _.range(1, $scope.pagination.totalPages+1);
            if (APP.debug) {
                console.log($scope.pagination.pageNumbers);
            }
        };

	$scope.page= function(page)
        {
            var self = this;

            $scope.pagination.currentPage = page;

            $scope.churches.list = $scope.churches.paginated[page-1];
        };

	$scope.next= function()
        {
            if($scope.pagination.currentPage == $scope.pagination.totalPages)
            {
                return false;
            }

            $scope.pagination.currentPage = $scope.pagination.currentPage+1;

            $scope.churches.list = $scope.churches.paginated[$scope.pagination.currentPage-1];
        };

	$scope.previous= function()
        {
            if($scope.pagination.currentPage == 1)
            {
                return false;
            }

            $scope.pagination.currentPage = $scope.pagination.currentPage-1;

            $scope.churches.list = $scope.churches.paginated[$scope.pagination.currentPage-1];
        };


	$scope.doResetAll= function()
        {
            $scope.interaction.visibleColumns = {'address':true, 'city':true};
            $scope.interaction.columnsToFilter = [];
            $scope.interaction.filterTerm = '';
            $scope.interaction.openComments = [];

            $scope.setPaginationData($scope.churches.all);

            OrderService.reset('churches');

            //$scope.controls.select2.val('').trigger('change');
        };

	$scope.doOpenComments= function(id)
        {
			var index = $scope.interaction.openComments.indexOf(id);

			/**
			 * trabalhar para colocar em angular isso
			 */
            if(index > -1)
            {
                $scope.interaction.openComments.splice(index,1);
            } else {
                $scope.interaction.openComments.push(id);
            }
        };

	$scope.openAllComments= function()
        {
            if($scope.interaction.openComments.length > 0)
            {
                $scope.interaction.openComments=[];
            } else {
                $scope.interaction.openComments= _.pluck($scope.churches.list, 'id');
            }
        };

	var getAll=function()
	{
		$rootScope.get(API.path+'addresses', function(response){
            if (APP.debug){
                console.log(response.data);
            }
            $scope.churches.all=response.data;

            $scope.setPaginationData(response.data);
		})

	}

	$scope.closeModal=function()
	{
        jQuery("#modalChurches").modal('hide');
        jQuery("#modalContacts").modal('hide');
	}

	/**
     * Ordena objetos
     */
    $scope.churchOrder = function(property) {
        var order = OrderService.get('churches', property);

        $scope.churches.all=$filter('orderBy')($scope.churches.all, order);
        $scope.setPaginationData($scope.churches.all);
    };

    /**
     * Ordem que está ordenado a propriedade
     */
    $scope.churchByOrder = function(property) {
        return OrderService.byOrder('churches', property);
    };


    $scope.controls.select2 = jQuery("#columnsToFilterSelect").select2({
        placeholder: 'Selecionar uma ou mais colunas para filtrar!'
    }).on('change', function()
    {
        $scope.interaction.columnsToFilter=jQuery("#columnsToFilterSelect").val();
    });

    var getCountries=function(defaultCountry, defaultState, defaultCity, address)
    {
        defaultCountry=defaultCountry||defaults.country;

        if (APP.debug) {
            console.log(APP.path+'countries/countries.json');
        }

        $rootScope.get(APP.path+'countries/countries.json', function(response){
            $scope.countries=response.data;
            if (address!=undefined) {
                address.country=angular.copy(defaults.country);
            }

            $scope.getState(defaults.country, defaultState, defaultCity, address);

            if (APP.debug) {
                console.log(response.data);
            }
        });
    }

    $scope.getState=function(data, defaultState, defaultCity, address)
    {
        if (APP.debug) {
            console.log(data);
        }

        var country=normalize(angular.copy(data));
        country=country.replace(" ","-").toLowerCase();

        $rootScope.get(APP.path+'countries/states/'+country+'.json', function(response){
            $scope.states=response.data;
            address.hasStates=true;
            if ( typeof defaultState!="undefined") {
                if (address!=undefined) {
                    address.state=angular.copy(defaultState);
                }
                $scope.getCities(defaultState, defaultCity, address);
            }
        },function(response){
            address.hasStates=false;
        });;
    }

    $scope.getCities=function(state, defaultCity, address)
    {
        if (APP.debug) {
            console.log(state);
        }

        if (state==undefined || typeof state!='string') {
            address.hasCities=false;
            address.city='';

            return false;
        }

        if (address.country!='Brazil') {
            address.hasCities=false;
            address.city='';

            return false;
        }

        if (APP.debug) {
            console.log("##### PATH #####");
            console.log(APP.path+'countries/cities/brazil.json');
        }
        $rootScope.get(APP.path+'countries/cities/brazil.json', function(response){
            var aux=response.data;

            aux=aux.filter(function(city){
                if (city.code==state) {
                    return city;
                }
            })

            if (APP.debug) {
                console.log("### CITIES ###");
                console.log(aux);
                console.log(aux[0].cities);
            }
            address.cities=[];
            var cities=[];
            angular.forEach(aux[0].cities, function(item){
                cities.push({
                    'name':item
                })
            });
            if (APP.debug) {
                console.log("### CITIES ###");
                console.log(cities);
            }            
            address.cities=cities;
            address.city='';
            address.hasCities=true;
            if ( typeof defaultCity!="undefined") {
                address.city=angular.copy(defaultCity);
            }
        },function(response){
            address.hasCities=false;
        });;
    }

    $scope.getCep=function(cep, index)
    {
        var address=this.address;
        address.numberId='number'+index;
        var aux = cep.replace(/[^0-9]+/g, "");
        if (aux != undefined && aux != "" && aux.length == 8) {
            $http.get('https://viacep.com.br/ws/' + aux + '/json/').then(function(response) {
                var aux = response.data;
                if (aux.erro == undefined) {
                    if (APP.debug){
                        console.log(aux);
                    }
                    getCountries('Brazil','BR-'+aux.uf, aux.localidade, address);
                    address.district=aux.bairro;
                    address.city=aux.localidade;
                    address.street=aux.logradouro;
                    angular.element("#"+address.numberId).trigger('focus');
                }
            }, function(response) {
                if (typeof error != "undefined") {
                    error(response.data);
                }
            });
        }
    }

    $scope.addAddess=function(selectTitle)
    {
        selectTitle=selectTitle || false;
        $scope.church.addresses.push(angular.copy(new Address()));
        if (selectTitle) {
             setTimeout(function(){
                $scope.showTab($scope.church.addresses.length);
                var title='title'+$scope.church.addresses.length;
                angular.element("#"+title).trigger('focus');
             }, 100);
             
        }
    }

    $scope.showTab=function(id)
    {
        $('.nav-tabs a[href="#tabEndereco_'+id+'"]').tab('show');
    }


    $scope.addAddess();

    getCountries(defaults.country, undefined, undefined, $scope.church.addresses[0]);


    $scope.deleteAddress=function(address)
    {
        var index=$scope.church.addresses.indexOf(address);
        $scope.church.addresses.splice(index,1);
    }

    $scope.sendContact=function(contact){
        if (contact.name==undefined || contact.name=='') {
            flash.warning('Informe seu nome','AVISO!');

            return;
        }

        if (contact.email==undefined || contact.email=='') {
            flash.warning('Informe seu email','AVISO!');

            return;
        }

        if (contact.comments==undefined || contact.comments=='') {
            flash.warning('Diga alguma coisa','AVISO!');

            return;
        }

        $scope.sendContacts=true;
        $rootScope.post(API.path+'contacts', contact, function(response){
            $scope.contacts={};
            jQuery("#modalContacts").modal('hide');
            flash.success('Sua mensagem foi enviada com sucesso!','Obrigado!');
            $scope.sendContacts=false;
        },function(response){
            $scope.sendContacts=false;
            jQuery("#modalContacts").modal('hide');
            flash.error('Houve uma falha no envio de sua mensgaem, por favor verifique os dados informados');

            if (APP.debug){
                console.log(response);
            }
        });
    }

    $scope.edit=function(church)
    {
        flash.warning('Funcionalidade de edição ainda não implementada.','NÃO DISPONÍVEL!');
    }

    getAll();
}
