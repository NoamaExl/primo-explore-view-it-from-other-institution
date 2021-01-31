
/*
 This service holds various methods to fetch the institutions list
 and to vreate the view-it links for each institution

 */

app.service('MultipleViewItService', ['restBaseURLs','$http','$location','$httpParamSerializer','$sce','$q','$stateParams',function (restBaseURLs,$http,$location,$httpParamSerializer,$sce,$q,$stateParams) {
    let vm = this;
    vm.getInstList = getInstList;
    vm.getDeliveryResponse = getDeliveryResponse;
    vm.getIframeLink = getIframeLink
    vm.getHkallUrl = getHkallUrl;
    vm.getJwt = getJwt;
    vm.fixLink = fixLink;
    vm.getLinkE = getLinkE;
    vm.displayElementViewIt = false;
    vm.vidToInst={
        'CUHK':{Inst:'CUHK_ALMA',tab:'hkall_tab',search_scope:'HKALL_PTP2'},
        'CUH':{Inst:'CUH_ALMA',tab:'default_tab',search_scope:'HKALL'},
        'EDUHK':{Inst:'EDUHK_ALMA',tab:'default_tab',search_scope:'HKALL'},
        'HKBU':{Inst:'HKBU_ALMA',tab:'HKALL',search_scope:'HKALL'},
        'HKPU':{Inst:'HKPU_ALMA',tab:'default_tab',search_scope:'HKALL'},
        'HKUST':{Inst:'HKUST_ALMA',tab:'default_tab',search_scope:'HKUST_catalog_primo'},
        'HKU':{Inst:'HKU_ALMA',tab:'HKALL',search_scope:'HKALL'},
        'HKALL':{Inst:'JULAC_NETWORK',tab:'default_tab',search_scope:'default_scope'},
        'LUN':{Inst:'LUN_ALMA',tab:'hkall',search_scope:'HKALL'}
    };
    function getHkallUrl(item){



        let vid = $location.search()['vid'];
        let mmsid = item.pnx.control.sourcerecordid[0];
        let mapping = {
            I: 'institution',
            V: 'label',
            O: 'orig'
        };
        let splitted = mmsid.split('$$');
        let values={};
        if (splitted.length > 1) {
            splitted.forEach(function (element) {
                let code = element.substring(0, 1);
                let value = element.substring(1);
                if (mapping[code]) {
                    values[mapping[code]] = value;
                } else {//No $$V
                    values['label'] = element;
                }
            });
            mmsid = values['label'];
        }





        let currentScope = $stateParams['search_scope'];
        let sparams={          vid: $stateParams['vid'],
            q: 'any,contains,'+mmsid,
            scope: vm.vidToInst[$stateParams['vid']]['search_scope'],
            tab: $stateParams['tab'],
            sortby: $stateParams['sortby'],
            facet: $stateParams['facet'],
            mode: $stateParams['mode'],
            pfilter: $stateParams['pfilter'],
            offset: $stateParams['offset'],
            journals: $stateParams['journals'],
            databases: $stateParams['databases'],
            pcAvailability: $stateParams['pcAvailability'],
            inst: vm.vidToInst[$stateParams['vid']]['Inst']
        };


        let conf = {
            url: '/primo_library/libweb/webservices/rest/primo-explore/v1/pnxs',
            method: 'GET',
            params: sparams
        };
        let hkallTab = vm.vidToInst[$stateParams['vid']]['tab'];
        let hkallScope = vm.vidToInst[$stateParams['vid']]['search_scope'];

        if(currentScope === vm.vidToInst[$stateParams['vid']]['search_scope']){
            return $q((resolve, reject)=>{

            resolve(undefined);
        });
        }
        let searchPromise = $http(conf).then((response) => {
                let itemS = response.data.docs;
        let frbrGrp = '';
        let frbrFacet = '';
        if(itemS && itemS.length > 0){
            if(itemS[0].pnx.facets.frbrgroupid && itemS[0].pnx.facets.frbrgroupid[0]){
                frbrGrp = itemS[0].pnx.facets.frbrgroupid[0];
                frbrFacet = 'facet_frbrgroupid,exact,'+frbrGrp
                conf.params.qInclude = frbrFacet;
                let searchFrbrPromise = $http(conf).then((response) => {
                        let itemFrbr = response.data.docs;
                return createHKALLLink(itemFrbr,mmsid,hkallTab,hkallScope);
            });
            }
            return createHKALLLink(itemS,mmsid,hkallTab,hkallScope);
        }
        return createHKALLLink([item],mmsid,hkallTab,hkallScope);
        /*return undefined;*/

    });
        return searchPromise;


    }

    function createHKALLLink(item,mmsid,tab,hkallScope){
        return $q((resolve, reject)=>{
                item.forEach(function(element){
                let almaIds = element.pnx.control.almaid;
                almaIds.forEach(function(almaId){
                    if (almaId.indexOf(':'+mmsid) > -1){
                        let recId = element.pnx.control.recordid[0];
                        if(almaId.indexOf('$$O') > -1){//dedup
                            recId= almaId.split('$$O')[1];
                        }
                        let url = $sce.trustAsResourceUrl('/primo-explore/fulldisplay?docid='+recId+'&context=P2P&vid='+$stateParams['vid']+'&lang=en_US&search_scope='+hkallScope+'&adaptor=HKALL_PTP2&tab='+tab+'&query=any,contains,'+recId+'&sortby=date&offset=0');
                        resolve(url);
                    }
                })
            });
        resolve('');
    });
    }

    function getIframeLink(item,institution){

        let deliverySection = item.delivery;

        let linkE = undefined;


        return $q((resolve, reject)=>{
            linkE = this.getLinkE(deliverySection);
        if(!linkE){//there is no view it for this institution
            //will calculate the jwt for the ALMA-E institution and get the Delivbery Response
            let linkPromise = vm.getJwt(institution).then(
                    (jwtResponse) => {
                    let jwt = jwtResponse;
            vm.getDeliveryResponse(item,institution,jwt).then(
                (dResponse) => {
                linkE = this.getLinkE(dResponse.docs[0].delivery);
            resolve(fixLink(linkE,institution));
        });
        });
        }
        if(linkE && linkE.link){
            resolve(fixLink(linkE,institution));
        }
    });

    }
    function fixLink(linkE, institution){
        let instReplace = {
            'HKU_ALMA' : '852JULAC_HKU',
            'CUHK_ALMA' : '852JULAC_CUHK',
            'CUH_ALMA' : '852JULAC_CUH',
            'EDUHK_ALMA' : '852JULAC_EDUHK',
            'HKBU_ALMA' : '852JULAC_HKBU',
            'HKPU_ALMA' : '852JULAC_HKPU',
            'HKUST_ALMA' : '852JULAC_HKUST',
            'HKU_ALMA' : '852JULAC_HKU',
            'JULAC_NETWORK' : '852JULAC_NETWORK',
            'LUN_ALMA' : '852JULAC_LUN'
        }
        let decodedLink = decodeURI(linkE.link);
        decodedLink = decodedLink.replace("%3A%2F%2F","://");
        decodedLink = decodedLink.replace(/(\/view\/uresolver\/)(.*)(\/openurl\?)/, "$1" + instReplace[institution] + "$3");
        return $sce.trustAsResourceUrl(encodeURI(decodedLink) + '&is_new_ui=true&Force_direct=false');
    }
    function getLinkE(deliverySection){
        let linkE = undefined;
        let delCategories = deliverySection.GetIt1.map(
                (line) => {
                if(line.category === 'Alma-E'){
            if(line.links){
                if(!linkE){
                    linkE = line.links[0];
                }
            }
        }
    });
        if(!linkE){
            if(deliverySection.GetIt2){
                delCategories = deliverySection.GetIt2.map(
                        (line) => {
                        if(line.category === 'Alma-E'){
                    if(line.links){
                        if(!linkE){
                            linkE = line.links[0];
                        }
                    }
                }
            });
            }

        }
        return linkE;
    }

    function calcParams(institution){
        let params = $httpParamSerializer($location.search());
        params = params.replace('query=','q=').replace('search_scope=','scope=');
        if(params.indexOf("&q=") === -1 && params.indexOf("q=") !== 0){
            params += '&q=any,contains,'+$location.search().docid;
        }
        if(institution){
            params += '&inst=' + institution +'&skipAuth=true';
        }
        return params;
    }
    
    function getDeliveryResponse(item,institution,jwt){
        let dummy =[];
        let params = calcParams(institution);
        let clonedItem = angular.copy(item);

        let deliveryServiceUrl = '/primo_library/libweb/webservices/rest/primo-explore/v1/pnxs/delivery?'+ params;

        let dataToBeSent = {
            "records":[clonedItem]
        };
        let conf = {
            url: deliveryServiceUrl,
            skipAuthorization: true,
            method: 'POST',
            data: dataToBeSent,
            headers: {'Authorization': 'Bearer '+ jwt}
        };
        let deliveryPromise= $http(conf).then((response) => {
                return response.data;
    });
        return deliveryPromise;

    }



    function getJwt(institution){
        let lang = $location.search()['lang'];
        let instToVid={
            'CUHK_ALMA':'CUHK',
            'CUH_ALMA':'CUH',
            'EDUHK_ALMA':'EDUHK',
            'HKBU_ALMA':'HKBU' ,
            'HKPU_ALMA':'HKPU',
            'HKUST_ALMA':'HKUST',
            'HKU_ALMA':'HKU',
            'JULAC_NETWORK':'HKALL',
            'LUN_ALMA':'LUN'
        }
        let vid = instToVid[institution];
        let dataToBeSent = {
            targetUrl: encodeURIComponent($location.absUrl()),
            viewId: vid,
            lang: lang ? lang : 'en_US'
        };
        let conf = {
            url: '/primo_library/libweb/webservices/rest/v1/guestJwt/' +
            institution,
            // This makes it so that this request doesn't send the JWT
            skipAuthorization: true,
            method: 'GET',
            params: dataToBeSent
        };
        let jwtPromise = $http(conf).then((response) => {
                return response.data;
    });
        return jwtPromise;
    }


    function getInstList(item){
        return $q((resolve, reject)=>{

                let instituionList = [];
        let values = {};
        let promiseArray = item.pnx.delivery.delcategory.map(
                (line) => {
                let mapping = {
                    I: 'institution',
                    V: 'label',
                    O: 'orig'
                };
        let splitted = line.split('$$');
        if (splitted.length > 1) {
            splitted.forEach(function(element){
                let code = element.substring(0,1);
                let value = element.substring(1);
                if(mapping[code]){
                    values[mapping[code]] = value;
                }else{//No $$V
                    values['label'] = element;
                }
            });
            let code = values['label'];
            let institution = values['institution'];
            let inst = {}

            if(code === 'Alma-E' && institution){
                return this.getIframeLink(item,institution).then((link) => {
                        inst['inst'] = institution;
                inst['availabilityStatus'] = 'check_holdings';
                inst['getitLink'] = link;
                if (instituionList.filter(e => e.inst === institution).length === 0) {
                    instituionList.push(inst);
                }
            });

            }
            else{
                return $q((resolve)=>{resolve()});
            }
        }
    });
        $q.all(promiseArray).then(()=>{
            resolve(instituionList);
    });
    });


    }
}]);
