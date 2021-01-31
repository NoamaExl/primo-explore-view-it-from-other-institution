app.controller('julacHKALLLinkController', [ 'angularLoad','MultipleViewItService', function (angularLoad,multipleViewItService) {
  let vm = this;
  vm.displayHKALL = displayHKALL;

  vm.getHKALLUrl = getHKALLUrl;
  vm.$onInit = function () {
    if(vm.displayHKALL()){      
      multipleViewItService.getHkallUrl(vm.parentCtrl.item).then((url)=>{
        vm.hkallurl = url;
      });
    }

  }

  function displayHKALL(){
    return vm.parentCtrl.service.serviceName==='activate' && vm.parentCtrl.isMashupLink() ;
  }
  function getHKALLUrl(){
    return vm.hkallurl;
  }
}]);

app.component('julacLinkToHkall', {
    bindings: {parentCtrl: '<'},
    controller: 'julacHKALLLinkController',
    template: `

    <md-button class="md-raised hkall-link" ng-if="$ctrl.displayHKALL() && $ctrl.getHKALLUrl()">
      <a target="_blank" ng-href="{{::$ctrl.getHKALLUrl()}}">
        Request This item via HKALL
      </a>
    </md-button>





`
});
