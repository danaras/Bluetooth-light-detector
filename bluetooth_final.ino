// Broadcast Temperature in Advertising Data

#include <SPI.h>
#include <BLEPeripheral.h>

// define pins (varies per shield/board)
// https://github.com/sandeepmistry/arduino-BLEPeripheral#pinouts
// Blend
#define BLE_REQ 9
#define BLE_RDY 8
#define BLE_RST 5

BLEPeripheral blePeripheral = BLEPeripheral(BLE_REQ, BLE_RDY, BLE_RST);
BLEService lightService = BLEService("BBC0");
BLEFloatCharacteristic lightCharacteristic = BLEFloatCharacteristic("BBC1", BLERead | BLENotify | BLEBroadcast);
BLECharCharacteristic buzzerCharacteristic = BLECharCharacteristic("BBC2", BLEWrite); 
BLEDescriptor lightDescriptor = BLEDescriptor("2901", "amount of light");
BLEDescriptor buzzerDescriptor = BLEDescriptor("2901", "Buzzer status");

//#define TEMPERATURE_PIN A0 // RedBear Blend
//#define TEMPERATURE_PIN A4 // RedBear Nano
#define LIGHT_PIN 2  // RFduino
#define BUZZER_PIN 6

long previousMillis = 0;  // will store last time temperature was updated
long interval = 2000;     // interval at which to read temperature (milliseconds)
void setup()
{
  Serial.begin(9600);
  Serial.println(F("Bluetooth Low Energy Light Detector"));
  
  // set advertised name and service
  blePeripheral.setLocalName("lIGHT");
  blePeripheral.setDeviceName("LIGHT");
  blePeripheral.setAdvertisedServiceUuid(lightService.uuid());

  // add service and characteristic
  blePeripheral.addAttribute(lightService);
  blePeripheral.addAttribute(lightCharacteristic);
  blePeripheral.addAttribute(lightDescriptor);
  blePeripheral.addAttribute(buzzerCharacteristic);
  blePeripheral.addAttribute(buzzerDescriptor);

  buzzerCharacteristic.setEventHandler(BLEWritten, buzzerCharacteristicWritten);
  
  blePeripheral.begin();

  lightCharacteristic.broadcast();

  
}

void loop()
{
  // Tell the bluetooth radio to do whatever it should be working on
  blePeripheral.poll();
  //digitalWrite(1,HIGH);
  
  // limit how often we read the sensor
  if(millis() - previousMillis > interval) {
     int light = analogRead(LIGHT_PIN);
      if (lightCharacteristic.value() != light) {
      lightCharacteristic.setValue(light);
      Serial.println(light);
      } 
    previousMillis = millis();
  }
}

void buzzerCharacteristicWritten(BLECentral& central, BLECharacteristic& characteristic){

   Serial.print(F("Characteristic event, written: "));

  if (buzzerCharacteristic.value()) {
    Serial.println(F("Buzzer on"));
    digitalWrite(BUZZER_PIN, 1);
    
  } else {
    Serial.println(F("Buzzer off"));
    digitalWrite(BUZZER_PIN, 0);
    
  }
}

