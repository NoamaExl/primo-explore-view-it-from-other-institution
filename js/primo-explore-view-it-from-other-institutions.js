
/*
The constroller and component definitions for the view-it list of instituions
Still missing in the html the arrow links
*/

app.controller('julacViewItFromOtherInstController', [ 'angularLoad','MultipleViewItService', function (angularLoad,multipleViewItService) {
    let vm = this;
    vm.displayExpand = displayExpand;
    vm.otherInstList = [];
    vm.getInstitutions = getInstitutions;
    vm.getSelectedTab = getSelectedTab;
    vm.setSelectedTab = setSelectedTab;
    vm.getLinks = getLinks;
    vm.loadMashup = loadMashup;
    vm.unloadMashup = unloadMashup;
    vm.iframeResize = iframeResize;


    vm.TABS = {
		      INST_LIST : 0,
		      MASHUP: 1
	   };
	vm._selectedTab = vm.TABS.INST_LIST;
	vm._selectedLinks = [];





  function iframeResize(){
      iFrameResize({log:false,checkOrigin:false},'.mashup-iframe-more');
  }

	function getInstitutions(){
		return vm.otherInstList || [];
	}

	function getSelectedTab() {
		return vm._selectedTab;
	}
	function setSelectedTab(tab) {
		vm._selectedTab = tab;
	}

	function getLinks(){
		return vm._selectedLinks || [];
	}

	function loadMashup(almaInst){
		vm._selectedLinks = almaInst.getitLink;
	}

	function unloadMashup(){
		vm._selectedLinks = [];
	}




    vm.$onInit = function () {
      angularLoad.loadScript('https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/3.5.1/iframeResizer.min.js').then(function () {
        if(vm.parentCtrl.service.serviceName==='activate'){
           multipleViewItService.getInstList(vm.parentCtrl.item).then(
            (instList) => {
              vm.otherInstList = instList;
          });;

        }
      });

    }



    function displayExpand(){
      let displayElement = vm.parentCtrl.service.serviceName==='activate'
      && (vm.parentCtrl.service.linkElement.links[0].displayText === 'Almaviewit' ||
          (!multipleViewItService.displayElementViewIt && vm.parentCtrl.service.linkElement.links[0].displayText === 'Almagetit'))
      && vm.parentCtrl.service.linkElement.links[0].link !== ''
      && this.otherInstList.length > 0;

      if(displayElement){
        if(!multipleViewItService.displayElementViewIt && vm.parentCtrl.service.linkElement.links[0].displayText === 'Almagetit'){
          return true;
        }
        multipleViewItService.displayElementViewIt = true;
        let mainViewItInstitution = vm.parentCtrl.service.linkElement.links[0].oraginization;
      }
      return displayElement;
    }
}]);





app.component('julacViewItFromOtherInst', {
    bindings: {parentCtrl: '<'},
    controller: 'julacViewItFromOtherInstController',
    template: `
    <div class="other-instituions-view-ir" ng-if="$ctrl.displayExpand()">
    <!-- <prm-service-header title="nui.brief.results.tabs.getit_other"></prm-service-header> -->

    <h3 class="medium-uppercase-bold ">
        <span translate="nui.brief.results.tabs.View_It_In_Other_Institutions_-_Please_Sign_in_Or_Be_On_Campus_To_Access_The_Full_Text"></span>
    </h3>

      <md-tabs md-dynamic-height md-selected="$ctrl.getSelectedTab()" class="tabs-as-app hidden-tabs">
          <md-tab label="Institutions List" id="{{$ctrl.TABS.INST_LIST}}">
              <md-content>
                  <md-list>
                      <md-list-item class="md-2-line separate-list-items narrow-list-item" ng-repeat="almaInst in $ctrl.getInstitutions()">
                          <md-button class="neutralized-button layout-full-width layout-display-flex" ng-click="$ctrl.setSelectedTab($ctrl.TABS.MASHUP); $ctrl.loadMashup(almaInst)">
                          	<div layout="row" flex="100" layout-align="space-between center">
      	                        <div class="md-list-item-text">
      	                            <h3 translate="{{almaInst.inst}}"></h3>
      	                            <p>
              	                        <span class="availability-status {{almaInst.availabilityStatus}}"
                                                translate="fulldisplay.availabilty.{{almaInst.availabilityStatus}}">
              	                        </span>
      	                            </p>
      	                        </div>

      	                        <prm-icon
      	                                icon-type="{{$ctrl.opacLocations.rightArrow.type}}"
      	                                svg-icon-set="{{$ctrl.opacLocations.rightArrow.iconSet}}"
      	                                icon-definition="{{$ctrl.opacLocations.rightArrow.icon}}">
      	                        </prm-icon>
                              </div>
                          </md-button>
                      </md-list-item>

                      <!--
                      <md-button
                              ng-if="!$ctrl.currLoc.locationNoItems && $ctrl.currLoc.isMore"
                              class="show-more-button zero-margin"
                              ng-click="$ctrl.getlocationsItems($ctrl.currLoc, true);"
                              ng-hide="!$ctrl.currLoc.isMore">
                          <span translate="fulldisplay.locations.showmore"></span>
                      </md-button>
                      -->

                  </md-list>
              </md-content>
          </md-tab>

          <md-tab label="Alma Mashup" id="{{$ctrl.TABS.MASHUP}}">
              <md-button ng-click="$ctrl.setSelectedTab($ctrl.TABS.INST_LIST); $ctrl.unloadMashup()"
                         class="back-button button-with-icon zero-margin">

                  <prm-icon  icon-type="{{$ctrl.opacLocations.leftArrow.type}}"
                             svg-icon-set="{{$ctrl.opacLocations.leftArrow.iconSet}}"
                             icon-definition="{{$ctrl.opacLocations.leftArrow.icon}}">
                  </prm-icon>
                  <span translate="nui.getit_other.back"></span>
              </md-button>
              <iframe iframe-onload="{{::$ctrl.iframeResize()}}" ng-if="$ctrl.getLinks()" class="mashup-iframe-more" ng-src="{{$ctrl.getLinks()}}" style="width:100%;border:none;"/>
              </iframe>
          </md-tab>
      </md-tabs>

    </div>


`
});
