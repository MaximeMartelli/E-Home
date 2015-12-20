 /*************************************************************************************/
/*************************************************************************************/
/*                   PROJET IOT / GROUPE AGIR / EISE5 2015-2016                      */
/*************************************************************************************/
/*************************************************************************************/

/*************************************************************************************/
/*************************************************************************************/
/*                            BIBLIOTHEQUES ET HEADER                                */
/*************************************************************************************/
/*************************************************************************************/ 

#include "mbed.h"
#include "rtos.h"
#include "DHT11.h"
#include "BMP180.h"
#include "SoftPWM.h"
#include "apds9960.h"
#include "configuration.h"
 
/*************************************************************************************/
/*************************************************************************************/
/*                             VARIABLES GLOBALES                                    */
/*************************************************************************************/
/*************************************************************************************/ 

apds9960        sensor(PIN_MOUVEMENT_SENSOR_SDA,PIN_MOUVEMENT_SENSOR_SCL);
InterruptIn     interrupt(PIN_MOUVEMENT_SENSOR_INTERRUPTION);
Serial          bluetooth(PIN_BLE_TX, PIN_BLE_RX);
Serial          pc(USBTX, USBRX);
Semaphore       two_slots(1);
Ticker          timer;

Informations    inf = {0,0,0,0,0,0};
bool intFlag = false;

/*************************************************************************************/
/*************************************************************************************/
/*                                FONCTION MAIN                                      */
/*************************************************************************************/
/*************************************************************************************/

int main (void) {

    Thread t1(thread_temperature, (void *)"Thread temperature");
    Thread t2(thread_pression   , (void *)"Thread pression");
    Thread t3(thread_presence   , (void *)"Thread presence");
    Thread t4(thread_led        , (void *)"Thread Led");
    
    RtosTimer BleSend(bleCallBack, osTimerPeriodic, (void *)"Ble emission");
    BleSend.start(TIME_MS_PERIODE_BLE);
    
    potAndPwm();
}

/*************************************************************************************/
/*************************************************************************************/
/*                              THREAD TEMPERATURE                                   */
/*************************************************************************************/
/*************************************************************************************/

void thread_temperature(void const *name) {

    DHT11 capteur(PIN_TEMPERATURE_HUMIDITY_SENSOR);
    int tmp;

    while (true) {
        printf("%s\n\r", (const char*)name);
        tmp = capteur.readData();

        if (tmp != DHT11::OK) {
            printf("Error! %d\r\n",tmp);
        }
        else {
            inf.temperature_01 = capteur.readTemperature();
            inf.humidite = capteur.readHumidity();
            printf("Temperature: %d, Humidity: %d\r\n", capteur.readTemperature(), capteur.readHumidity());
        }

        Thread::wait(TIME_WAIT_MS_TEMPERATURE_HUMIDITY_SENSOR);
    } 
}

/*************************************************************************************/
/*************************************************************************************/
/*                                   THREAD LED                                      */
/*************************************************************************************/
/*************************************************************************************/

void thread_led(void const *name) {
    DigitalOut tab[] = {PIN_MUX_P0, PIN_MUX_P1, PIN_MUX_P2};
    
    while (true) {
        printf("%s\n\r", (const char*)name);
        
        //printf("000 \n\r");
        tab[0] = LED_OFF; tab[1] = LED_OFF; tab[2] = LED_OFF;
        Thread::wait( TIME_WAIT_BLINK_LED );
          
        //printf("100 \n\r");       
        tab[0] = LED_ON; tab[1] = LED_OFF; tab[2] = LED_OFF;
        Thread::wait( TIME_WAIT_BLINK_LED );

        //printf("010 \n\r"); 
        tab[0] = LED_OFF; tab[1] = LED_ON; tab[2] = LED_OFF;
        Thread::wait( TIME_WAIT_BLINK_LED );
 
        //printf("110 \n\r"); 
        tab[0] = LED_ON; tab[1] = LED_ON; tab[2] = LED_OFF;
        Thread::wait( TIME_WAIT_BLINK_LED );
     
        //printf("001 \n\r"); 
        tab[0] = LED_OFF; tab[1] = LED_OFF; tab[2] = LED_ON;
        Thread::wait( TIME_WAIT_BLINK_LED );
   
        //printf("101 \n\r"); 
        tab[0] = LED_ON; tab[1] = LED_OFF; tab[2] = LED_ON;
        Thread::wait( TIME_WAIT_BLINK_LED );
          
        //printf("011 \n\r"); 
        tab[0] = LED_OFF; tab[1] = LED_ON; tab[2] = LED_ON;
        Thread::wait( TIME_WAIT_BLINK_LED );
    }
}

/*************************************************************************************/
/*************************************************************************************/
/*                               THREAD PRESSION                                     */
/*************************************************************************************/
/*************************************************************************************/

void thread_pression(void const *name) {
    long temp       = 0;
    long pressure   = 0;
    int  error      = 0;
    BMP180 bmp180(PIN_PRESURE_SENSOR_SDA, PIN_PRESURE_SENSOR_SCL);
    
    while (true) {
        two_slots.wait();
        
        printf("%s\n\r", (const char*)name);
        error = bmp180.readTP(&temp,&pressure,OVERSAMPLING_ULTRA_HIGH_RESOLUTION);
        
        two_slots.release();
                
        if (error){
            printf("Error is %d\r\n\r\n",error); 
        }
        else {
            inf.temperature_02 = temp;
            inf.pression = pressure;
            printf("Temp is %d \r\n",(temp));
            printf("Pressure is %ld\r\n",pressure);
        }

        Thread::wait(TIME_WAIT_MS_PRESURE_SENSOR);
    } 
}

/*************************************************************************************/
/*************************************************************************************/
/*                                THREAD PRESENCE                                    */
/*************************************************************************************/
/*************************************************************************************/
  
void trigger() {    
//    pc.printf("triggered\n\r");
    intFlag = true;
}

void printGesture(int gesture) {
    switch ( gesture ) {
        case DIR_UP:
            pc.printf("UP\n\r");
            break;
        case DIR_DOWN:
            pc.printf("DOWN\n\r");
            break;
        case DIR_LEFT:
            pc.printf("LEFT\n\r");
            break;
        case DIR_RIGHT:
            pc.printf("RIGHT\n\r");
            break;
        case DIR_NEAR:
            pc.printf("NEAR\n\r");
            break;
        case DIR_FAR:
            pc.printf("FAR\n\r");
            break;
        default:
            pc.printf("NONE\n\r");
    }
}

int getGesture() {

    if(sensor.isGestureAvailable()) {
            pc.printf("Gesture Available!\n\r");
        // Process it.
        
            switch ( sensor.readGesture() ) {

            case DIR_RIGHT: 
                    inf.mouvement = 2; 
                    return 2;
            case DIR_LEFT : 
                    inf.mouvement = 3; 
                    return 3;
            case DIR_DOWN : 
                    inf.mouvement = 4; 
                    return 4;
            case DIR_UP   :
                    inf.mouvement = 5; 
                    return 5;
            case DIR_NEAR : 
                    inf.mouvement = 6; 
                    return 6;
            case DIR_FAR  : 
                    inf.mouvement = 7; 
                    return 7;
            default: 
                    inf.mouvement = 1; 
                    return 1;
        }
    }
    return DIR_NONE;
    //return 0;
}
  

void thread_presence(void const *name) {
    
    printf("%s\n\r", (const char*)name);
    
    two_slots.wait();
    while(!sensor.ginit(pc)){
        printf("Something went wrong during APDS-9960 init\n\r");
        Thread::wait(TIME_WAIT_MS_INITIALISATION_FAILURE);
    }
    printf("APDS-9960 initialization complete\n\r");
        
    // Start running the APDS-9960 gesture sensor engine    
    while(!sensor.enableGestureSensor(true)){
        printf("Something went wrong during gesture sensor init!\n\r");
        Thread::wait(TIME_WAIT_MS_INITIALISATION_FAILURE);
    }
    printf("Gesture sensor is now running\n\r");
    two_slots.release();
 
    interrupt.fall(&trigger);
           
    while(1) {
        // when interrupt trigerred, flag is set.
        if(intFlag) {
            
            two_slots.wait();
            printGesture(getGesture());
            two_slots.release();
            
            // Clean interrupt handler flag.
            intFlag = false;
        }
            
        // Do somethings else
        wait_ms(TIME_WAIT_MS_MOUVEMENT_SENSOR);
    }
}

/*************************************************************************************/
/*************************************************************************************/
/*                                     BLE                                           */
/*************************************************************************************/
/*************************************************************************************/

void bleCallBack(void const *name) {
    printf("%s\n\r", (const char*)name);
    
    printf(" tmp 01      : %3d \n",inf.temperature_01);
    printf(" tmp 02      : %3d \n",inf.temperature_02);
    printf(" humidite    : %3d \n",inf.humidite);
    printf(" pression    : %6ld \n",inf.pression);
    printf(" luminosite  : %3d \n",inf.luminosite);
    printf(" Mouvement   : %1d \n",inf.mouvement);
        
    bluetooth.printf("%3d%3d%3d%6ld%3d%1d"  ,inf.temperature_01
                                            ,inf.humidite
                                            ,inf.temperature_02
                                            ,inf.pression
                                            ,inf.luminosite
                                            ,inf.mouvement);
                                            
    inf.mouvement = 0;
}

/*************************************************************************************/
/*************************************************************************************/
/*                                   POT & PWM                                       */
/*************************************************************************************/
/*************************************************************************************/

void potAndPwm()
{
    AnalogIn pot(PIN_POTENTIOMETRE);
    SoftPWM led = PIN_PWM_LED;
    
    led.period_ms(PWM_PERIODE_MS);
    
    while (true)   {
        if(pot.read() < PWM_VALUE_MIN){
            led = PWM_LED_OFF;
            inf.luminosite = 0;
        }
        else if (pot.read()> PWM_VALUE_MAX){
            led = PWM_LED_ON;
            inf.luminosite = 100;
        }
        else {
            led = pot.read(); 
            inf.luminosite = pot.read()*100;
        }       
    }
}

/*************************************************************************************/
/*************************************************************************************/
/*                                  FIN PROGRAMME                                    */
/*************************************************************************************/
/*************************************************************************************/