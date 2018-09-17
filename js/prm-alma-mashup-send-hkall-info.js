


app.controller('julacAddHkallInfoToOpenurlController', ['MultipleViewItService','$location', function (multipleViewItService,$location) {
    let vm = this;

    vm.$onInit = function () {

        this.parentCtrl.$rootScope.$watch(()=>this.parentCtrl.item, (newVal)=>{
            if (newVal && newVal.delivery.GetIt1 && newVal.delivery.GetIt1.length > 0 && newVal.delivery.GetIt1[0].links && newVal.delivery.GetIt1[0].links.length >0){
                let linkElement = newVal.delivery.GetIt1[0].links[0];
                if(linkElement.displayText === 'Almaviewit' || linkElement.displayText === 'Almagetit'){
                    if(linkElement.link.indexOf('hkall=true') === -1){
                        //if scope is hkall
                        let vidFromlocation = $location.search()['vid'];
                        let vidscopeFromLocation = $location.search()['search_scope'];
                        if(multipleViewItService.vidToInst[vidFromlocation].search_scope === vidscopeFromLocation){
                            linkElement.link+='&hkall=true';
                        }

                    }

                }

            }
            else{

            }
        });
        this.parentCtrl.$rootScope.$watch(()=>this.parentCtrl.item, (newVal)=>{
            if (newVal && newVal.delivery.GetIt2 && newVal.delivery.GetIt2.length > 0 && newVal.delivery.GetIt2[0].links && newVal.delivery.GetIt2[0].links.length >0){
                let linkElement = newVal.delivery.GetIt2[0].links[0];
                if(linkElement.displayText === 'Almaviewit' || linkElement.displayText === 'Almagetit'){
                    if(linkElement.link.indexOf('hkall=true') === -1){
                        //if scope is hkall
                        let vidFromlocation = $location.search()['vid'];
                        let vidscopeFromLocation = $location.search()['search_scope'];
                        if(multipleViewItService.vidToInst[vidFromlocation].search_scope === vidscopeFromLocation){
                            linkElement.link+='&hkall=true';
                        }

                    }

                }

            }
            else{

            }
        });

    }

}]);

app.component('julacAddHkallInfoToOpenurl', {
    bindings: {parentCtrl: '<'},
    controller: 'julacAddHkallInfoToOpenurlController',
    template: `

`
});
