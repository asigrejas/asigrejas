/**
 * App: As Igrejas V 1.0
 * @author Leandro Henrique Reis http://henriquereis.com
 *
 * Inspirados nas aulas de VueJs do Vedovelli vedcasts.com.br 
 * Alguns métodos e layout foram importados das aulas
 */
angular.module('appIgrejas', ['flashMessage', 'OrderService']).constant('APP', {
    name: 'As Igrejas V 1.0',
    debug: true,
    views: '/views/',
    path: '/'
}).constant('API', {
    //path: '//api.asigrejas.com/v1/',
    path: '//api.igrejas.dlocal.in/v1/'
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
	$scope.church = {};
	$scope.churches= {
            all: [],
            list: [],
            paginated: []
        };

     $scope.pagination= {
            perPage: 8,
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            pageNumbers: []
        };

	$scope.interaction= {
            visibleColumns: {'address':true, 'city':true, 'updated_at':true},
            columnsToFilter: [],
            filterTerm: '',
            openDetails: [],
            sortColumn: 'name',
            sortInverse: false,
        };
    $scope.countries=[];
    $scope.states=[];
    $scope.address={};
    $scope.hasStates=true;
    $scope.hasCities=true;

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
            if (AP.debug) {
                console.log(response);
            }
            success(response);
        }, function(response) {
            if (APP.debug) {
                console.log(response);
            }
            //Verifica se foi falha de permissão
            if ($rootScope.unauthenticated(response.data)) {
                return;
            }

            error(response);
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

        if (church.address==undefined) {
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

    	save(path, church).then(function(response){
            jQuery("#modalIgrejas").modal('show');
            flash.success('Igreja Salva com sucesso!');
            delete $scope.church.name;
            delete $scope.church.ministry;
            delete $scope.church.email;
            delete $scope.church.website;
            delete $scope.church.comments;
            delete $scope.church.phone1;
            delete $scope.church.phone2;
            delete $scope.church.phone3;
            delete $scope.church.address.zipcode;
            delete $scope.church.address.street;
            delete $scope.church.address.number;
            delete $scope.church.address.district;
    	}, function(response){
    		flash.error('Houve uma falha ao tentar salvar a igreja','ERRO!');
    	})
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
            $scope.interaction.visibleColumns = {'address':true, 'city':true, 'updated_at':true};
            $scope.interaction.columnsToFilter = [];
            $scope.interaction.filterTerm = '';
            $scope.interaction.openDetails = [];

            $scope.setPaginationData($scope.churches.all);

            $scope.controls.select2.val('').trigger('change');
        };

	$scope.doOpenDetails= function(id)
        {
			var index = self.interaction.openDetails.indexOf(id);

			/**
			 * trabalhar para colocar em angular isso
			 */
            if(index > -1)
            {
                $scope.interaction.openDetails.$remove(index);
            } else {
                $scope.interaction.openDetails.push(id);
            }
        };

	$scope.openAllDetails= function()
        {
            if($scope.interaction.openDetails.length > 0)
            {
                $scope.interaction.openDetails=[];
            } else {
                $scope.interaction.openDetails= _.pluck(self.churches.list, 'id');
            }
        };

	var getAll=function()
	{
		$http.get(API.path+'churches').then(function(response){
            if (APP.debug){
                console.log(response.data);
            }
            $scope.churches.all=response.data;

            $scope.setPaginationData(response.data);
		})

	}

	$scope.showModal=function()
	{
        jQuery("#modalIgrejas").modal('show');
	}

	/**
     * Ordena objetos
     */
    $scope.churchOrder = function(property) {
        var order = OrderService.get('churches', property);

        $scope.churches.list=$filter('orderBy')($scope.churches.list, order);
    };

    /**
     * Ordem que está ordenado a propriedade
     */
    $scope.churchByOrder = function(property) {
        return OrderService.byOrder('churches', property);
    };

    getAll();


    $scope.controls.select2 = jQuery("#columnsToFilterSelect").select2({
        placeholder: 'Selecionar uma ou mais colunas para filtrar!'
    }).on('change', function()
    {
        $scope.interaction.columnsToFilter=jQuery("#columnsToFilterSelect").val();
    });

    var getCountries=function()
    {
        if (APP.debug) {
            console.log(APP.path+'countries/countries.json');
        }

        $rootScope.get(APP.path+'countries/countries.json', function(response){
            $scope.countries=response.data;
            $scope.address.country=angular.copy(defaults.country);

            $scope.getState(defaults.country);

            if (APP.debug) {
                console.log(response.data);
            }
        });
    }

    $scope.getState=function(data)
    {
        if (APP.debug) {
            console.log(data);
        }

        var country=normalize(angular.copy(data));
        country=country.replace(" ","-").toLowerCase();

        $rootScope.get(APP.path+'countries/states/'+country+'.json', function(response){
            $scope.states=response.data;
            $scope.hasStates=true;
        },function(response){
            $scope.hasStates=false;
        });;
    }

    $scope.getCities=function(state)
    {
        if (APP.debug) {
            console.log(state);
        }

        $scope.address.city='';

        console.log(typeof state);
        if (state==undefined || typeof state!='string') {
            return false;
        }

        if ($scope.address.country!='Brazil') {
            $scope.hasCities=false;

            return false;
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
            $scope.cities=[];
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
            $scope.cities=cities;
            $scope.address.city='';
            $scope.hasCities=true;
        },function(response){
            $scope.hasCities=false;
        });;
    }

    getCountries();

}
