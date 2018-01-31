
/*
The definition for the after directive that is implemnted in the other
component
Note:
<julac-link-to-hkall parent-ctrl="$ctrl.parentCtrl"></julac-link-to-hkall>
is in development and can be added once completed
*/

app.component('prmFullViewServiceContainerAfter', {
    bindings: {parentCtrl: '<'},
    template: `
               <julac-view-it-from-other-inst parent-ctrl="$ctrl.parentCtrl"></julac-view-it-from-other-inst>
    `
});
