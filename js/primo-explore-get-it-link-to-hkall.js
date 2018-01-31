app.controller('julacHKALLLinkController', [ 'angularLoad','MultipleViewItService', function (angularLoad,multipleViewItService) {
  let vm = this;
  vm.displayHKALL = displayHKALL;

  vm.getHKALLUrl = getHKALLUrl;


  function displayHKALL(){
    return vm.parentCtrl.service.serviceName==='activate' && vm.parentCtrl.isMashupLink();
  }
  function getHKALLUrl(){

    return multipleViewItService.getHkallUrl(vm.parentCtrl.item);

  }
}]);

app.component('julacLinkToHkall', {
    bindings: {parentCtrl: '<'},
    controller: 'julacHKALLLinkController',
    template: `

    <md-button class="md-raishkall-link" ng-if="$ctrl.displayHKALL()">
      <a target="_blank" ng-href="{{$ctrl.getHKALLUrl()}}">
        Request This item via HKALL
      </a>
    </md-button>





`
});
