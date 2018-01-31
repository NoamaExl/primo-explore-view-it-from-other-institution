(function(){
"use strict";
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var app = angular.module('viewCustom', ['angularLoad']).constant('_', window._);;

/*
This service holds various methods to fetch the institutions list
and to vreate the view-it links for each institution

*/

app.service('MultipleViewItService', ['restBaseURLs', '$http', '$location', '$httpParamSerializer', '$sce', '$q', function (restBaseURLs, $http, $location, $httpParamSerializer, $sce, $q) {
  var vm = this;
  vm.getInstList = getInstList;
  vm.getDeliveryResponse = getDeliveryResponse;
  vm.getIframeLink = getIframeLink;
  vm.getHkallUrl = getHkallUrl;
  vm.getJwt = getJwt;
  vm.fixLink = fixLink;
  vm.getLinkE = getLinkE;
  vm.displayElementViewIt = false;

  function getHkallUrl(item) {
    var recId = item.pnx.control.recordid[0];

    var frbrGrp = '';
    var frbrFacet = '';
    if (item.pnx.facets.frbrgroupid && item.pnx.facets.frbrgroupid[0]) {
      frbrGrp = item.pnx.facets.frbrgroupid[0];
      frbrFacet = '&facet=frbrgroupid,include,' + frbrGrp;
    }
    return $sce.trustAsResourceUrl('https://julac.hosted.exlibrisgroup.com/primo-explore/fulldisplay?docid=' + recId + '&context=P2P&vid=HKALL&lang=en_US&search_scope=default_scope&adaptor=HKALL_PTP2&tab=default_tab&query=any,contains,' + recId + '&sortby=date&offset=0' + frbrFacet);
  }

  function getIframeLink(item, institution) {
    var _this = this;

    var deliverySection = item.delivery;

    var linkE = undefined;

    return $q(function (resolve, reject) {
      linkE = _this.getLinkE(deliverySection);
      if (!linkE) {
        //there is no view it for this institution
        //will calculate the jwt for the ALMA-E institution and get the Delivbery Response
        var linkPromise = vm.getJwt(institution).then(function (jwtResponse) {
          var jwt = jwtResponse;
          vm.getDeliveryResponse(item, institution, jwt).then(function (dResponse) {
            linkE = _this.getLinkE(dResponse.docs[0].delivery);
            resolve(fixLink(linkE, institution));
          });
        });
      }
      if (linkE && linkE.link) {
        resolve(fixLink(linkE, institution));
      }
    });
  }
  function fixLink(linkE, institution) {
    var _instReplace;

    var instReplace = (_instReplace = {
      'HKU_ALMA': '852JULAC_HKU',
      'CUHK_ALMA': '852JULAC_CUHK',
      'CUH_ALMA': '852JULAC_CUH',
      'EDUHK_ALMA': '852JULAC_EDUHK',
      'HKBU_ALMA': '852JULAC_HKBU',
      'HKPU_ALMA': '852JULAC_HKPU',
      'HKUST_ALMA': '852JULAC_HKUST'
    }, _defineProperty(_instReplace, 'HKU_ALMA', '852JULAC_HKU'), _defineProperty(_instReplace, 'JULAC_NETWORK', '852JULAC_NETWORK'), _defineProperty(_instReplace, 'LUN_ALMA', '852JULAC_LUN'), _instReplace);
    var decodedLink = decodeURI(linkE.link);
    decodedLink = decodedLink.replace("%3A%2F%2F", "://");
    decodedLink = decodedLink.replace(/(\/view\/uresolver\/)(.*)(\/openurl\?)/, "$1" + instReplace[institution] + "$3");
    return $sce.trustAsResourceUrl(encodeURI(decodedLink) + '&is_new_ui=true&Force_direct=false');
  }
  function getLinkE(deliverySection) {
    var linkE = undefined;
    var delCategories = deliverySection.GetIt1.map(function (line) {
      if (line.category === 'Alma-E') {
        if (line.links) {
          if (!linkE) {
            linkE = line.links[0];
          }
        }
      }
    });
    if (!linkE) {
      if (deliverySection.GetIt2) {
        delCategories = deliverySection.GetIt2.map(function (line) {
          if (line.category === 'Alma-E') {
            if (line.links) {
              if (!linkE) {
                linkE = line.links[0];
              }
            }
          }
        });
      }
    }
    return linkE;
  }
  function getDeliveryResponse(item, institution, jwt) {
    var dummy = [];
    var params = $httpParamSerializer($location.search());
    params = params.replace('query=', 'q=').replace('search_scope=', 'scope=');
    params += '&inst=' + institution + '&skipAuth=true';
    var clonedItem = angular.copy(item);

    var deliveryServiceUrl = '/primo_library/libweb/webservices/rest/primo-explore/v1/pnxs/delivery?' + params;

    var dataToBeSent = {
      "records": [clonedItem]
    };
    var conf = {
      url: deliveryServiceUrl,
      skipAuthorization: true,
      method: 'POST',
      data: dataToBeSent,
      headers: { 'Authorization': 'Bearer ' + jwt }
    };
    var deliveryPromise = $http(conf).then(function (response) {
      return response.data;
    });
    return deliveryPromise;
  }

  function getJwt(institution) {
    var lang = $location.search()['lang'];
    var instToVid = {
      'CUHK_ALMA': 'CUHK',
      'CUH_ALMA': 'CUH',
      'EDUHK_ALMA': 'EDUHK',
      'HKBU_ALMA': 'HKBU',
      'HKPU_ALMA': 'HKPU',
      'HKUST_ALMA': 'HKUST',
      'HKU_ALMA': 'HKU',
      'JULAC_NETWORK': 'HKALL',
      'LUN_ALMA': 'LUN'
    };
    var vid = instToVid[institution];
    var dataToBeSent = {
      targetUrl: encodeURIComponent($location.absUrl()),
      viewId: vid,
      lang: lang ? lang : 'en_US'
    };
    var conf = {
      url: '/primo_library/libweb/webservices/rest/v1/guestJwt/' + institution,
      // This makes it so that this request doesn't send the JWT
      skipAuthorization: true,
      method: 'GET',
      params: dataToBeSent
    };
    var jwtPromise = $http(conf).then(function (response) {
      return response.data;
    });
    return jwtPromise;
  }

  function getInstList(item) {
    var _this2 = this;

    return $q(function (resolve, reject) {

      var instituionList = [];
      var values = {};
      var promiseArray = item.pnx.delivery.delcategory.map(function (line) {
        var mapping = {
          I: 'institution',
          V: 'label',
          O: 'orig'
        };
        var splitted = line.split('$$');
        if (splitted.length > 1) {
          splitted.forEach(function (element) {
            var code = element.substring(0, 1);
            var value = element.substring(1);
            if (mapping[code]) {
              values[mapping[code]] = value;
            } else {
              //No $$V
              values['label'] = element;
            }
          });
          var code = values['label'];
          var institution = values['institution'];
          var inst = {};

          if (code === 'Alma-E') {
            return _this2.getIframeLink(item, institution).then(function (link) {
              inst['inst'] = institution;
              inst['availabilityStatus'] = 'check_holdings';
              inst['getitLink'] = link;
              if (instituionList.filter(function (e) {
                return e.inst === institution;
              }).length === 0) {
                instituionList.push(inst);
              }
            });
          } else {
            return $q(function (resolve) {
              resolve();
            });
          }
        }
      });
      $q.all(promiseArray).then(function () {
        resolve(instituionList);
      });
    });
  }
}]);

app.controller('julacHKALLLinkController', ['angularLoad', 'MultipleViewItService', function (angularLoad, multipleViewItService) {
  var vm = this;
  vm.displayHKALL = displayHKALL;

  vm.getHKALLUrl = getHKALLUrl;

  function displayHKALL() {
    return vm.parentCtrl.service.serviceName === 'activate' && vm.parentCtrl.isMashupLink();
  }
  function getHKALLUrl() {

    return multipleViewItService.getHkallUrl(vm.parentCtrl.item);
  }
}]);

app.component('julacLinkToHkall', {
  bindings: { parentCtrl: '<' },
  controller: 'julacHKALLLinkController',
  template: '\n\n    <md-button class="md-raishkall-link" ng-if="$ctrl.displayHKALL()">\n      <a target="_blank" ng-href="{{$ctrl.getHKALLUrl()}}">\n        Request This item via HKALL\n      </a>\n    </md-button>\n\n\n\n\n\n'
});

/*
The constroller and component definitions for the view-it list of instituions
Still missing in the html the arrow links
*/

app.controller('julacViewItFromOtherInstController', ['angularLoad', 'MultipleViewItService', function (angularLoad, multipleViewItService) {
  var vm = this;
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
    INST_LIST: 0,
    MASHUP: 1
  };
  vm._selectedTab = vm.TABS.INST_LIST;
  vm._selectedLinks = [];

  function iframeResize() {
    iFrameResize({ log: false, checkOrigin: false }, '.mashup-iframe-more');
  }

  function getInstitutions() {
    return vm.otherInstList || [];
  }

  function getSelectedTab() {
    return vm._selectedTab;
  }
  function setSelectedTab(tab) {
    vm._selectedTab = tab;
  }

  function getLinks() {
    return vm._selectedLinks || [];
  }

  function loadMashup(almaInst) {
    vm._selectedLinks = almaInst.getitLink;
  }

  function unloadMashup() {
    vm._selectedLinks = [];
  }

  vm.$onInit = function () {
    angularLoad.loadScript('https://cdnjs.cloudflare.com/ajax/libs/iframe-resizer/3.5.1/iframeResizer.min.js').then(function () {
      if (vm.parentCtrl.service.serviceName === 'activate') {
        multipleViewItService.getInstList(vm.parentCtrl.item).then(function (instList) {
          vm.otherInstList = instList;
        });;
      }
    });
  };

  function displayExpand() {
    var displayElement = vm.parentCtrl.service.serviceName === 'activate' && (vm.parentCtrl.service.linkElement.links[0].displayText === 'Almaviewit' || !multipleViewItService.displayElementViewIt && vm.parentCtrl.service.linkElement.links[0].displayText === 'Almagetit') && vm.parentCtrl.service.linkElement.links[0].link !== '' && this.otherInstList.length > 0;

    if (displayElement) {
      if (!multipleViewItService.displayElementViewIt && vm.parentCtrl.service.linkElement.links[0].displayText === 'Almagetit') {
        return true;
      }
      multipleViewItService.displayElementViewIt = true;
      var mainViewItInstitution = vm.parentCtrl.service.linkElement.links[0].oraginization;
    }
    return displayElement;
  }
}]);

app.component('julacViewItFromOtherInst', {
  bindings: { parentCtrl: '<' },
  controller: 'julacViewItFromOtherInstController',
  template: '\n    <div class="other-instituions-view-ir" ng-if="$ctrl.displayExpand()">\n    <!-- <prm-service-header title="nui.brief.results.tabs.getit_other"></prm-service-header> -->\n\n    <h3 class="medium-uppercase-bold ">\n        <span translate="nui.brief.results.tabs.View_It_In_Other_Institutions_-_Please_Sign_in_Or_Be_On_Campus_To_Access_The_Full_Text"></span>\n    </h3>\n\n      <md-tabs md-dynamic-height md-selected="$ctrl.getSelectedTab()" class="tabs-as-app hidden-tabs">\n          <md-tab label="Institutions List" id="{{$ctrl.TABS.INST_LIST}}">\n              <md-content>\n                  <md-list>\n                      <md-list-item class="md-2-line separate-list-items narrow-list-item" ng-repeat="almaInst in $ctrl.getInstitutions()">\n                          <md-button class="neutralized-button layout-full-width layout-display-flex" ng-click="$ctrl.setSelectedTab($ctrl.TABS.MASHUP); $ctrl.loadMashup(almaInst)">\n                          \t<div layout="row" flex="100" layout-align="space-between center">\n      \t                        <div class="md-list-item-text">\n      \t                            <h3 translate="{{almaInst.inst}}"></h3>\n      \t                            <p>\n              \t                        <span class="availability-status {{almaInst.availabilityStatus}}"\n                                                translate="fulldisplay.availabilty.{{almaInst.availabilityStatus}}">\n              \t                        </span>\n      \t                            </p>\n      \t                        </div>\n\n      \t                        <prm-icon\n      \t                                icon-type="{{$ctrl.opacLocations.rightArrow.type}}"\n      \t                                svg-icon-set="{{$ctrl.opacLocations.rightArrow.iconSet}}"\n      \t                                icon-definition="{{$ctrl.opacLocations.rightArrow.icon}}">\n      \t                        </prm-icon>\n                              </div>\n                          </md-button>\n                      </md-list-item>\n\n                      <!--\n                      <md-button\n                              ng-if="!$ctrl.currLoc.locationNoItems && $ctrl.currLoc.isMore"\n                              class="show-more-button zero-margin"\n                              ng-click="$ctrl.getlocationsItems($ctrl.currLoc, true);"\n                              ng-hide="!$ctrl.currLoc.isMore">\n                          <span translate="fulldisplay.locations.showmore"></span>\n                      </md-button>\n                      -->\n\n                  </md-list>\n              </md-content>\n          </md-tab>\n\n          <md-tab label="Alma Mashup" id="{{$ctrl.TABS.MASHUP}}">\n              <md-button ng-click="$ctrl.setSelectedTab($ctrl.TABS.INST_LIST); $ctrl.unloadMashup()"\n                         class="back-button button-with-icon zero-margin">\n\n                  <prm-icon  icon-type="{{$ctrl.opacLocations.leftArrow.type}}"\n                             svg-icon-set="{{$ctrl.opacLocations.leftArrow.iconSet}}"\n                             icon-definition="{{$ctrl.opacLocations.leftArrow.icon}}">\n                  </prm-icon>\n                  <span translate="nui.getit_other.back"></span>\n              </md-button>\n              <iframe iframe-onload="{{::$ctrl.iframeResize()}}" ng-if="$ctrl.getLinks()" class="mashup-iframe-more" ng-src="{{$ctrl.getLinks()}}" style="width:100%;border:none;"/>\n              </iframe>\n          </md-tab>\n      </md-tabs>\n\n    </div>\n\n\n'
});

/*
The definition for the after directive that is implemnted in the other
component
Note:
<julac-link-to-hkall parent-ctrl="$ctrl.parentCtrl"></julac-link-to-hkall>
is in development and can be added once completed
*/

app.component('prmFullViewServiceContainerAfter', {
  bindings: { parentCtrl: '<' },
  template: '\n               <julac-view-it-from-other-inst parent-ctrl="$ctrl.parentCtrl"></julac-view-it-from-other-inst>\n    '
});
})();