window.onerror = function (e, fileName, lineNumber) {
    alert(fileName + 'Line: ' + lineNumber + 'Error: ' + e.message);
};

var LIGHT_SERVICE = 'BBC0';
var LIGHT_CHARACTERISTIC = 'BBC1';
var BUZZER_CHARACTERISTIC = 'BBC2';
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        this.showMainPage();
    },
    // Bind any events that are required on startup.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('backbutton', app.onBackButton, false);
        deviceList.addEventListener('click', this.connect, false);
        refreshButton.addEventListener('click', this.refreshDeviceList, false);
        onButton.addEventListener('click', this.switchOn, false);
        offButton.addEventListener('click', this.switchOff, false);
        disconnectButton.addEventListener('click', this.disconnect, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'refreshDeviceList'
    // function, we must explicitly call 'app.refreshDeviceList(...);'
    onDeviceReady: function() {
        FastClick.attach(document.body); // https://github.com/ftlabs/fastclick
        app.refreshDeviceList();
    },
    refreshDeviceList: function(){
        deviceList.innerHTML = '';//empty the list
        ble.scan([LIGHT_SERVICE], 5, app.onDiscoverDevice, app.onError);
    },
    onDiscoverDevice: function(device){
        var listItem = document.createElement('li');
        listItem.innerHTML = device.name + '<br/>' + device.id + '<br/>' + 'RSSI: ' + device.rssi;
        listItem.dataset.deviceId = device.id;
        deviceList.appendChild(listItem);
    },
    showMainPage: function(){
        mainPage.hidden = false;
        detailPage.hidden = true;
    },
    showDetailPage: function(){
        mainPage.hidden = true;
        detailPage.hidden = false;
    },
    connect: function(e){
        var deviceId = e.target.dataset.deviceId;
        alert(deviceId);
        ble.connect(deviceId, app.onConnect, app.onError);
    },
    onConnect: function(peripheral){
        // var pre = document.querySelector('pre');
        // pre.innerHTML = JSON.stringify(peripheral,null,2);
        app.peripheral = peripheral;
        app.showDetailPage();

        var failure = function(reason){
            navigator.notification.alert(reason, null, "Light Error");
        };
        //subscribe to be notified when the light state changes
        ble.startNotification(
            peripheral.id,
            LIGHT_SERVICE,
            LIGHT_CHARACTERISTIC,
            app.onLightChange,
            failure
            );

        //read the inital value
        ble.read(
            peripheral.id,
            LIGHT_SERVICE,
            LIGHT_CHARACTERISTIC,
            app.onLightChange,
            failure
            );
    },
   onLightChange: function(buffer){
    var data = new Float32Array(buffer);
    var lightAmount = data[0];
    console.log('light amount is ' + lightAmount);
    var message = "Light amount is " + lightAmount + " units.";
    statusDiv.innerHTML = message;
   },
    switchOn: function(){
        app.setSwitchValue(1);
    },
    switchOff: function(){
        app.setSwitchValue(0);
    },
    setSwitchValue: function(value){
        var success = function(){
            console.log('Set switch value to ' + value);
        };
        if (app.peripheral && app.peripheral.id){
            var data = new Uint8Array(1);
            data[0] = value;
            ble.write(
                app.peripheral.id,LIGHT_SERVICE,BUZZER_CHARACTERISTIC,data.buffer,success,app.onError
                );
        }
    },

    disconnect: function(e){
        if (app.peripheral && app.peripheral.id){
            ble.disconnect(app.peripheral.id, app.showMainPage, app.onError);
        }
    },
   
    onError: function(reason){
        navigator.notification.alert(reason,app.showMainPage,'Error');
    }
};

app.initialize();
